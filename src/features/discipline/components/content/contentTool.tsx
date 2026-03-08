
import { FilterDefinition, SearchDefinition } from "@/components/tables/hooks/useBarTools";
import { Content } from "../../types/interfaces";

export type filterDiscipline = "all"

export const contentFilters = [
  {
    key: "all",
    label: "Todas",
    apply: () => true,
  }
] as const satisfies readonly FilterDefinition<
  Content,
  filterDiscipline
>[];

export const contentSearch: SearchDefinition<Content> = {
    keys: ["title", "description"]
};
