import { Content } from "@/features/discipline";
import { Column } from "@/types/interfaces";
import { ContentReview } from "./contentReview";


export const contentColumnsReviews: Column<Content>[] = [
    {
        key: "title",
        header: "Título",
        sortable: true,
        render: (item) => (
            <ContentReview item={item} />
        )
    },
];