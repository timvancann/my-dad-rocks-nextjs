import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { files } = await request.json();

    if (!files || !Array.isArray(files)) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const results = [];

    for (const file of files) {
      try {
        // Convert URL to file path
        // URLs like '/uploads/covers/filename.jpg' -> 'public/uploads/covers/filename.jpg'
        const filePath = join(process.cwd(), 'public', file.url);
        
        await unlink(filePath);
        results.push({ url: file.url, status: 'deleted' });
        console.log(`Deleted file: ${filePath}`);
      } catch (error) {
        console.error(`Error deleting file ${file.url}:`, error);
        results.push({ 
          url: file.url, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return NextResponse.json({ results });

  } catch (error) {
    console.error('Delete files error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}