// Canonical Delivery Person vehicle types. The `value` is what gets saved to
// Firestore. Icons are MaterialCommunityIcons names (motorbike / car) so the
// delivery vehicle is always represented as either a motorcycle or a car.
export const VEHICLE_TYPES = [
  { value: 'motorcycle', label: 'Motorcycle', icon: 'motorbike' },
  { value: 'motor_vehicle', label: 'Motor Vehicle', icon: 'car' },
];

export function getVehicleTypeInfo(value) {
  return VEHICLE_TYPES.find((type) => type.value === value) || null;
}

export function getVehicleLabel(value) {
  return getVehicleTypeInfo(value)?.label || 'Vehicle';
}

export function getVehicleIcon(value) {
  return getVehicleTypeInfo(value)?.icon || 'car-outline';
}