/**
 * Apple Music Integration
 *
 * Note: Apple Music API requires an Apple Developer account and MusicKit JS.
 * For now, this provides URL scheme support for opening tracks in Apple Music.
 * Full API integration can be added later with proper authentication.
 */

/**
 * Generate Apple Music search URL for a track
 */
export function generateAppleMusicUrl(title: string, artist: string): string {
  // Combine title and artist with spaces, then encode properly
  const searchTerm = `${title} ${artist}`.trim();
  // encodeURIComponent will encode spaces as %20, which is what we want
  const query = encodeURIComponent(searchTerm);
  // Use US as default country (can be customized later)
  return `https://music.apple.com/us/search?term=${query}`;
}

/**
 * Generate Apple Music URL scheme for deep linking (iOS/macOS)
 */
export function generateAppleMusicURLScheme(title: string, artist: string): string {
  const query = encodeURIComponent(`${title} ${artist}`);
  return `music://search?term=${query}`;
}

/**
 * Open track in Apple Music (if available)
 */
export function openInAppleMusic(title: string, artist: string): void {
  if (typeof window === 'undefined') return;

  // Open Apple Music web URL directly (works in all browsers)
  const appleMusicUrl = generateAppleMusicUrl(title, artist);
  window.open(appleMusicUrl, '_blank');
  
  // On iOS/macOS, also try URL scheme for native app (won't work in browser but no harm)
  try {
    const urlScheme = generateAppleMusicURLScheme(title, artist);
    const schemeLink = document.createElement('a');
    schemeLink.href = urlScheme;
    schemeLink.style.display = 'none';
    document.body.appendChild(schemeLink);
    schemeLink.click();
    document.body.removeChild(schemeLink);
  } catch (e) {
    // URL scheme might fail in browser, that's okay
  }
}

