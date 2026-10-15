**Revisum — workspace de estudos, provas e aprendizagem assistida**

Complemento de produto e arquitetura ao diagnóstico de 15/10/2026. Esta visão incorpora a direção solicitada pelo usuário após a organização do planejamento no repositório. Todas as experiências, entidades e módulos novos abaixo são propostas; nenhuma interface ou funcionalidade foi implementada nesta etapa.

**1. Direção do produto**

O Revisum passa a ser planejado como um ambiente de trabalho pessoal para aprender: reunir materiais, relacioná-los, realizar provas, entender o próprio desempenho e preparar o estudo dos próximos dias. A navegação deve acompanhar esse trabalho contínuo, com contexto preservado entre arquivos, questões, revisões e agente.

Disciplinas, conteúdos e itens existentes continuam úteis como organização e objetos de aprendizagem. Sua administração deixa de ocupar o centro da experiência. Formulários e tabelas permanecem quando necessários, como edição em lote de questões, sem determinar toda a navegação.

Um cenário de referência:

1. O estudante cria o espaço “Concurso — preparação” e adiciona edital, apostilas, anotações, provas e gabaritos.
2. Relaciona os capítulos de uma apostila aos assuntos do edital e às questões de determinadas provas. O agente pode sugerir relações, que ficam identificadas como propostas.
3. Resolve uma prova em modo simulado, com tempo e gabarito oculto. O sistema registra respostas e calcula o resultado pelas regras da prova.
4. Abre a análise, identifica assuntos com mais erros e vê as revisões previstas para os próximos dias.
5. Solicita um plano usando as provas, os materiais e o tempo disponível. A IA prepara explicações e atividades citando as fontes utilizadas.
6. Se habilitar pesquisa na internet, recebe artigos, sites e vídeos relacionados às lacunas encontradas.
7. Substitui um vídeo ruim por outro, marca uma fonte como preferida e registra que gosta de explicações com exercícios. As próximas recomendações consideram essas escolhas no contexto adequado.

O ambiente pessoal permanece sem login. Espaços de estudo são agrupamentos de trabalho, não contas ou novos limites de autenticação. A primeira versão da experiência pode oferecer um espaço padrão; espaços adicionais vêm quando a organização já estiver funcional.

**2. Proposta da interface completa**

| Região | Função | Comportamento esperado |
|---|---|---|
| Barra lateral | Navegação global, espaços, favoritos e árvore de materiais | Acesso rápido a Hoje, Biblioteca, Provas, Revisões e Histórico; seleção do espaço preservada |
| Área central | Trabalho ativo em abas | Ler material, escrever anotação, resolver questões, abrir plano e comparar fontes sem perder posição |
| Painel contextual | Relações, referências, tarefas e agente | Responder sobre a seleção atual e mostrar exatamente quais materiais estão incluídos no contexto |
| Busca/comandos | Encontrar objetos e iniciar ações | Buscar nome/texto/assunto, abrir arquivo ou iniciar simulado sem navegar por vários cadastros |
| Estado persistente | Progresso de importação, conexão e tarefas | Acompanhar atividade sem bloquear a leitura; erros têm ação de recuperação |

