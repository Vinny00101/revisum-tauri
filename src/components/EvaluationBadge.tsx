export const EvaluationBadge = ({ evaluation }: { evaluation: string }) => {
  const config: Record<string, { style: string; text: string }> = {
    "EASY": { style: "bg-green-100 text-green-700 border-green-200", text: "Fácil" },
    "MEDIUM": { style: "bg-yellow-100 text-yellow-700 border-yellow-200", text: "Médio" },
    "HARD": { style: "bg-amber-100 text-orange-700 border-orange-200", text: "Difícil" },
    "WRONG": { style: "bg-red-100 text-red-700 border-red-200", text: "Errado" },
  };

  const label = evaluation.toUpperCase();

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${config[label].style || "bg-gray-100 text-gray-600"}`}>
      {config[label].text || label}
    </span>
  );
};