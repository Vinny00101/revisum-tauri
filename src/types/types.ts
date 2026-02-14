export type MessageType = "success" | "info" | "warning" | "error";

export type DisciplineAction = "study" | "edit" | "delete" | "export" | "toggle_favorite";

export enum StudyItemType {
  CARD = "CARD",
  QUESTION = "QUESTION",
}

export enum QuestionType {
  OBJECTIVE = "OBJECTIVE",
  DISCURSIVE = "DISCURSIVE",
}