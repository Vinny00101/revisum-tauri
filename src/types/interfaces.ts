export interface Column<T> {
  key: keyof T | "actions" | "preview";
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (row: T) => React.ReactNode;
}
export interface UpdateUserRequest {
  username?: string | null;
  email?: string | null;
  password?: string | null;
  avatar_bytes?: number[] | null;
  avatar_extension?: string | null;
}


export interface message {
  code: boolean,
  message: string
}
