export function formatKES(amount) {
  const rounded = Math.round(amount || 0);
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `KES ${formatted}`;
}

export function formatQuantity(kg) {
  return `${kg} kg`;
}