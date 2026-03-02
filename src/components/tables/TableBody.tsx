import { Column } from "@/types/interfaces";

interface Props<T> {
  tbodyClassname?: string;
  trClassname?: string;
  tdClassname?: string;
  data: T[];
  columns: Column<T>[];
}

export function TableBody<T>({ tbodyClassname, trClassname, tdClassname, data, columns }: Props<T>) {
  return (
    <tbody className={ tbodyClassname ? tbodyClassname : `divide-y divide-gray-200`}>
      {data.map((row, idx) => (
        <tr key={idx} className={trClassname ? trClassname : "hover:bg-gray-50"} >
          {columns.map(col => (
            <td key={String(col.key)} className={ tdClassname ? tdClassname : "px-6 py-4"}>
              {col.render ? col.render(row) : String((row as Record<string, any>)[col.key as string]) }
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
