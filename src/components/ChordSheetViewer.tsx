'use client';

import ChordSheetJS from 'chordsheetjs';

interface ChordSheetViewerProps {
  lyrics: string;
  className?: string;
  style?: React.CSSProperties;
}

export function ChordSheetViewer({ lyrics, className = '', style }: ChordSheetViewerProps) {
  if (!lyrics) return null;

  try {
    const parser = new ChordSheetJS.ChordProParser();
    const song = parser.parse(lyrics);
    const formatter = new ChordSheetJS.HtmlDivFormatter();
    const html = formatter.format(song);

    return (
      <div
        className={`lyrics-viewer ${className}`}
        style={style}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch (error) {
    return (
      <div className="lyrics-viewer-error">
        <p className="text-destructive mb-2">Error parsing chords, displaying as plain text:</p>
        <pre className="text-sm whitespace-pre-wrap">
          {lyrics}
        </pre>
      </div>
    );
  }
}