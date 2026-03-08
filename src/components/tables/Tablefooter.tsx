interface Props {
  label: string;
  classname?: string;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  dataLength: number;
  goToNext: () => void;
  goToPrevious: () => void;
  goToPage: (p: number) => void;
}

export function TableFooter({
  label,
  classname,
  currentPage,
  totalPages,
  pageSize,
  dataLength,
  goToNext,
  goToPrevious,
  goToPage,
}: Props) {
  return (
    <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 ${classname}`}>
      <div className="flex items-center justify-between">

        <div className="text-sm text-gray-600">
          {dataLength > 0 ? (
            <p>
              Mostrando {(currentPage - 1) * pageSize + 1} a {Math.min(currentPage * pageSize, dataLength)}
              {" "}de {dataLength} {label}
            </p>
          ) : (
            <span>Nenhum registro encontrado</span>
          )}
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