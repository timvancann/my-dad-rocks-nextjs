'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MetronomeEngine, MetronomeTickEvent } from '@/lib/metronome';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Pause, Play, Volume2, VolumeX, Eye, EyeOff, Waves, RefreshCw } from 'lucide-react';

type MetronomePanelProps = {
  bpm: number;
  beatsPerMeasure?: number;
  onVisualTick?: (event: MetronomeTickEvent) => void;
  onVisualModeChange?: (enabled: boolean) => void;
  visualEnabled?: boolean;
};

const MIN_BPM = 40;
const MAX_BPM = 260;

export function MetronomePanel({ bpm, beatsPerMeasure = 4, onVisualTick, onVisualModeChange, visualEnabled }: MetronomePanelProps) {
  const engineRef = useRef<MetronomeEngine | null>(null);
  const subscriptionRef = useRef<(() => void) | null>(null);

  const [currentBpm, setCurrentBpm] = useState(Math.round(bpm));
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudible, setIsAudible] = useState(true);
  const [isVisual, setIsVisual] = useState(visualEnabled ?? true);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [beatsInMeasure, setBeatsInMeasure] = useState(Math.max(1, beatsPerMeasure));
  const [volume, setVolume] = useState(0.5);

  const isVisualRef = useRef(isVisual);
  const onVisualTickRef = useRef(onVisualTick);
  const isControlled = typeof visualEnabled === 'boolean';

  const disposeEngine = useCallback(() => {
    subscriptionRef.current?.();
    subscriptionRef.current = null;
    engineRef.current?.dispose();
    engineRef.current = null;
  }, []);

  const ensureEngine = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = new MetronomeEngine({ bpm: currentBpm, beatsPerMeasure: beatsInMeasure, volume });
      engineRef.current.setAudible(isAudible);
    }
    return engineRef.current;
  }, [currentBpm, beatsInMeasure, volume, isAudible]);

  const subscribeToTicks = useCallback(() => {
    const engine = ensureEngine();
    subscriptionRef.current?.();
    subscriptionRef.current = engine.subscribe((event) => {
      setCurrentBeat(event.beat);
      if (isVisualRef.current) {
        onVisualTickRef.current?.(event);
      }
    });
  }, [ensureEngine]);

  const handleStartStop = useCallback(() => {
    const engine = ensureEngine();

    if (engine.isPlaying()) {
      engine.stop();
      subscriptionRef.current?.();
      subscriptionRef.current = null;
      setIsPlaying(false);
      setCurrentBeat(0);
      return;
    }

    engine.setBpm(currentBpm);
    engine.setBeatsPerMeasure(beatsInMeasure);
    engine.setAudible(isAudible);
    engine.setVolume(volume);
    engine.start();
    subscribeToTicks();
    setIsPlaying(true);
  }, [ensureEngine, currentBpm, beatsInMeasure, isAudible, volume, subscribeToTicks]);

  const handleBpmChange = useCallback(
    (nextBpm: number) => {
      const clamped = Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(nextBpm)));
      setCurrentBpm(clamped);
      ensureEngine().setBpm(clamped);
    },
    [ensureEngine]
  );

  const handleBeatsChange = useCallback(
    (nextBeats: number) => {
      const sanitized = Math.max(1, Math.min(12, Math.round(nextBeats)));
      setBeatsInMeasure(sanitized);
      ensureEngine().setBeatsPerMeasure(sanitized);
      setCurrentBeat(0);
    },
    [ensureEngine]
  );

  const toggleAudible = useCallback(() => {
    setIsAudible((prev) => {
      const next = !prev;
      ensureEngine().setAudible(next);
      return next;
    });
  }, [ensureEngine]);

  const toggleVisual = useCallback(() => {
    const currentValue = isControlled ? (visualEnabled as boolean) : isVisual;
    const next = !currentValue;

    if (!isControlled) {
      setIsVisual(next);
    }

    onVisualModeChange?.(next);
  }, [isControlled, isVisual, onVisualModeChange, visualEnabled]);

  const handleVolumeChange = useCallback(
    (nextVolume: number) => {
      const normalized = Math.min(1, Math.max(0, nextVolume));
      setVolume(normalized);
      ensureEngine().setVolume(normalized);
    },
    [ensureEngine]
  );

  useEffect(() => {
    setCurrentBpm(Math.round(bpm));
    ensureEngine().setBpm(Math.round(bpm));
  }, [bpm, ensureEngine]);

  useEffect(() => {
    setBeatsInMeasure(Math.max(1, beatsPerMeasure));
  }, [beatsPerMeasure]);

  useEffect(() => {
    ensureEngine().setBeatsPerMeasure(beatsInMeasure);
  }, [beatsInMeasure, ensureEngine]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }
    if (!engineRef.current?.isPlaying()) {
      setIsPlaying(false);
    }
  }, [isPlaying]);

  useEffect(() => {
    isVisualRef.current = isVisual;
    if (!isControlled) {
      onVisualModeChange?.(isVisual);
    }
  }, [isControlled, isVisual, onVisualModeChange]);

  useEffect(() => {
    if (isControlled) {
      const next = visualEnabled as boolean;
      setIsVisual(next);
      isVisualRef.current = next;
    }
  }, [isControlled, visualEnabled]);

  useEffect(() => {
    onVisualTickRef.current = onVisualTick;
  }, [onVisualTick]);

  useEffect(() => {
    return () => {
      disposeEngine();
    };
  }, [disposeEngine]);

  const beatIndicators = useMemo(() => {
    return Array.from({ length: beatsInMeasure }).map((_, idx) => {
      const isActive = idx === currentBeat && isPlaying;
      const isAccent = idx === 0;
      return (
        <div
          key={idx}
          className={cn(
            'h-2 w-[18px] rounded-full transition-all duration-150',
            isActive ? (isAccent ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.95)] scale-105' : 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.65)]') : 'bg-white/15'
          )}
        />
      );
    });
  }, [currentBeat, isPlaying, beatsInMeasure]);

  return (
    <div className="pointer-events-auto w-full max-w-sm rounded-3xl border border-white/10 bg-black/65 p-5 text-white shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Metronome</p>
          <div className="mt-1 flex items-end gap-2">
            <span className="text-4xl font-semibold leading-none">{currentBpm}</span>
            <span className="pb-[2px] text-sm font-medium uppercase tracking-widest text-white/50">BPM</span>
          </div>
        </div>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleStartStop}
          className={cn(
            'h-12 w-12 rounded-full border border-white/10 bg-white/10 text-white transition-colors',
            isPlaying ? 'hover:bg-rose-600/80' : 'hover:bg-emerald-500/80'
          )}
          title={isPlaying ? 'Stop metronome' : 'Start metronome'}
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </Button>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/45">
          <span>Tempo</span>
          <button
            type="button"
            className="flex items-center gap-1 text-white/55 transition-colors hover:text-white"
            onClick={() => handleBpmChange(bpm)}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
        <input
          type="range"
          min={MIN_BPM}
          max={MAX_BPM}
          value={currentBpm}
          onChange={(event) => handleBpmChange(Number(event.target.value))}
          className="mt-3 w-full accent-rose-500"
        />
        <div className="mt-3 flex items-center justify-between text-sm text-white/70">
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full" onClick={() => handleBpmChange(currentBpm - 1)}>
              -
            </Button>
            <input
              type="number"
              value={currentBpm}
              onChange={(event) => handleBpmChange(Number(event.target.value))}
              className="w-16 rounded-md bg-black/40 py-1 text-center text-lg font-semibold text-white outline-none ring-1 ring-white/10 focus:ring-rose-500"
            />
            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full" onClick={() => handleBpmChange(currentBpm + 1)}>
              +
            </Button>
          </div>

          <label className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/55">
            <Waves className="h-4 w-4" />
            <select
              value={beatsInMeasure}
              onChange={(event) => {
                const beats = Number(event.target.value);
                handleBeatsChange(beats);
              }}
              className="rounded-lg bg-black/40 px-2 py-1 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-rose-500/60"
            >
              {[2, 3, 4, 5, 6, 7, 8, 9, 12].map((value) => (
                <option key={value} value={value}>
                  {value}/4
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleAudible}
          className={cn(
            'flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-[0.25em] text-white/70 transition-all',
            isAudible ? 'ring-2 ring-emerald-400/70 text-white' : 'hover:text-white'
          )}
        >
          {isAudible ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          Audio
        </Button>
        <div className="flex flex-1 items-center gap-3 pl-4">
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(event) => handleVolumeChange(Number(event.target.value))}
            disabled={!isAudible}
            className="w-full accent-emerald-400 disabled:opacity-40"
          />
          <span className="w-10 text-right text-sm font-medium text-white/70">{Math.round(volume * 100)}%</span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleVisual}
          className={cn(
            'flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-[0.25em] text-white/70 transition-all',
            isVisual ? 'ring-2 ring-sky-400/70 text-white' : 'hover:text-white'
          )}
        >
          {isVisual ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          Visual
        </Button>

        <div className="flex flex-1 items-center justify-end gap-1.5">
          {beatIndicators}
        </div>
      </div>
    </div>
  );
}
