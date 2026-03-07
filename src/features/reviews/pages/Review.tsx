import { Brain, Calendar, Clock, TrendingUp, Target, CheckCircle, Search, BookOpen } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { disciplineSearch } from "@/features/discipline";
import { useSmartFilterSearch } from "@/components/tables/hooks/useBarTools";
import { useDisciplines } from "@/hooks/useDisciplines";
import { useContent } from "@/hooks/useContent";
import { ReviewTable } from "../components/ReviewTable";
import { contentColumnsReviews } from "../components/contentColumnsReviews";
import { DisciplineProgress } from "../components/discipline_progress";
import { getCurrentUser } from "@/tauri/user";
import { useTauri } from "@/context/TauriContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/context/ToastContext";
import { formatStudyTime } from "@/util/FormatData";

export function Review() {
  const { disciplines } = useDisciplines();
  const { content, fetchContentByDiscipline, refreshAll } = useContent();
  const { user, setUser } = useTauri();
  const { search, setSearch, processedData, isSearchActive } = useSmartFilterSearch(disciplines, [], "all", disciplineSearch);
  const [selectionSearch, setSelectionSearch] = useState(String);
  const navigate = useNavigate();
  const { showToast } = useToast();


  const fetchUserData = useCallback(async () => {
    try {
      const result = await getCurrentUser();

      if (!result.code || !result.user) {
        navigate("/");
      } else {
        setUser(result.user);
      }
    } catch (err: any) {
      showToast({ type: "error", message: "Erro ao carregar dados do perfil" + err });
    }
  }, [showToast]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleSelectDiscipline = (discipline: any) => {
    setSearch(discipline.name);
    setSelectionSearch(discipline.name);
    fetchContentByDiscipline(discipline.id);
  };

  return (
    <div>
      <div>

        {/* Header com saudação */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <Brain size={32} className="text-blue-600" />
              Revisão Inteligente
            </h1>
            <p className="text-gray-600 mt-2">
              Mantenha o conhecimento fresco com revisões espaçadas
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-blue-500" />
              <span className="text-sm font-medium text-gray-700">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-2xl flex flex-col justify-between shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-green-50 to-indigo-100 flex items-center justify-center border border-indigo-200">
                <Clock size={24} className="text-indigo-900" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{formatStudyTime(user?.status?.total_study_time) ?? 0} </h3>
            <p className="text-sm text-gray-600 mt-1">Tempo Total</p>
            <p className="text-xs text-gray-500 mt-2">
              Aumente sua produtividade! 🔥
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-green-50 to-green-100 flex items-center justify-center border border-green-200">
                <TrendingUp size={24} className="text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{user?.status?.current_streak ?? 0} dias</h3>
            <p className="text-sm text-gray-600 mt-1">Sequência de estudos</p>
            <div className="mt-3 flex items-center gap-1">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${i < (user?.status?.current_streak ?? 0) % 7
                    ? 'bg-linear-to-r from-green-500 to-green-400'
                    : 'bg-gray-200'
                    }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Mantenha o foco! 🔥
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center border border-blue-200">
                <Target size={24} className="text-blue-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{83}%</h3>
            <p className="text-sm text-gray-600 mt-1">Taxa de acerto</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-blue-500 to-blue-400 rounded-full"
                  style={{ width: `${83}%` }}
                />
              </div>
              <span className="text-xs font-medium text-blue-600">+5%</span>
            </div>
          </div>
        </div>

        {/*  */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* tabela com conteudos para revisao */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="bg-blue-50 p-3 rounded-full">
                    <BookOpen size={20} className="text-blue-500 " />
                  </div>
                  Revisões por conteúdos
                </h2>
                {/* Botão para resetar o filtro */}
                <button onClick={() => {
                  refreshAll();
                  setSearch('');
                }} className="text-xs text-blue-600 hover:underline">
                  Limpar filtros
                </button>
              </div>

              {/* Search */}

              <div className="flex-1 relative mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Pesquisar disciplinas para filtrar conteúdos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                </div>

                {/* Dropdown de Resultados da Busca */}
                {isSearchActive && search !== selectionSearch && (
                  <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    {processedData.length > 0 ? (
                      <div className="max-h-60 overflow-y-auto">
                        {processedData.map((disc) => (
                          <button
                            key={disc.id}
                            onClick={() => handleSelectDiscipline(disc)}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm text-gray-700 flex items-center justify-between group"
                          >
                            <span>{disc.name}</span>
                            <span className="text-xs text-blue-500 opacity-0 group-hover:opacity-100">Selecionar</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        Nenhuma disciplina encontrada.
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Conteúdos para conteudos */}
              <div className="space-y-3">

                <ReviewTable
                  data={content}
                  columns={contentColumnsReviews}
                  pageSize={5}
                />
              </div>

              {content.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum conteudo foi adicionado ainda.
                  </h3>
                  <p className="text-gray-500">
                    Comece adicionado na seção de disciplinas.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar com estatísticas e dicas */}
          <div className="space-y-6">
            <DisciplineProgress disciplines={disciplines} />

            {/* Dica do dia */}
            <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <Brain size={20} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Dica do dia</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Estudos mostram que revisar um conteúdo 24h após o aprendizado aumenta a retenção em até 70%!
                  </p>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}