Esboço funcional, ainda sem definir identidade visual:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Revisum   Espaço: Concurso     Buscar arquivos, questões e assuntos      │
├────────────────┬────────────────────────────────┬───────────────────────┤
│ Hoje           │ [Apostila.pdf] [Prova] [Plano]  │ Contexto desta tarefa │
│ Biblioteca     ├────────────────────────────────┤ 3 materiais escolhidos│
│ Provas         │                                │ Assuntos relacionados │
│ Revisões       │ Leitor / anotação / análise     │                       │
│                │                                │ Agente                │
│ Materiais      │ Trecho selecionado              │ Explicar este trecho  │
│  Edital        │ Referências e marcadores         │ Relacionar à prova    │
│  Apostilas     │                                │ Preparar estudo       │
│  Provas        │                                │                       │
│ Favoritos      │                                │ Fontes e resultados   │
├────────────────┴────────────────────────────────┴───────────────────────┤
│ Importações / execução de tarefas / estado local                         │
└─────────────────────────────────────────────────────────────────────────┘
```

O painel do agente é contextual e recolhível. O usuário pode estudar e fazer provas com a integração desconectada. Conversas não devem ocupar o lugar de arquivos, resultados, calendário e evidências persistidas.

**Hoje** apresenta compromissos de estudo, revisões vencidas/próximas, provas agendadas, continuidade da última atividade e sugestões explicadas. Diferenciar “prova marcada para realizar” de “revisão de uma prova já feita”. Permitir definir janela de planejamento e tempo disponível; não adotar uma semana fixa como requisito permanente.

**Biblioteca** oferece árvore/lista, filtros, busca e seleção múltipla. A visão de relações começa por um painel de vínculos compreensível; um grafo visual é uma visualização adicional, não pré-requisito para usar o sistema. Arrastar arquivos para importar e relacionar deve ter alternativa por teclado/menu.

**Provas** reúne cadernos, tentativas e análises. O modo simulado usa uma apresentação focada, com navegação por questão, marcação para revisar, progresso e timer. Durante o simulado, o agente não revela gabarito ou dicas; o modo prática permite explicações explicitamente e registra essa condição para não misturar resultados.

**Plano de estudos** mostra atividades por dia/assunto, sua origem e o motivo da prioridade. Alterações sugeridas pela IA são revisáveis. O estudante pode mover, descartar ou substituir atividades; o sistema registra mudanças sem sobrescrever a versão anterior do plano.

**Direção visual proposta:** tema claro e escuro, hierarquia centrada na leitura, controles discretos, densidade ajustável, boa tipografia e indicadores de fonte/progresso consistentes. Preservar React, Tailwind, ícones e animações adequadas já existentes. Validar contraste, zoom, foco visível, leitura assistiva, atalhos e redução de movimento. Painéis devem recolher ou se reorganizar em janelas menores, sem exigir três colunas fixas.

O redesign será incremental: primeiro shell e navegação; depois leitores/biblioteca; depois prova e análise; por fim tarefas/planos. Preservar acesso às funcionalidades antigas durante a substituição e evitar uma troca completa da UI em um único commit.

**3. Arquivos, relações e contexto dos agentes**

Separar três capacidades: guardar um arquivo, visualizá-lo e extrair seu conteúdo para a IA. Um arquivo pode estar armazenado mesmo quando seu formato ainda não tem leitor/extrator. A UI deve mostrar “armazenado”, “processando”, “pronto para pesquisa/IA”, “extração parcial”, “formato sem suporte” ou “falha”, sem prometer análise de todo formato importado.

Importação proposta: copiar arquivos escolhidos para uma biblioteca gerenciada pelo Revisum, conservando nome original e caminho relativo como metadados. Referências externas podem ser oferecidas de forma explícita, com diagnóstico de arquivo ausente. Pastas exigem limites de quantidade/tamanho, tratamento de links/junctions, colisões e importação interrompida. Arquivos executáveis ou formatos sem suporte nunca são executados para extrair conteúdo.

Começar pela estrutura de biblioteca e TXT/Markdown; priorizar PDF textual na entrega seguinte, dada a importância de apostilas e provas. PDF escaneado precisa de OCR em fase própria, com indicação da qualidade e revisão humana de questões/gabaritos. DOCX e outros formatos são incrementos posteriores. Um PDF com layout de prova não vira automaticamente uma prova estruturada confiável.

Relações são muitos-para-muitos, sem exigir que cada arquivo pertença a uma única disciplina. Exemplos: “explica”, “complementa”, “é fonte de”, “contém questões sobre”, “faz parte da prova” e “substitui uma fonte recomendada”. Usar tipos iniciais pequenos; não construir uma ontologia educacional extensa antes de validar o uso.

Guardar origem/destino, tipo, autor da relação (pessoa ou tarefa), justificativa, estado de confirmação e localizador opcional: página, trecho, questão ou timestamp de vídeo. Relações sugeridas e relações confirmadas ficam visualmente distintas. Uma mudança no arquivo não deve fazer uma citação antiga apontar silenciosamente para outro trecho; associar hash/versão de extração e sinalizar referências desatualizadas.

O manifesto de contexto de uma tarefa registra quais versões e trechos foram utilizados. “Relacionar arquivos” não significa dar ao agente acesso automático a toda a biblioteca. O estudante pode selecionar uma coleção, um conjunto de arquivos ou um subconjunto de vínculos e conferir o contexto antes da execução.

Busca inicial: metadados, filtros e índice textual SQLite FTS5, após verificar disponibilidade no SQLite distribuído e testar a migração. Busca semântica/embeddings é opcional e posterior; não é requisito para construir relações manuais ou um primeiro plano útil. Não enviar todos os documentos ao provedor para criar índices sem uma configuração específica.

**4. Banco de questões e provas de concurso**

Reaproveitar o modelo de questões existente como base, corrigindo os problemas do diagnóstico. Acrescentar metadados opcionais: banca, órgão, cargo, ano, disciplina, assunto, número no caderno e fonte. Permitir questões objetivas de alternativa única, certo/errado e discursivas por etapas; cada tipo precisa de correção e UI próprias.

Uma prova é um conjunto ordenado e versionado de questões. Pode ser importada por formato estruturado suportado, montada com questões existentes ou extraída de PDF com conferência. Importar deve apresentar questões, alternativas, imagens e gabarito para validação; ambiguidades ficam pendentes. Não inventar banco oficial de questões, scraping de plataformas ou API de concursos como recurso já disponível.

Gabarito oficial e comentário da IA são entidades diferentes. Guardar fonte, versão, questões anuladas e retificações. Mudança do gabarito preserva o resultado original da tentativa e permite mostrar um recálculo explicitamente identificado, sem reescrever a nota histórica.

Cada tentativa registra estado, regras, tipo de execução (simulado/prática/revisão), versão das questões e do gabarito, respostas, questões em branco, marcações, tempo ativo e eventos de pausa/interrupção. Preservar o snapshot da tentativa caso uma questão seja editada ou removida posteriormente. O usuário decide se continua uma tentativa interrompida ou inicia outra; abrir o mesmo caderno não deve sobrescrever seu histórico.

Regras de pontuação pertencem ao sistema: pontos por acerto, penalidade por erro, tratamento de branco e anulação conforme configuração da prova. Uma prova de certo/errado com penalidade não deve ser corrigida como um teste comum de alternativas. Versão das regras acompanha o resultado.

Respostas discursivas podem ter autoavaliação ou avaliação assistida por rubrica. Resultado da IA é identificado como estimativa, acompanhado de critérios e revisável; não deve se apresentar como nota oficial da banca.

**5. Métricas confiáveis e interpretação com IA**

| Medida | Responsável | Limite de interpretação |
|---|---|---|
| Acertos, erros, brancos, nota e tempo | Cálculo determinístico do Revisum | Obedecer à versão das regras e dados registrados |
| Desempenho por assunto/banca | Agregação do Revisum | Exibir tamanho da amostra e origem dos rótulos |
| Comparação de tentativas | Revisum | Distinguir repetição da mesma prova e questões inéditas; não misturar prática com simulado |
| Tendência/desempenho recente | Revisum, com janela explícita | Amostra pequena ou dados insuficientes devem aparecer como tal |
| Hipóteses de dificuldade | IA usando evidências autorizadas | Explicar quais questões/tentativas sustentam a hipótese; não diagnosticar a causa de um erro apenas pela alternativa escolhida |
| Explicações e estudo sugerido | IA com materiais e fontes | Separar evidência encontrada de inferência e permitir contestar |

Não estimar “probabilidade de aprovação” sem dados e validação específicos. Acertar uma questão repetida ou apenas abrir uma explicação não comprova domínio. O sistema registra atividade, desempenho e autoavaliação separadamente.

Comparações históricas devem preservar mudanças de classificação de assunto, rubrica e algoritmo. Labels sugeridos pela IA precisam de revisão ou indicação de que são inferidos. A análise não pode atribuir melhora causal a um vídeo apenas porque a nota posterior subiu.

**6. Preparação de estudo para os próximos dias**

Entradas: próximas revisões, provas agendadas, conteúdos cobrados, resultados recentes, histórico anterior, materiais disponíveis, preferências e disponibilidade diária. Uma prova ainda não realizada pode fornecer assuntos e estrutura; não é necessário antecipar seu gabarito durante o estudo.

O Revisum calcula uma prioridade inicial explicável usando vencimento, proximidade da atividade, erros observados, pré-requisitos e tempo disponível. A IA transforma essas necessidades em um plano e explicações. Não entregar à IA controle irrestrito do calendário ou do SRS.

Fluxo proposto:

```text
agenda + provas + tentativas + materiais relacionados
    → seleção de assuntos e evidências
    → prioridades e orçamento de tempo
    → proposta de plano
    → material local e, quando habilitada, pesquisa na web
    → explicações com fontes + exercícios + revisões
    → ajustes do estudante → nova versão aceita do plano
    → novas tentativas e feedback para próximas propostas
