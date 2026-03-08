import { useState } from "react";

export function useEnumState<T extends readonly string[]>(
  values: T,
  defaultValue: T[number]
) {
  const [state, setState] = useState<T[number]>(defaultValue);

  const setValue = (value: T[number]) => {
    if (values.includes(value)) {
      setState(value);
    }
  };

  return [state, setValue] as const;
}