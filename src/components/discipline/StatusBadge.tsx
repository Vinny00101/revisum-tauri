import { Clock, AlertCircle, CheckCircle } from "lucide-react";

interface StatusBadgeProps {
    lastStudied: string | null;
    progress: number;
}

export default function StatusBadge({ lastStudied }: StatusBadgeProps) {
    const getStudyStatus = () => {
        if (!lastStudied) return "never-studied";
        
        const lastDate = new Date(lastStudied);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays > 7) return "needs-review";
        if (diffDays > 3) return "review-soon";
        return "up-to-date";
    };

    const status = getStudyStatus();

    const config = {
        "never-studied": {
            label: "Nunca estudado",
            icon: Clock,
            color: "text-gray-600",
            bgColor: "bg-gray-100"
        },
        "needs-review": {
            label: "Precisa revisar",
            icon: AlertCircle,
            color: "text-red-600",
            bgColor: "bg-red-50"
        },
        "review-soon": {
            label: "Revisar em breve",
            icon: Clock,
            color: "text-yellow-600",
            bgColor: "bg-yellow-50"
        },
        "up-to-date": {
            label: "Em dia",
            icon: CheckCircle,
            color: "text-green-600",
            bgColor: "bg-green-50"
        }
    }[status];

    const Icon = config.icon;

    return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${config.bgColor}`}>
            <Icon size={14} className={config.color} />
            <span className={`text-sm font-medium ${config.color}`}>
                {config.label}
            </span>
        </div>
    );
}