```

Cada atividade informa assunto, duração estimada, motivo, fontes e como verificar aprendizagem. A versão inicial permite explicação detalhada, leitura dirigida e conjunto de questões. Limitar volume e orçamento; não gerar uma apostila completa para cada questão errada sem necessidade.

Resultados devem citar páginas/trechos locais e URLs externas realmente obtidas. Questões oficiais permanecem distintas de questões geradas. Para temas sujeitos a mudança, como legislação cobrada em concurso, registrar data/contexto da prova e data da fonte; uma regra atual não deve substituir retroativamente o gabarito de uma prova antiga sem explicação.

**7. Pesquisa na internet, sites e vídeos**

Acrescentar um perfil de tarefa de “pesquisa de estudo” separado do primeiro perfil de análise local. Ele pode pesquisar e ler fontes públicas autorizadas, mantendo bloqueadas edição de projetos, shell, credenciais e ferramentas não homologadas. Permitir pesquisa não equivale a permitir escrita ou execução de comandos.

OpenCode V2 documenta provedores de busca e ferramentas distintas de `websearch` e `webfetch`; a conexão com um modelo não garante que a busca esteja pronta. A fase precisa verificar provedor, autenticação oficial, limites e erros, sem embutir credenciais no Revisum. A escolha do provedor e eventuais custos ficam para homologação; não serão assumidos por este planejamento. Fontes: [busca oficial OpenCode](https://opencode.ai/v2/docs/websearch/) e [ferramentas oficiais](https://opencode.ai/v2/docs/tools/).

Registrar consulta, objetivo, data, provedor, resultados retornados, critérios e resultado escolhido. Recomendar com título, URL canônica/identidade do vídeo, autor/canal quando disponível, assunto, idioma, nível, data conhecida e justificativa de adequação. Cada fonte informa o que foi possível verificar: metadados, página lida, transcrição autorizada ou somente link. Não afirmar que um vídeo foi assistido/analisado só por seu título.

Aplicar a preferência do estudante dentro do assunto e da finalidade. Priorizar confiabilidade e adequação; uma fonte favoritada não vira autoridade universal. Eliminar duplicatas e registrar links indisponíveis sem confundir indisponibilidade temporária com avaliação negativa do conteúdo.

Vídeos começam como links externos salvos, com trechos/timestamps informados quando houver base. Reprodução embutida depende de validação das regras, privacidade e configuração da WebView; a API oficial oferece player IFrame. Não assumir acesso livre a legendas/transcrições pela Data API: o endpoint de download de legendas exige autorização e permissões apropriadas. Fontes: [player YouTube](https://developers.google.com/youtube/player_parameters) e [download de legendas](https://developers.google.com/youtube/v3/docs/captions/download).

Não baixar vídeos ou materiais protegidos, contornar autenticação, automatizar login em plataformas de estudo ou montar cópias integrais de sites como pré-requisito. Guardar referência, notas e conteúdo permitido. Limites de acesso e direitos das fontes precisam ser respeitados na funcionalidade implementada.

Páginas externas não são carregadas como conteúdo privilegiado da janela principal. Downloads, scripts e comandos de páginas não viram ações automáticas. Validar URLs, redirects, esquemas e limites; bloquear destinos locais/privados e acesso a segredos no caminho de rede homologado. Se a ferramenta nativa do agente não permitir garantir esses limites, usar um transporte controlado ou manter a capacidade indisponível até homologação; um prompt não substitui esse controle. Tratar conteúdo web como dado não confiável.

Em falha de pesquisa, manter o plano com materiais locais e identificar a etapa pendente; não fabricar links ou fingir que a pesquisa foi concluída.

**8. Preferências e curadoria persistentes**

Ajustar as recomendações inicialmente significa manter uma memória local e explícita de escolhas e consultá-la nas próximas tarefas. Não requer treinar o modelo nem modificar silenciosamente a configuração global do OpenCode. Essa memória pertence ao Revisum e continua útil quando o modelo ou agente mudar.

| Ação do estudante | Informação guardada | Efeito proposto |
|---|---|---|
| Favoritar/salvar | Recurso e coleções/assuntos associados | Facilitar recuperação; não pressupõe que foi estudado |
| Preferir para este assunto | Recurso/canal/site, escopo e motivo opcional | Priorizar quando adequado ao mesmo contexto |
| Usar este link/vídeo no lugar | Recomendação original, substituta e justificativa | Reaproveitar a escolha corrigida em tarefas semelhantes |
| Não recomendar este recurso | Identidade estável e escopo | Excluir a recomendação naquele escopo |
| Evitar este canal/site | Regra explícita e alcance escolhido | Filtrar recursos correspondentes, sem ampliar a regra por inferência |
| Avaliar “superficial”, “desatualizado”, “didática ruim” | Critério e assunto/tarefa | Refinar formato, nível e critérios da próxima busca |
| Marcar estudado ou registrar resultado | Evento de atividade/tentativa separado | Informar continuidade; não converter clique em domínio |

Escopos: recurso específico, assunto, espaço ou preferência global escolhida explicitamente. Vídeos usam identidade do vídeo para não perder o feedback por variação de URL; sites preservam a diferença entre uma página e o domínio inteiro. Remover parâmetros de tracking sem remover parâmetros necessários ao conteúdo.

Um recurso fixado pode ser reutilizado diretamente quando ainda for pertinente. Isso não exige pesquisar de novo o mesmo URL a cada tarefa. Revalidar disponibilidade/atualidade quando apropriado e distinguir “usar esta fonte” de “encontrar outras semelhantes”.

O usuário deve poder ver por que uma fonte apareceu, editar o escopo, desfazer avaliações, remover preferências e exportar sua curadoria. “Não mostrar novamente” tem precedência sobre preferências positivas; correções explícitas têm prioridade sobre sinais implícitos. Não inferir rejeição a partir de fechar uma aba ou pular um vídeo.

Uma preferência não concede acesso de rede, autorização para ler arquivos nem permissão para executar comandos. Apenas o subconjunto pertinente da curadoria entra no contexto da tarefa. Resultados e histórico registram a versão dessas preferências, permitindo explicar recomendações antigas sem recalculá-las retroativamente.

**9. Persistência e módulos propostos**

Somar às entidades já propostas no diagnóstico, introduzindo tabelas por fase, não um schema completo antecipado:

| Grupo | Entidades propostas | Invariantes |
|---|---|---|
| Organização | study_space, space_material, collection e material_relation | Materiais e relações têm IDs estáveis; sem vínculo a login |
| Biblioteca | study_material, material_version/extraction, source_locator e índice textual | Versão da extração e origem localizáveis; original preservado |
| Provas | exam, exam_version, exam_question, answer_key_version e scoring_rule_version | Ordem, enunciado, gabarito e regras reconstituíveis |
| Tentativas | exam_attempt, attempt_answer, learning_attempt e eventos de pausa | Respostas preservadas; submissão idempotente; resultado calculado a partir da versão correta |
| Planejamento | scheduled_activity, study_plan, plan_version e plan_step | Separar agendamento de prova/revisão e preservar versões aceitas |
| Fontes web | external_resource, search_run, search_result e recommendation | Proveniência da busca, recurso escolhido e estado de verificação |
| Curadoria | resource_feedback, source_preference e recommendation_replacement | Escopo, motivo, data e reversão; sem dependência do provedor de IA |
| Execução | task/run/event/result e manifesto de contexto | Vínculo entre resultado, fontes, tentativas, política e versões |

Usar FKs/índices e transações conforme as operações, com política explícita para exclusão e arquivamento. Apagar um arquivo, prova ou fonte não deve apagar em cascata a evidência de uma tentativa já realizada; guardar snapshots/proveniência e sinalizar que o original foi removido. Estatísticas agregadas devem ser reconstruíveis quando os eventos necessários existirem.

Arquivos candidatos à evolução: navegação/layout em `src/layouts/`, `src/routes/AppRoutes.tsx` e `src/components/dashboard/`; leitores e trabalho em `src/features/workspace/` e `src/features/library/`; prova/análise em `src/features/exams/`; plano/curadoria em `src/features/study-plan/` e `src/features/resources/`. Esses diretórios novos são sugestões de implementação. Reaproveitar `src/features/reviews/`, componentes de questões e wrappers Tauri existentes após as correções.

No Rust, acrescentar módulos de biblioteca, provas, pontuação e planejamento, com repositórios SQLx e comandos tipados. Workflow educacional e curadoria ficam fora do adaptador OpenCode. Mudança de agente no futuro não deve perder avaliações, planos, relações, notas ou fontes favoritas.

**10. Critérios de aceitação da experiência**

- Importar uma coleção de arquivos, fechar o aplicativo e reabrir com organização, abas/posição quando suportadas e relações preservadas. Indicar claramente os formatos sem extração.
- Relacionar vários materiais entre si e com assuntos/questões, consultar relações nos dois sentidos e selecionar o contexto da tarefa sem liberar a biblioteca inteira.
- Realizar prova com gabarito oculto, interromper/retomar e obter a mesma nota em recálculos determinísticos; simulado e prática permanecem distinguíveis.
- Corrigir gabarito sem apagar a tentativa original, mantendo tanto sua nota histórica quanto um recálculo identificado.
- Consultar métricas mesmo sem IA/internet. IA deve citar tentativas/questões ao explicar dificuldades e reconhecer dados insuficientes.
- Gerar um plano para a janela escolhida, respeitando tempo disponível e próximas revisões; mostrar fontes e razões, permitir ajustes e preservar versões.
- Habilitar pesquisa de estudo sem liberar shell/escrita, obter links realmente retornados e distinguir vídeo recomendado de conteúdo efetivamente analisado.
- Substituir um vídeo por outro, reiniciar o app e verificar que a próxima tarefa do mesmo assunto considera a escolha; assunto diferente não herda automaticamente essa preferência.
- Rejeitar um recurso, conferir que não volta no escopo definido, desfazer a rejeição e restaurar elegibilidade. Link fora do ar não deve apagar notas/feedback.
- Exportar e restaurar materiais, relações, provas, tentativas e curadoria; recuperação não depende de conexão com OpenCode.
- Usar fluxos principais por teclado, com zoom e tema claro/escuro, em janela estreita; agentes/tarefas não podem ocultar questões ou bloquear a leitura.
- Testar prompt injection em arquivos, páginas e recomendações: nenhuma permissão nova é concedida pelo conteúdo ou pelo feedback do usuário sobre sua qualidade.

**11. Entregas e dependências**

As versões 0.4.0, 0.4.1, 0.5.0 e 0.6.0 do diagnóstico permanecem destinadas a dados, correções, retirada de login e atualizações. A direção de produto altera as entregas posteriores; o roadmap principal foi atualizado para refletir essa sequência:

| Versão proposta | Escopo limitado | Critério principal |
|---|---|---|
| 0.7.0 | Shell do workspace, navegação contextual, abas e continuidade dos estudos existentes | Fluxos atuais acessíveis na nova estrutura, sem perda de dados ou dependência de IA |
| 0.8.0 | Biblioteca gerenciada, TXT/Markdown/PDF textual, coleções e relações manuais | Guardar, localizar, relacionar e citar materiais com estado de extração explícito |
| 0.9.0 | Provas montadas/cadastro e importação estruturada, tentativa persistida, timer e métricas determinísticas | Simulado corrigido de forma reproduzível com interrupção/retomada |
| 0.10.0 | Homologação, instalação guiada e conexão OpenCode | Versão, provedor e política prontos; diagnóstico de falhas útil |
| 0.11.0 | Tarefas locais de análise/explicação e sugestões de relações | Resultado rastreável e validado, sem alterar originais nem pontuação |
| 0.12.0 | Agenda, plano por próximas provas/revisões e evidências de desempenho | Proposta explicável, tempo limitado e versões aceitas preservadas |
| 0.13.0 | Pesquisa web homologada e recomendação de sites/vídeos com fontes | Pesquisa restrita, proveniência e fallback para estudo local |
| 0.14.0 | Curadoria persistente e uso do feedback para personalizar recomendações | Escolha/rejeição/substituição respeitadas por escopo e reversíveis |
| 0.15.0+ | PDF de prova com extração assistida, OCR, DOCX ou exercícios práticos, cada capacidade em entrega própria | Homologação do formato ou do modo de execução, sem ampliar permissões por conveniência |

Podem existir prévias alpha/beta/rc e correções PATCH. Se uma linha crescer, dividi-la em novas MINOR e atualizar o mapa antes de implementar. Favoritos e feedback podem começar a ser coletados nas fases anteriores, mas só anunciar personalização quando o ciclo completo for testado. Nenhuma dessas propostas altera a versão nesta etapa documental.

A definição visual detalhada começa por protótipos dos três caminhos: ler/relacionar materiais, fazer uma prova e transformar resultados em plano. Validar esses fluxos antes de converter todas as telas. Não é necessário escolher agora um mecanismo de embeddings, um provedor de busca ou uma biblioteca de grafo para avançar com os fundamentos.
