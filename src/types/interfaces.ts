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

export interface ReviewLog {
  id: number;
  session_id: number;
  user_id: number;
  study_item_id: number;
  item_type: string;
  evaluation: string;
  time_spent: number | null;
  review_time: string;
}