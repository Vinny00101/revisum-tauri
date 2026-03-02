import { FilterDefinition, SearchDefinition } from "@/components/tables/hooks/useBarTools";
import { Discipline } from "../../types/interfaces";

export type filterDiscipline = "all" | "favorites" | "needs-review"

export const disciplineFilters = [
  {
    key: "all",
    label: "Todas",
    apply: () => true,
  },
  {
    key: "needs-review",
    label: "Precisa revisar",
    apply: (d: Discipline) => d.progress_percent < 70,
  },
] as const satisfies readonly FilterDefinition<
  Discipline,
  filterDiscipline
>[];

export const disciplineSearch: SearchDefinition<Discipline> = {
    keys: ["name", "description"]
};
