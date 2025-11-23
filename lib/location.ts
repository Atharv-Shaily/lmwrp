export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export async function geocodeAddress(address: string): Promise<LocationCoordinates | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
      address
    )}&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'LiveMart/1.0 (location lookup)',
        Accept: 'application/json',
      },
    });

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      const result = data[0];
      const lat = parseFloat(result.lat);
      const lon = parseFloat(result.lon);

      if (!isNaN(lat) && !isNaN(lon)) {
        return { lat, lng: lon };
      }
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}






