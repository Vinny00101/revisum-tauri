import { StudyItemFullResponse } from "../../types/interfaces";
import { FilterDefinition, SearchDefinition } from "@/components/tables/hooks/useBarTools";

export type StudyItemFilter =
  | "all"
  | "cards"
  | "questions"
  | "objective-questions"
  | "discursive-questions";


export const studyItemFilters = [
  {
    key: "all",
    label: "Todos",
    apply: () => true,
  },
  {
    key: "cards",
    label: "Cards",
    apply: (item: StudyItemFullResponse) =>
      item.item_type === "CARD" && !!item.card,
  },
  {
    key: "questions",
    label: "Questões",
    apply: (item: StudyItemFullResponse) =>
      item.item_type === "QUESTION" && !!item.question,
  },
  {
    key: "objective-questions",
    label: "Questões objetivas",
    apply: (item: StudyItemFullResponse) =>
      item.question?.question.question_type === "OBJECTIVE",
  },
  {
    key: "discursive-questions",
    label: "Questões discursivas",
    apply: (item: StudyItemFullResponse) =>
      item.question?.question.question_type === "DISCURSIVE",
  },
] as const satisfies readonly FilterDefinition<
  StudyItemFullResponse,
  StudyItemFilter
>[];

export const studyItemSearch: SearchDefinition<StudyItemFullResponse> = {
    keys: []
    /*
  customSearch: (item, query) => {
    const q = query.toLowerCase();

    return (
      item.card?.front.toLowerCase().includes(q) ||
      item.card?.back.toLowerCase().includes(q) ||
      item.question?.question.statement_text.toLowerCase().includes(q) ||
      false
    );
  },
  */
};