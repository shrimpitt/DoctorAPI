// Client-side volume variants (backend has no variant table yet)
// multiplier is applied to the base product price
export const DEFAULT_VOLUMES = [
  { label: "10 мг", multiplier: 1 },
  { label: "20 мг", multiplier: 2.5 },
  { label: "50 мг", multiplier: 3.8 },
];

export function getVolumes(product) {
  return DEFAULT_VOLUMES.map((v) => ({
    ...v,
    price: Math.round(product.price * v.multiplier),
  }));
}
