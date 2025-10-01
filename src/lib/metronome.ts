export type MetronomeTickEvent = {
  beat: number;
  totalBeats: number;
  isAccent: boolean;
  scheduledTime: number;
};

type Subscriber = (event: MetronomeTickEvent) => void;

type MetronomeOptions = {
  bpm: number;
  beatsPerMeasure?: number;
  volume?: number;
};

const DEFAULT_LOOKAHEAD_MS = 25;
const DEFAULT_SCHEDULE_AHEAD_SEC = 0.1;

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

const canUseDOM = () => typeof window !== 'undefined';

let sharedAudioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!canUseDOM()) {
    return null;
  }

  if (sharedAudioContext) {
    return sharedAudioContext;
  }

  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) {
    return null;
  }

  sharedAudioContext = new AudioContextCtor();
  return sharedAudioContext;
};

export class MetronomeEngine {
  private audioContext: AudioContext | null;
  private masterGain: GainNode | null;
  private bpm: number;
  private beatsPerMeasure: number;
  private intervalSeconds: number;
  private schedulerId: number | null = null;
  private isRunning = false;
  private nextNoteTime = 0;
  private currentBeat = 0;
  private readonly lookahead = DEFAULT_LOOKAHEAD_MS;
  private readonly scheduleAheadTime = DEFAULT_SCHEDULE_AHEAD_SEC;
  private subscribers = new Set<Subscriber>();
  private notifyTimers: number[] = [];
  private audible = true;
  private volume = 0.5;

  constructor({ bpm, beatsPerMeasure = 4, volume = 0.5 }: MetronomeOptions) {
    this.bpm = bpm;
    this.beatsPerMeasure = beatsPerMeasure;
    this.intervalSeconds = 60 / this.bpm;

    this.audioContext = getAudioContext();
    this.masterGain = this.audioContext ? this.audioContext.createGain() : null;

    if (this.masterGain && this.audioContext) {
      this.masterGain.gain.value = volume;
      this.masterGain.connect(this.audioContext.destination);
      this.volume = volume;
    }
  }

  private ensureAudioContext() {
    if (!canUseDOM()) {
      return;
    }

    if (!this.audioContext) {
      this.audioContext = getAudioContext();
      if (this.audioContext) {
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = this.volume;
        this.masterGain.connect(this.audioContext.destination);
      }
    }
  }

  private scheduleTick(beatNumber: number, time: number) {
    if (this.audioContext && this.masterGain && this.audible) {
      const osc = this.audioContext.createOscillator();
      const envelope = this.audioContext.createGain();

      const isAccent = beatNumber === 0;
      const frequency = isAccent ? 1500 : 1000;
      const duration = 0.1;

      osc.frequency.setValueAtTime(frequency, time);
      osc.type = 'square';

      envelope.gain.setValueAtTime(0, time);
      envelope.gain.linearRampToValueAtTime(this.volume, time + 0.005);
      envelope.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(envelope);
      envelope.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + duration);
    }

    this.notifySubscribers({
      beat: beatNumber,
      totalBeats: this.beatsPerMeasure,
      isAccent: beatNumber === 0,
      scheduledTime: time
    });
  }

  private notifySubscribers(event: MetronomeTickEvent) {
    const currentTime = this.audioContext?.currentTime ?? 0;
    const delayMs = Math.max(0, (event.scheduledTime - currentTime) * 1000);

    this.subscribers.forEach((subscriber) => {
      const timer = window.setTimeout(() => subscriber(event), delayMs);
      this.notifyTimers.push(timer);
    });
  }

  private advanceNote() {
    const secondsPerBeat = this.intervalSeconds;
    this.nextNoteTime += secondsPerBeat;
    this.currentBeat = (this.currentBeat + 1) % this.beatsPerMeasure;
  }

  private scheduler = () => {
    if (!this.audioContext || !this.isRunning) {
      return;
    }

    while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      this.scheduleTick(this.currentBeat, this.nextNoteTime);
      this.advanceNote();
    }

    this.schedulerId = window.setTimeout(this.scheduler, this.lookahead);
  };

  private clearTimers() {
    this.notifyTimers.forEach((timer) => window.clearTimeout(timer));
    this.notifyTimers = [];
  }

  start() {
    if (this.isRunning) {
      return;
    }

    this.ensureAudioContext();

    if (!this.audioContext) {
      console.warn('Metronome: AudioContext not available.');
      return;
    }

    this.audioContext.resume().catch((err) => {
      console.error('Metronome: Failed to resume AudioContext', err);
    });

    this.isRunning = true;
    this.currentBeat = 0;
    this.nextNoteTime = this.audioContext.currentTime + 0.05;
    this.clearTimers();
    this.scheduler();
  }

  stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.schedulerId !== null) {
      window.clearTimeout(this.schedulerId);
      this.schedulerId = null;
    }
    this.clearTimers();
    this.currentBeat = 0;
  }

  setBpm(bpm: number) {
    this.bpm = bpm;
    this.intervalSeconds = 60 / this.bpm;

    if (this.isRunning && this.audioContext) {
      this.currentBeat = 0;
      this.nextNoteTime = this.audioContext.currentTime + 0.05;
    }
  }

  setBeatsPerMeasure(beats: number) {
    this.beatsPerMeasure = Math.max(1, beats);
    this.currentBeat = 0;
  }

  setAudible(audible: boolean) {
    this.audible = audible;
  }

  setVolume(volume: number) {
    this.volume = Math.min(1, Math.max(0, volume));
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.volume, this.audioContext?.currentTime ?? 0);
    }
  }

  isPlaying() {
    return this.isRunning;
  }

  subscribe(subscriber: Subscriber) {
    this.subscribers.add(subscriber);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  dispose() {
    this.stop();
    this.subscribers.clear();
    if (this.masterGain) {
      this.masterGain.disconnect();
      this.masterGain = null;
    }
    if (this.audioContext) {
      // We intentionally do not close the context to avoid issues with browsers limiting contexts.
      this.audioContext = null;
    }
  }
}
