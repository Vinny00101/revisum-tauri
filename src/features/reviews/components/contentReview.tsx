import { Content } from "@/features/discipline";
import { Link } from "react-router-dom";

export function ContentReview({ item }: { item: Content }) {
    return (
        <Link
            key={item.id}
            to={`/reviews/${item.id}`}
            className="block rounded-xl border w-full border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
        >
            <div className="flex p-4 items-start justify-between w-full ">
                <div>
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600">{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">Ordem: {item.display_order}</p>
                </div>
                <div className="text-xs text-gray-400 group-hover:text-blue-500">Revisar →</div>
            </div>
        </Link>
    );
}