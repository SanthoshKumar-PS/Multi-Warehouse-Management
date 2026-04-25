export const getWarehouseEmoji = (warehouseName: string): string => {
  const n = warehouseName.toLowerCase();
  if (n.includes("festa")) return "🏠"; 
  if (n.includes("kone")) return "🏗️"; 
  if (n.includes("puzhal")) return "🚢"; 

  if (n.includes("bangalore")) return "🏭"; 
  if (n.includes("hyderabad")) return "🏬"; 

  if (n.includes("coimbatore") || n.includes("madurai")) return "🏢";
  if (n.includes("salem")) return "📦"; 

  return "🏭"; 
};
