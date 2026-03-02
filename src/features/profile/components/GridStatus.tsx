import { Flame, Award, Timer, Clock } from "lucide-react";

export function UserStatsGrid({ status }: { status: any }) {
    // Função para formatar segundos em algo legível
    const formatStudyTime = (seconds: number = 0) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);

        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    // Função para formatar a data (de 2026-03-02 para 02/03)
    const formatDate = (dateStr: string = "") => {
        if (!dateStr) return "---";
        const [_year, month, day] = dateStr.split("-");
        return `${day}/${month}`;
    };

    const stats = [
        {
            label: "Ofensiva Atual",
            value: `${status?.current_streak || 0} dias`,
            icon: <Flame size={24} />,
            bgColor: "bg-orange-50",
            iconColor: "bg-orange-500",
            textColor: "text-orange-600",
            valColor: "text-orange-900",
            borderColor: "border-orange-100"
        },
        {
            label: "Melhor Ofensiva",
            value: `${status?.longest_streak || 0} dias`,
            icon: <Award size={24} />,
            bgColor: "bg-emerald-50",
            iconColor: "bg-emerald-500",
            textColor: "text-emerald-600",
            valColor: "text-emerald-900",
            borderColor: "border-emerald-100"
        },
        {
            label: "Último Estudo",
            value: status?.last_review_date ? formatDate(status.last_review_date) : "---" ,
            icon: <Timer size={24} />,
            bgColor: "bg-purple-50",
            iconColor: "bg-purple-500",
            textColor: "text-purple-600",
            valColor: "text-purple-900",
            borderColor: "border-purple-100"
        },
        {
            label: "Tempo Total",
            value: formatStudyTime(status?.total_study_time),
            icon: <Clock size={24} />,
            bgColor: "bg-blue-50",
            iconColor: "bg-blue-500",
            textColor: "text-blue-600",
            valColor: "text-blue-900",
            borderColor: "border-blue-100"
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className={`${stat.bgColor} ${stat.borderColor} p-3 md:p-4 rounded-2xl border flex flex-col sm:flex-row items-center sm:items-start gap-3 transition-all hover:shadow-sm`}
                >
                    {/* Ícone menor (p-2 em vez de p-3) */}
                    <div className={`p-2 ${stat.iconColor} rounded-xl text-white shadow-md shadow-${stat.iconColor.split('-')[1]}-100`}>
                        {/* Ajuste o tamanho do ícone aqui se necessário, ex: size={18} no componente do ícone */}
                        {stat.icon}
                    </div>

                    <div className="text-center sm:text-left">
                        {/* Rótulo: text-[10px] ou text-xs para ser bem pequeno */}
                        <p className={`${stat.textColor} text-[10px] md:text-xs font-bold uppercase tracking-tight opacity-80`}>
                            {stat.label}
                        </p>

                        {/* Valor: text-sm ou text-base em vez de text-2xl */}
                        <p className={`text-sm md:text-base font-extrabold ${stat.valColor} leading-none mt-0.5`}>
                            {stat.value}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}