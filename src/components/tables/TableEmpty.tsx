interface Props {
  message?: string;
}

export function TableEmpty({ message = "Nenhum registro encontrado" }: Props) {
  return (
    <div className="text-center py-12 text-gray-500">
      {message}
    </div>
  );
}