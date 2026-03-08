
export const ItemType = ({ item_type }: { item_type: string }) => {
  const config: Record<string, { text: string }> = {
    "CARD" : {text: "Card"},
    "OBJECTIVE": {text: "Objetiva" },
    "DISCURSIVE": {text: "Discursiva" },
  };

  const label = item_type.toUpperCase();

  return (
    <p className="text-sm font-semibold text-gray-700">
      {config[label].text || label}
    </p>
  );
};