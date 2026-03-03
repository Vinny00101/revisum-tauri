import { Column } from "@/types/interfaces";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props<T> {
    columns: Column<T>[];
    sortField: keyof T | null;
    sortDirection: "asc" | "desc";
    onSort: (field: keyof T) => void;
}

export function TableHeader<T>({
    columns,
    sortField,
    sortDirection,
    onSort,
}: Props<T>) {

    return (
        <thead className="bg-gray-50">
            <tr>
                {columns.map(col => (
                    <th
                        key={String(col.key)}
                        className={`px-6 py-4 text-left text-sm font-semibold text-gray-700
                        ${col.key != "actions" ? "cursor-pointer hover:bg-gray-100" : ""}`}
                        onClick={() => col.sortable && onSort( col.key as keyof T)}
                    >
                        <div className="flex items-center gap-1">
                            {col.header}
                            {col.sortable && sortField === col.key && (
                                sortDirection === "asc"
                                    ? <ChevronUp size={16} />
                                    : <ChevronDown size={16} />
                            )}
                        </div>
                    </th>
                ))}
            </tr>
        </thead>
    );
}
