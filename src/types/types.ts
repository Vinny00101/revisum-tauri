export type MessageType = "success" | "info" | "warning" | "error";

export type DisciplineAction = "edit" | "delete" | "export" | "toggle_favorite";

export type ContentAction = "study" | "edit" | "delete"

export enum StudyItemType {
  CARD = "CARD",
  QUESTION = "QUESTION",
}

export enum QuestionType {
  OBJECTIVE = "OBJECTIVE",
  DISCURSIVE = "DISCURSIVE",
}