// @/features/reviews/components/ReviewTable.tsx
import { Column } from "@/types/interfaces";
import { useTableSort } from "@/components/tables/hooks/useTableSort";
import { TableBody } from "@/components/tables/TableBody";
import { useTablePagination } from "@/components/tables/hooks/useTablePagination";
import { TableFooter } from "@/components/tables/Tablefooter";
import { TableEmpty } from "@/components/tables/TableEmpty";

interface Props<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
}

export function ReviewTable<T>({
  data,
  columns,
  pageSize = 5,
}: Props<T>) {
  const { sortedData } = useTableSort(data);
  const {
    paginatedData,
    currentPage,
    totalPages,
    goToNext,
    goToPrevious,
    goToPage
  } = useTablePagination(sortedData, pageSize);

  if (data.length === 0) {
    return <TableEmpty />;
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <TableBody 
          tbodyClassname="w-full"
          trClassname="w-full"
          tdClassname="pb-2"
          data={paginatedData} columns={columns} />
        </table>


        <TableFooter classname="p-0! border-none bg-white!"
          label="Conteúdos"
          dataLength={data.length}
          pageSize={pageSize}
          currentPage={currentPage}
          totalPages={totalPages}
          goToNext={goToNext}
          goToPrevious={goToPrevious}
          goToPage={goToPage}
        />
      </div>
    </div>
  );
}