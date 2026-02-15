import { Brain, Calendar, Clock, TrendingUp, Target, Award, BookOpen, CheckCircle, BarChart3, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

interface ReviewStats {
  totalToReview: number;
  reviewedToday: number;
  streak: number;
  accuracy: number;
  nextReview: {
    count: number;
    time: string;
  };
}

interface DueItem {
  id: number;
  title: string;
  type: "card" | "question";
  discipline: string;
  content: string;
  dueDate: Date;
  difficulty: "easy" | "medium" | "hard";
  lastReviewed?: Date;
}

export function Review() {
  const [stats, setStats] = useState<ReviewStats>({
    totalToReview: 24,
    reviewedToday: 8,
    streak: 7,
    accuracy: 82,
    nextReview: { count: 12, time: "2h" }
  });

  const [dueItems, setDueItems] = useState<DueItem[]>([
    {
      id: 1,
      title: "Funções Quadráticas",
      type: "card",
      discipline: "Matemática",
      content: "Funções",
      dueDate: new Date(),
      difficulty: "hard",
      lastReviewed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: 2,
      title: "Concordância Verbal",
      type: "question",
      discipline: "Português",
      content: "Sintaxe",
      dueDate: new Date(),
      difficulty: "medium"
    },
    // ... mais itens
  ]);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-orange-50 to-orange-100 flex items-center justify-center border border-orange-200">
                <Clock size={24} className="text-orange-600" />
              </div>
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                Hoje
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalToReview}</h3>
            <p className="text-sm text-gray-600 mt-1">Itens para revisar</p>
            <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-linear-to-r from-orange-500 to-orange-400 rounded-full"
                style={{ width: `${(stats.reviewedToday / stats.totalToReview) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.reviewedToday} concluídos hoje
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-green-50 to-green-100 flex items-center justify-center border border-green-200">
                <TrendingUp size={24} className="text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.streak} dias</h3>
            <p className="text-sm text-gray-600 mt-1">Sequência de estudos</p>
            <div className="mt-3 flex items-center gap-1">
              {[...Array(7)].map((_, i) => (
                <div 
                  key={i}
                  className={`h-2 flex-1 rounded-full ${
                    i < stats.streak % 7 
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
            <h3 className="text-2xl font-bold text-gray-900">{stats.accuracy}%</h3>
            <p className="text-sm text-gray-600 mt-1">Taxa de acerto</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-linear-to-r from-blue-500 to-blue-400 rounded-full"
                  style={{ width: `${stats.accuracy}%` }}
                />
              </div>
              <span className="text-xs font-medium text-blue-600">+5%</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-50 to-purple-100 flex items-center justify-center border border-purple-200">
                <Award size={24} className="text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.nextReview.count}</h3>
            <p className="text-sm text-gray-600 mt-1">Próxima revisão</p>
            <div className="mt-3 flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Em {stats.nextReview.time}</span>
            </div>
          </div>
        </div>

        {/* Próximas revisões e recomendações */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de itens para revisar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock size={20} className="text-orange-500" />
                  Revisões Pendentes
                  <span className="px-2 py-0.5 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-200">
                    {dueItems.length}
                  </span>
                </h2>
                <Link 
                  to="/review/session" 
                  className="px-4 py-2 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-xl shadow-sm shadow-blue-200 hover:shadow-md transition-all duration-200 flex items-center gap-2"
                >
                  <Sparkles size={16} />
                  Iniciar revisão
                </Link>
              </div>

              <div className="space-y-3">
                {dueItems.map((item) => (
                  <Link
                    key={item.id}
                    to={`/reviews/${item.id}`}
                    className="block p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        item.type === 'card' 
                          ? 'bg-purple-100 text-purple-600' 
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {item.type === 'card' ? <BookOpen size={20} /> : <CheckCircle size={20} />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {item.title}
                          </h3>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            item.difficulty === 'hard' 
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : item.difficulty === 'medium'
                              ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                              : 'bg-green-50 text-green-700 border border-green-200'
                          }`}>
                            {item.difficulty === 'hard' ? 'Difícil' : item.difficulty === 'medium' ? 'Médio' : 'Fácil'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{item.discipline}</span>
                          <span>•</span>
                          <span>{item.content}</span>
                          {item.lastReviewed && (
                            <>
                              <span>•</span>
                              <span>Revisado há {Math.floor((Date.now() - item.lastReviewed.getTime()) / (1000 * 60 * 60 * 24))} dias</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-gray-400 group-hover:text-blue-500">
                        Revisar →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {dueItems.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Tudo em dia! 🎉
                  </h3>
                  <p className="text-gray-500">
                    Você não tem nenhuma revisão pendente no momento.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar com estatísticas e dicas */}
          <div className="space-y-6">
            {/* Progresso por disciplina */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-500" />
                Progresso por disciplina
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Matemática</span>
                    <span className="font-medium text-gray-900">75%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-linear-to-r from-blue-500 to-blue-400 rounded-full" />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Português</span>
                    <span className="font-medium text-gray-900">45%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-2/5 bg-linear-to-r from-green-500 to-green-400 rounded-full" />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">História</span>
                    <span className="font-medium text-gray-900">60%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-3/5 bg-linear-to-r from-purple-500 to-purple-400 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

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

            {/* Meta diária */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Meta diária
                </h3>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  20 itens
                </span>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Progresso</span>
                <span className="text-sm font-medium text-gray-900">{stats.reviewedToday}/20</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-linear-to-r from-blue-500 to-blue-400 rounded-full"
                  style={{ width: `${(stats.reviewedToday / 20) * 100}%` }}
                />
              </div>
              
              <button className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
                <Calendar size={16} />
                Ajustar meta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}