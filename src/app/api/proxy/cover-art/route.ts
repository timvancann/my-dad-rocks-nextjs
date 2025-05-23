import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * This proxy API route fetches cover art from the Cover Art Archive
 * to bypass CORS restrictions when accessing them directly from the client.
 */
export async function GET(req: NextRequest) {
  // Get the release ID from the URL
  const { searchParams } = new URL(req.url);
  const releaseId = searchParams.get('releaseId');
  
  if (!releaseId) {
    return NextResponse.json(
      { error: 'Missing releaseId parameter' },
      { status: 400 }
    );
  }

  try {
    // First approach: Try direct front-250 thumbnail
    const coverArtUrl = `https://coverartarchive.org/release/${releaseId}/front-250`;
    
    // Fetch the image
    const response = await fetch(coverArtUrl, {
      headers: {
        'User-Agent': 'My-Dad-Rocks/1.0.0 (timvancann@gmail.com)',
        'Accept': 'image/jpeg,image/png,image/*'
      },
      // Don't wait too long for the image
      signal: AbortSignal.timeout(5000),
      cache: 'force-cache' // Use cache when possible
    });
    
    if (response.ok) {
      // Verify we actually got an image
      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.startsWith('image/')) {
        // Get the image data
        const imageData = await response.arrayBuffer();
        
        // Check if we got a valid image (at least some content)
        if (imageData.byteLength > 100) {
          // Return the image with appropriate content type
          return new NextResponse(imageData, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
            }
          });
        }
      }
    }
    
    // If we reach here, either:
    // 1. The request failed
    // 2. We didn't get an image content type
    // 3. The image was too small to be valid
    
    // Second approach: Try to fetch from the release endpoint which returns JSON with all images
    try {
      const releaseUrl = `https://coverartarchive.org/release/${releaseId}`;
      const releaseResponse = await fetch(releaseUrl, {
        headers: {
          'User-Agent': 'My-Dad-Rocks/1.0.0 (timvancann@gmail.com)',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(5000),
        cache: 'force-cache' // Use cache when possible
      });
      
      if (releaseResponse.ok) {
        const data = await releaseResponse.json();
        if (data.images && data.images.length > 0) {
          // Find the front image or use the first available
          const frontImage = data.images.find((img: any) => img.front) || data.images[0];
          if (frontImage && frontImage.thumbnails && frontImage.thumbnails['250']) {
            // Fetch the thumbnail directly
            const thumbnailUrl = frontImage.thumbnails['250'];
            const imageResponse = await fetch(thumbnailUrl, {
              headers: {
                'User-Agent': 'My-Dad-Rocks/1.0.0 (timvancann@gmail.com)',
                'Accept': 'image/jpeg,image/png,image/*'
              },
              signal: AbortSignal.timeout(5000),
              cache: 'force-cache' // Use cache when possible
            });
            
            if (imageResponse.ok) {
              const imageData = await imageResponse.arrayBuffer();
              return new NextResponse(imageData, {
                headers: {
                  'Content-Type': imageResponse.headers.get('Content-Type') || 'image/jpeg',
                  'Cache-Control': 'public, max-age=86400'
                }
              });
            }
          }
        }
      }
    } catch (jsonError) {
      console.error('Error fetching release JSON:', jsonError);
    }
    
    // Third approach: Try MusicBrainz API image service
    try {
      // MusicBrainz has a cover art service that sometimes works when CoverArtArchive fails
      const mbCoverUrl = `https://coverartarchive.org/release/${releaseId}`;
      const mbResponse = await fetch(mbCoverUrl, {
        headers: {
          'User-Agent': 'My-Dad-Rocks/1.0.0 (timvancann@gmail.com)',
          'Accept': 'image/jpeg,image/png,image/*'
        },
        signal: AbortSignal.timeout(5000),
        cache: 'force-cache'
      });
      
      if (mbResponse.ok) {
        const contentType = mbResponse.headers.get('Content-Type');
        if (contentType && contentType.startsWith('image/')) {
          const imageData = await mbResponse.arrayBuffer();
          if (imageData.byteLength > 100) {
            return new NextResponse(imageData, {
              headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
              }
            });
          }
        }
      }
    } catch (mbError) {
      console.error('Error with MusicBrainz cover art fallback:', mbError);
    }
    
    // Final fallback: return a placeholder image
    return NextResponse.redirect(new URL('/images/no-cover.svg', request.nextUrl.origin).toString());
  } catch (error) {
    console.error('Error fetching cover art:', error);
    // Redirect to our local placeholder for any errors
    return NextResponse.redirect(new URL('/images/no-cover.svg', request.nextUrl.origin).toString());
  }
}