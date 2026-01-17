import * as ffmpegModule from 'fluent-ffmpeg';
import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';

// Handle both ESM and CommonJS module exports
const ffmpeg = (ffmpegModule as unknown as { default: typeof ffmpegModule.default }).default || ffmpegModule;
const ffmpegPath = (ffmpegInstaller as unknown as { default: { path: string } }).default || ffmpegInstaller;

// Set the ffmpeg path from the installer package
ffmpeg.setFfmpegPath(ffmpegPath.path);

export interface CompressionOptions {
  /** Audio bitrate in kbps (default: 128) */
  bitrate?: number;
  /** Output format (default: 'mp3') */
  format?: 'mp3' | 'aac' | 'ogg';
}

export interface CompressionResult {
  /** Compressed audio data as Buffer */
  buffer: Buffer;
  /** MIME type of the compressed audio */
  contentType: string;
  /** File extension for the compressed audio */
  extension: string;
  /** Original file size in bytes */
  originalSize: number;
  /** Compressed file size in bytes */
  compressedSize: number;
  /** Compression ratio (original / compressed) */
  compressionRatio: number;
}

const FORMAT_MIME_TYPES: Record<string, string> = {
  mp3: 'audio/mpeg',
  aac: 'audio/aac',
  ogg: 'audio/ogg',
};

/**
 * Compress an audio file to reduce file size while maintaining reasonable quality.
 * Uses FFmpeg to transcode to the specified format and bitrate.
 *
 * @param inputBuffer - The input audio file as a Buffer
 * @param originalFilename - Original filename (used to determine input format)
 * @param options - Compression options
 * @returns CompressionResult with the compressed buffer and metadata
 */
export async function compressAudio(
  inputBuffer: Buffer,
  originalFilename: string,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const { bitrate = 128, format = 'mp3' } = options;

  // Create a unique temp directory for this operation
  const tempDir = join(tmpdir(), `stem-compress-${randomUUID()}`);
  await mkdir(tempDir, { recursive: true });

  // Determine input extension from filename
  const inputExtension = originalFilename.split('.').pop()?.toLowerCase() || 'wav';
  const inputPath = join(tempDir, `input.${inputExtension}`);
  const outputPath = join(tempDir, `output.${format}`);

  try {
    // Write input buffer to temp file
    await writeFile(inputPath, inputBuffer);

    // Compress using FFmpeg
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .audioBitrate(bitrate)
        .audioChannels(2) // Stereo
        .audioFrequency(44100) // Standard sample rate
        .format(format)
        .on('error', (err: Error) => {
          console.error('FFmpeg error:', err);
          reject(new Error(`Audio compression failed: ${err.message}`));
        })
        .on('end', () => {
          resolve();
        })
        .save(outputPath);
    });

    // Read the compressed output
    const compressedBuffer = await readFile(outputPath);

    const originalSize = inputBuffer.length;
    const compressedSize = compressedBuffer.length;

    return {
      buffer: compressedBuffer,
      contentType: FORMAT_MIME_TYPES[format],
      extension: format,
      originalSize,
      compressedSize,
      compressionRatio: originalSize / compressedSize,
    };
  } finally {
    // Clean up temp files
    try {
      await rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Check if FFmpeg is available and working
 */
export async function checkFfmpegAvailability(): Promise<boolean> {
  return new Promise((resolve) => {
    ffmpeg.getAvailableFormats((err) => {
      if (err) {
        console.error('FFmpeg not available:', err);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}
