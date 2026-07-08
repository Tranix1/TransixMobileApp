export function calculateRatePerKm(
  price: number,
  distanceKm: number | string
): number {
  if (!price || !distanceKm) {
    return 0;
  }

  const distance = typeof distanceKm === "string"
    ? Number(distanceKm.replace(" km", "").replace(",", "").trim())
    : distanceKm;


  if (distance <= 0) {
    return 0;
  }

  return price / (distance * 2);
}