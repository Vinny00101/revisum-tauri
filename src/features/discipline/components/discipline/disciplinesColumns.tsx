import { Column } from "@/types/interfaces";
import { BookOpen, Clock } from "lucide-react";
import { NavLink } from "react-router-dom";
import ProgressBar from "./Progress";
import ModalRender from "./ModalRender";
import { Discipline } from "../../types/interfaces";
import { formatDate } from "@/util/FormatData";


export const disciplineColumns: Column<Discipline>[] = [
  {
    key: "name",
    header: "Disciplina",
    sortable: true,
    render: (discipline) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
          <BookOpen size={20} />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <NavLink
              to={`/disciplines/${discipline.id}`}
              state={{ breadcrumbName: discipline.name }}
              className="font-medium text-gray-900 hover:text-blue-600"
            >
              {discipline.name}
            </NavLink>
          </div>

          <div className="text-sm text-gray-500 truncate max-w-xs">
            {discipline.description}
          </div>

          {/*    <div className="flex items-center gap-4 mt-1">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full" />
                  {discipline.cardCount} cards
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  {discipline.questionCount} questões
                </span>
              </div>*/}
        </div>
      </div>
    ),
  },

  {
    key: "total_items",
    header: "Itens",
    sortable: true,
    render: (d) => (
      <div className="text-start">
        <span className="font-semibold text-gray-800">
          {d.total_items}
        </span>
        <div className="text-xs text-gray-500">itens totais</div>
      </div>
    ),
  },

  {
    key: "progress_percent",
    header: "Progresso",
    sortable: true,
    render: (d) => (
      <div className="w-40">
        <ProgressBar progress={d.progress_percent} />
        {/*<StatusBadge lastStudied={} type="Simple" />*/}
      </div>
    ),
  },

  {
    key: "last_review_date",
    header: "Último Estudo",
    sortable: true,
    render: (d) => (
      <div className="flex items-center gap-2">
        <Clock size={16} className="text-gray-400" />
        <span className="text-sm text-gray-700">
          {d.last_review_date ? formatDate(d.last_review_date) : "Nunca estudado"}
        </span>
      </div>
    ),
  },
  {
    key: "actions",
    header: "Ações",
    sortable: false,
    render: (d) => (
      <ModalRender
        id={d.id}
        favorite={false}
      />
    )
  }
];
