import { Column } from "@/types/TypeInterface";

interface Props<T> {
  data: T[];
  columns: Column<T>[];
}

export function TableBody<T>({ data, columns }: Props<T>) {
  return (
    <tbody className="divide-y divide-gray-200">
      {data.map((row, idx) => (
        <tr key={idx} className="hover:bg-gray-50">
          {columns.map(col => (
            <td key={String(col.key)} className="px-6 py-4">
              {col.render ? col.render(row) : String(row[col.key])}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
