import { DisciplineResponse } from "@/types/TypeInterface";
import { FilterDefinition, SearchDefinition } from "../tables/hooks/useBarTools";

export type filterDiscipline = "all" | "favorites" | "needs-review"

export const disciplineFilters = [
  {
    key: "all",
    label: "Todas",
    apply: () => true,
  },
  {
    key: "favorites",
    label: "Favoritas",
    apply: (d: DisciplineResponse) => d.favorite,
  },
  {
    key: "needs-review",
    label: "Precisa revisar",
    apply: (d: DisciplineResponse) => d.progress < 70,
  },
] as const satisfies readonly FilterDefinition<
  DisciplineResponse,
  filterDiscipline
>[];

export const disciplineSearch: SearchDefinition<DisciplineResponse> = {
    keys: ["name", "description"]
};
