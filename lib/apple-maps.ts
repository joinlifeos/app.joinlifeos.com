/**
 * Apple Maps Integration
 *
 * This module provides URL scheme support for opening locations in Apple Maps.
 */

/**
 * Generate Apple Maps URL for a location
 */
export function generateAppleMapsUrl(
  name: string,
  address: string,
  coordinates?: { latitude: number; longitude: number }
): string {
  if (coordinates) {
    return `https://maps.apple.com/?ll=${coordinates.latitude},${coordinates.longitude}&q=${encodeURIComponent(name)}`;
  }
  const query = encodeURIComponent(`${name} ${address}`);
  return `https://maps.apple.com/?q=${query}`;
}

/**
 * Generate Apple Maps URL scheme for deep linking (iOS/macOS)
 */
export function generateAppleMapsURLScheme(
  name: string,
  address: string,
  coordinates?: { latitude: number; longitude: number }
): string {
  if (coordinates) {
    return `maps://maps.apple.com/?ll=${coordinates.latitude},${coordinates.longitude}&q=${encodeURIComponent(name)}`;
  }
  const query = encodeURIComponent(`${name} ${address}`);
  return `maps://maps.apple.com/?q=${query}`;
}

/**
 * Open location in Apple Maps
 */
export function openInAppleMaps(
  name: string,
  address: string,
  coordinates?: { latitude: number; longitude: number }
): void {
  if (typeof window === 'undefined') return;

  // Try URL scheme first (iOS/macOS)
  const urlScheme = generateAppleMapsURLScheme(name, address, coordinates);
  const schemeLink = document.createElement('a');
  schemeLink.href = urlScheme;
  schemeLink.style.display = 'none';
  document.body.appendChild(schemeLink);
  schemeLink.click();
  document.body.removeChild(schemeLink);

  // Fallback to web URL
  setTimeout(() => {
    window.open(generateAppleMapsUrl(name, address, coordinates), '_blank');
  }, 1000);
}

