interface Props {
  classname?: string;
  currentPage: number;
  totalPages: number;
  goToNext: () => void;
  goToPrevious: () => void;
  goToPage: (p: number) => void;
}

export function TableFooter({
  classname,
  currentPage,
  totalPages,
  goToNext,
  goToPrevious,
  goToPage,
}: Props) {
  return (
    <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 ${classname}`}>
      <div className="flex items-center justify-between">

        <div className="text-sm text-gray-600">
          Em breve...
          {
            /* 
            Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
          {Math.min(currentPage * ITEMS_PER_PAGE, filteredDisciplines.length)}
          {" "}de {disciplines.length} disciplinas
          {search && ` • Filtrado por: "${search}"`}
            */}
        </div>

        <div className="flex items-center gap-4">
          {/* Paginação */}
          <div className="flex gap-2">
            <button
              onClick={goToPrevious}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i + 1)}
                className={`px-3 py-1.5 text-sm rounded-lg border ${currentPage === i + 1
                  ? "bg-blue-50 text-blue-600 border-blue-200"
                  : "border-gray-300 hover:bg-gray-50"
                  }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={goToNext}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}