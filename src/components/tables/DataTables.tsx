import { Column } from "@/types/interfaces";
import { TableHeader } from "./TableHeader";
import { useTableSort } from "./hooks/useTableSort";
import { TableBody } from "./TableBody";
import { useTablePagination } from "./hooks/useTablePagination";
import { TableFooter } from "./Tablefooter";
import { TableEmpty } from "./TableEmpty";

interface Props<T> {
    data: T[];
    columns: Column<T>[];
    pageSize?: number;
}

export function DataTable<T>({
    data,
    columns,
    pageSize = 5,
}: Props<T>) {

    const { sortedData, sortField, sortDirection, handleSort } = useTableSort(data);

    const { paginatedData, currentPage, totalPages, goToNext, goToPrevious, goToPage } = useTablePagination(sortedData, pageSize);

    if (data.length === 0) {
        return <TableEmpty />;
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <TableHeader
                        columns={columns}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                    />
                    <TableBody data={paginatedData} columns={columns} />
                </table>

                <TableFooter
                    currentPage={currentPage}
                    totalPages={totalPages}
                    goToNext={goToNext}
                    goToPrevious={goToPrevious}
                    goToPage={goToPage}
                />
            </div>
        </div>
    )
}