
export const getStockStatusColor = (availableQty: number) => {
  if (availableQty <= 5) return "text-red-600";
  if (availableQty <= 20) return "text-yellow-600";
  return "text-green-600";
};