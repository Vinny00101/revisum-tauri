interface ProgressBarProps {
    progress: number;
    showLabel?: boolean;
    size?: "sm" | "md" | "lg";
}

export default function ProgressBar({ progress, showLabel = true, size = "md" }: ProgressBarProps) {
    const height = {
        sm: "h-1.5",
        md: "h-2",
        lg: "h-3"
    }[size];

    const getColor = () => {
        if (progress >= 80) return "bg-green-500";
        if (progress >= 50) return "bg-blue-500";
        if (progress >= 20) return "bg-yellow-500";
        return "bg-red-500";
    };

    return (
        <div className="w-full">
            {showLabel && (
                <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{progress}%</span>
                    <span className="text-gray-500">Completo</span>
                </div>
            )}
            <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${height}`}>
                <div
                    className={`${getColor()} ${height} rounded-full transition-all duration-300`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}