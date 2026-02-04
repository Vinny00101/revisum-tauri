
import { ContentResponse} from "@/types/TypeInterface";
import { FilterDefinition, SearchDefinition } from "../tables/hooks/useBarTools";

export type filterDiscipline = "all"

export const contentFilters = [
  {
    key: "all",
    label: "Todas",
    apply: () => true,
  }
] as const satisfies readonly FilterDefinition<
  ContentResponse,
  filterDiscipline
>[];

export const contentSearch: SearchDefinition<ContentResponse> = {
    keys: ["title", "description"]
};
