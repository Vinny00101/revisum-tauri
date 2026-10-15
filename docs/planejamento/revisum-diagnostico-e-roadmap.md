**Revisum — diagnóstico técnico e plano incremental**

Análise de 15/10/2026. Base local: `5daf0ae7db0ebc5d0c9e12d19711bd2ef39217e0`, remoto configurado `https://github.com/Vinny00101/revisum-tauri.git`, tag local `v0.3.0`. Este documento é uma proposta de implementação; nenhuma funcionalidade descrita como proposta foi implementada nesta etapa.

**1. Diagnóstico do estado atual e limites da análise**

O projeto tem uma base aproveitável para um aplicativo pessoal de estudos: React/TypeScript, Tauri 2, serviços e repositórios Rust, SQLite e uma hierarquia de disciplinas, conteúdos e itens. Não há justificativa para reescrever a aplicação. O maior trabalho está em tornar confiáveis os dados e as revisões, retirar a dependência de contas e acrescentar módulos novos com limites claros.

Foram inspecionados fontes, manifests, lockfiles, migrations, capabilities, inicialização, workflow de publicação e o banco efetivamente encontrado no diretório do aplicativo. A árvore Git estava limpa. O código da aplicação e as migrations não diferem da tag v0.3.0; as diferenças posteriores à tag estão em publicação, README e licença.

Não foram instaladas dependências, compilado o aplicativo, aberto o Revisum, instalado/iniciado OpenCode nem executado o atualizador. Não há `node_modules` neste checkout. Não se deve interpretar esta análise como confirmação de build, de funcionamento visual ou de sucesso da matriz de instaladores. Abrir o Revisum acionaria sua inicialização normal e poderia modificar o banco; a análise evitou isso.

O banco foi examinado somente em memória, a partir de leitura dos bytes, com WAL vazio no momento da captura. Na cópia em memória, o indicador de journal foi adaptado para permitir a inspeção do snapshot sem abrir seus arquivos auxiliares. Nenhuma mudança foi gravada no banco original. Essa técnica foi usada apenas nesta investigação; o produto deve usar backup consistente do SQLite, inclusive com WAL ativo.

| Camada | Evidência encontrada | Avaliação |
|---|---|---|
| Interface | React 19.2.4 e React DOM 19.2.4 no lock; TypeScript ~5.8.3; Router 7.13.0 | Preservar componentes, rotas úteis e hooks |
| Build web | Vite 7.3.1 no lock; Tailwind 4; Framer Motion | Preservar; atualizar documentação dos requisitos |
| Desktop | Rust/Tauri 2.9.5 no Cargo.lock; API JS 2.9.1; CLI 2.9.6 | Já é Tauri 2; não planejar migração de Tauri 1 |
| Persistência | SQLx 0.8.6, SqlitePool, consultas parametrizadas, transações | Preservar SQLx como único responsável pelo banco |
| Migrations | `sqlx::migrate!("./migrations").run(&pool)` no startup | Já existe mecanismo versionado; falta operacionalização segura |
| Autenticação | Conta local, Argon2, `store.json` com usuário/expiração | Remover; nenhum serviço remoto de login encontrado |
| Arquivos | Avatar e imagens de questões em app_data_dir | Aproveitamento parcial, sem biblioteca de documentos |
| Publicação | GitHub Actions com Windows x64/ARM64 e Linux x64 | Pipeline existente; sem updater configurado e sem macOS |
| Testes | Sem suíte de testes encontrada e sem script de testes no package.json | Principal lacuna de confiança para a evolução |

O README informa Node 18+, mas o Vite travado exige `^20.19.0 || >=22.12.0`, e o Router exige Node 20+. O ambiente de análise tem Node 22.21.0; a CI usa Node 20 sem fixar sua revisão e executa `npm install`. Recomendo fixar uma versão compatível, usar `npm ci`, manter Cargo.lock e compilar com `--locked`. Reavaliar atualizações de dependências separadamente; não atualizar toda a stack junto da migração dos dados.

O plugin SQL consta dos manifests, preload e capabilities, mas não é registrado no Builder Rust e não encontrei consumo JS dele. O caminho efetivo é SQLx via comandos Rust. Isso é configuração residual, não evidência de dois bancos ativos. `protomatter` também não tem uso encontrado. `plugin-store` é usado pelo AuthStoreManager; `plugin-fs` e opener estão registrados, mas não encontrei consumo JS deles nas funcionalidades inspecionadas. Conferir usos e requisitos antes de retirar dependências.

**2. Inventário funcional: existente, parcial e novo**

“Existente” abaixo significa que foi encontrado um caminho implementado no código; não significa que esse caminho passou por teste end-to-end nesta etapa.

| Funcionalidade | Estado real | Reaproveitamento ou trabalho necessário |
|---|---|---|
| Disciplinas e conteúdos | Criação, consulta, alteração e exclusão implementadas | Preservar UI, serviços, DTOs e repositórios |
| Organização | Disciplina → conteúdo → item de estudo | Manter como base; materiais e projetos terão relações próprias |
| Flashcards | Criação, listagem, exclusão e revisão | Aproveitar; não encontrei edição completa de itens exposta por comandos/UI |
| Questões objetivas | Cadastro de alternativas e correção no backend | Corrigir contabilização e validar vínculos/alternativas |
| Questões discursivas | Cadastro de resposta esperada/critérios; resposta digitada e autoavaliação na UI | A resposta efetivamente digitada não é persistida no histórico encontrado |
| Imagens | Upload de avatar e enunciado; exibição por asset protocol | Validar tamanho, formato, extensão e diretório; lidar com arquivos órfãos |
| Sessões de revisão | Criação, timer, avaliações, resumo, finalização/cancelamento | Endurecer idempotência, interrupção e preservação do histórico |
| SRS | Estado e cálculo de intervalos presentes no repository | Parcial: não encontrei fila que selecione itens por next_review_date; CORRECT cai no caso padrão |
| Métricas | Tempo, streak, progresso, logs recentes e acurácia | Preservar a apresentação; corrigir fontes e regras antes de usá-las para adaptação |
| Login/cadastro/perfil | Implementados localmente, inclusive avatar e alteração de senha | Remover conta/autenticação; reaproveitar preferências e métricas |
| Telas adicionais | `/questions`, `/categories`, `/analysis`, `/config` apontam para DashboardMain vazio | Não tratá-las como módulos concluídos |
| Biblioteca PDF/DOCX/Markdown | Não encontrada | Desenvolver importação, metadados, extração e vínculo a estudos |
| Projetos e trilhas adaptativas | Não encontrados | Desenvolver após persistência de evidências de aprendizagem |
| OpenCode/workflow de IA | Não encontrados | Desenvolver conexão, execução, segurança e histórico |
| Atualizações automáticas | Não encontradas | Desenvolver integração, distribuição assinada e recuperação |
| Backup/restauração no produto | Não encontrados | Prioridade anterior a migrations destrutivas e updater |

**Problemas prioritários comprovados ou diretamente identificáveis no código**

1. **Validação incorreta de existência:** `content_repository.rs:166` executa `SELECT EXISTS(...)`, mas `db_methods.rs:82` considera apenas se uma linha retornou. SQLite retorna uma linha contendo 0 quando não existe; portanto essa validação pode aceitar conteúdo inexistente ou de outro usuário. Confirmei o comportamento SQL em memória. Corrigir o valor escalar ou usar `SELECT 1 ... LIMIT 1`, com teste negativo.
2. **Tempo duplicado:** o trigger de `02_foo.sql:73` soma a duração em qualquer atualização com end_time não nulo. Em teste sintético, finalizar duas vezes uma sessão de 60 segundos elevou o total a 120. Corrigir em migration nova e tornar a finalização idempotente também no serviço.
3. **Resposta objetiva não contabilizada:** `ReviewQuestion.tsx:46` chama `onFinish(question.id)` sem o segundo argumento, enquanto `useSession.ts:14` só registra se ele for verdadeiro. O resumo usa esse conjunto para contar acertos. É necessário separar “respondido” de “correto” e usar o resultado calculado pelo Rust.
4. **ID incorreto nas discursivas:** `ReviewQuestion.tsx:68` envia `question.id` onde `save_item_review` espera `study_item_id`. São chaves de tabelas diferentes; a falha pode passar despercebida quando os números coincidem. Corrigir o uso de `question.study_item_id` e os bloqueios por item.
5. **Métrica de domínio confundida com conclusão:** cards só entram no conjunto local quando EASY; itens já respondidos com outras avaliações podem ser reavaliados ao voltar. Definir tentativas distintas e impedir duplicação acidental do mesmo envio.
6. **Histórico insuficiente:** reviewlog guarda avaliação e tempo, mas não a alternativa selecionada, a resposta discursiva escrita ou a versão da rubrica. O tempo por item usa 0 como padrão nas chamadas atuais. Esses dados terão de ser acrescentados para adaptação explicável.
7. **Cancelamento destrutivo:** `cancel_session_review` deleta a sessão; com FK ativa isso apaga logs associados, embora o estado de revisão já atualizado possa permanecer. Fechar ou cancelar deve passar a registrar estado/interrupção, preservando tentativas.
8. **Ciclo de vida frágil:** ReviewSessionPage remove um listener de beforeunload sem adicioná-lo naquele fluxo e altera estado durante render no retorno de sessão finalizada. Não confiar em cleanup assíncrono da WebView para salvar histórico.
9. **Consistência dos serviços:** há `unwrap()` em entradas recuperadas do banco e leituras por pool fora da transação durante operações transacionais. Vínculos sessão/item/conteúdo precisam ser validados em conjunto. Há também retornos com `code: true` em alguns erros de usuário.
10. **Arquivos fora da transação:** gravação de imagem pode ocorrer antes do commit SQLite; rollback não remove o arquivo. Extensão e caminho anterior precisam de validação no backend. Não aceitar exclusão de caminhos arbitrários presentes em payload ou banco.
11. **Permissões residuais amplas:** assetProtocol tem scope `**`, e capabilities declaram execução SQL embora o plugin não esteja registrado. Isso deve ser reduzido antes de renderizar materiais externos ou resultados de agentes. As capabilities da WebView não limitam automaticamente um processo filho.

12. **Checksum dependente das quebras de linha:** `git ls-files --eol` mostra as três migrations com LF no índice Git e CRLF no checkout; `core.autocrlf` está true. O SQLx 0.8.6 calcula SHA-384 sobre os bytes do SQL, sem normalizar essas quebras. Confirmei que os hashes LF/CRLF são diferentes e que o banco local registra a variante CRLF. Um build que incorpore LF poderá rejeitar esse histórico, mesmo sem mudança lógica no schema. Não foi confirmado qual variante foi incorporada em cada instalador distribuído.

Os itens 1 e 2 tiveram reprodução SQL em memória; o item 12 foi confirmado por Git, comparação de hashes e leitura do código local do SQLx. Os demais são achados da leitura estática; precisam de testes de regressão e confirmação na execução da aplicação. Não foi feita auditoria de vulnerabilidades de todas as dependências.

**3. Inventário do SQLite e plano de migrations**

Banco ativo encontrado: `C:/Users/Vinicius/AppData/Roaming/com.vinicius.revisum/revisum.db`. O caminho é derivado de `app.path().app_data_dir()`, não deve ser hardcoded no produto. Preservar `identifier = com.vinicius.revisum`; sua troca pode fazer o aplicativo procurar outro diretório e aparentar perda dos dados.

O snapshot tinha 106.496 bytes, WAL vazio, integridade `ok` e nenhum resultado em foreign_key_check. Havia **2 usuários, 2 disciplinas — uma por usuário —, 1 conteúdo e nenhum item, sessão ou log de revisão**. Os nomes das disciplinas não colidiam entre as duas origens. Isso descreve este banco local, não todos os bancos já distribuídos. Outros arquivos de teste encontrados na pasta não foram migrados nem assumidos como parte do banco ativo.

O schema normalizado corresponde às migrations do checkout. `_sqlx_migrations` registra versões 1, 2 e 3 com sucesso e checksums SHA-384 correspondentes aos arquivos atuais. `PRAGMA user_version` é 0, o que não significa ausência de versionamento: o controle efetivo é do SQLx.

| Tabela | Conteúdo e dependências relevantes |
|---|---|
| user | id, username único, email, hash de password, avatar, datas |
| discipline | FK user_id; nome único por usuário |
| content | FK discipline_id; título único por disciplina; ordem |
| studyitem | FK content_id; tipo CARD ou QUESTION |
| card | FK study_item_id; frente e verso |
| question | FK study_item_id; tipo, enunciado e caminho de imagem |
| objective_answer | FK question_id; alternativa e indicador de correta |
| discursive_response | FK question_id; resposta esperada e critérios |
| user_status | FK/PK user_id; streak e tempo agregado |
| review_session | FKs user_id, discipline_id, content_id; tipo, tempos e totais |
| study_item_review_state | PK (user_id, study_item_id); ease, intervalo, repetições e datas |
| discipline_progress | PK (user_id, discipline_id); contadores e percentual |
| reviewlog | FKs sessão, usuário e item; avaliação e tempo |
| _sqlx_migrations | Registro técnico do SQLx, separado das 13 tabelas de domínio |

Há quatro triggers: finalização de sessão, inserção de disciplina, inserção de item e exclusão de item. Existem índices implícitos de PK/UNIQUE; não encontrei criação explícita de índices de consulta nas migrations. Novos índices devem acompanhar consultas medidas, especialmente vencimento de revisões e histórico.

**Abordagem recomendada:** manter SQLx, sem adicionar um segundo migrador. O mecanismo existente executa pendências e valida migrations aplicadas contra as fontes. Não editar nem renomear `01_foo.sql`, `02_foo.sql` ou `03_foo.sql`, apesar dos nomes pouco descritivos. Todas as correções virão em versões posteriores, com nomes claros. Referência: [Migrator do SQLx 0.8.6](https://docs.rs/sqlx/0.8.6/sqlx/migrate/struct.Migrator.html).

O novo bootstrap deve seguir esta sequência:

1. Resolver o diretório de dados e distinguir “arquivo ausente” de acesso negado, disco indisponível ou arquivo inválido. O atual `database_exists(...).unwrap_or(false)` esconde essa diferença.
2. Obter exclusão entre instâncias e impedir comandos normais de escrita durante manutenção. No código local de sqlx-sqlite 0.8.6, os métodos lock/unlock do migrador não fazem locking adicional; é necessário coordenar a manutenção no aplicativo, além das transações SQLite.
3. Inspecionar schema, histórico SQLx, versão de compatibilidade e espaço disponível. Banco de versão futura, checksum divergente ou migration incompleta deve bloquear escrita e abrir recuperação.
4. Validar integridade e FKs antes de transformação. Se houver órfãos, preservar e diagnosticar; não usar exclusão automática como reparo.
5. Criar backup consistente do banco e dos arquivos associados, com manifesto, versão do app/schema e verificação de leitura. Não copiar apenas revisum.db enquanto WAL tiver alterações. Preferir Online Backup API ou mecanismo equivalente validado para SQLx; `VACUUM INTO` pode ser alternativa avaliada. Referência: [SQLite Backup API](https://www.sqlite.org/backup.html).
6. Aplicar migrations ordenadas, normalmente transacionais, por conexão de manutenção controlada. Definir explicitamente FK, busy_timeout e política de journal/synchronous nas conexões; verificar seu valor no runtime, sem presumir que FKs estejam desativadas hoje.
7. Validar integridade, FKs, contagens, vínculos, triggers, índices e invariantes do domínio. Só depois liberar o pool e a UI de estudos.
8. Em erro, manter escrita bloqueada, preservar diagnóstico e backup, apresentar recuperação compreensível. Não apagar o banco nem repetir o processo em loop.

Schema e versão do app são eixos distintos: uma correção 0.4.1 pode não alterar o schema; uma release pode aplicar várias migrations. Manter `_sqlx_migrations` como fonte canônica e acrescentar apenas metadados de compatibilidade necessários, como versão mínima do leitor e versão que realizou a última transformação. Não criar dois contadores concorrentes de schema.

Para alterações SQLite simples, preferir adição de colunas/tabelas e backfill. Para remoção ou transformação de constraints, reconstruir tabelas com colunas explícitas, preservar IDs e relações, copiar dados e recriar índices/triggers. Se a reconstrução exigir suspensão de FKs, fazê-la numa conexão exclusiva, antes de BEGIN, seguir a sequência segura do SQLite e conferir foreign_key_check antes do commit. Não desligar FKs em um pool compartilhado. Referência: [procedimento oficial de ALTER TABLE](https://sqlite.org/lang_altertable.html).

**Reconhecimento de bancos antigos e baseline**

| Situação | Procedimento proposto |
|---|---|
| Banco vazio | Executar migrations históricas 1–3 e depois as novas |
| Banco com histórico válido 1–3 | Não refazer baseline; aplicar apenas a partir de 4 |
| Histórico parcial válido | Executar somente pendências, depois das verificações e backup |
| Schema legado reconhecido sem histórico | Fazer adoção explícita, validada e transacional do baseline; depois aplicar pendências |
| Schema desconhecido ou checksum divergente | Bloquear migração automática; preservar original e gerar diagnóstico |
| Schema mais novo que o binário | Bloquear escrita; orientar versão compatível ou restauração controlada |

Uma eventual adoção de baseline deve reconhecer estrutura completa: colunas, tipos, nulabilidade, PK/UNIQUE/CHECK, FKs, índices e triggers. Para fingerprint exatamente compatível com uma versão conhecida, registrar as migrations equivalentes como já aplicadas, usando formato e checksums esperados pelo SQLx. Isso exige rotina específica e fixtures; não deve ser feito por tentativa genérica ou simplesmente inserindo “versão 3”. Para schema diferente, preparar conversão explícita ou interromper.

Não reaplicar CREATE TABLE IF NOT EXISTS como mecanismo de reconhecimento: ele não corrige uma tabela antiga com colunas diferentes. A migration 2 também não é reexecutável integralmente, pois seu trigger de finalização não usa IF NOT EXISTS; isso foi reproduzido em memória. Esse fato não é defeito do versionamento atual, mas torna perigoso ignorar o histórico.

**Compatibilidade LF/CRLF precisa ser tratada antes de chamar o migrador.** Levantar checksums e bytes efetivamente distribuídos, criar fixtures de bancos LF e CRLF e escolher uma representação canônica para novos builds. Uma ponte de compatibilidade poderá reconhecer apenas os checksums históricos exatos dessas variantes, confirmar o schema correspondente, criar backup e registrar de forma transacional/auditável a equivalência com a representação canônica, sem executar novamente o SQL. Isso é uma exceção controlada para variantes byte a byte conhecidas; qualquer outro checksum continua bloqueado. A tabela de equivalências e o procedimento exigem testes e revisão próprios. Não “corrigir” todos os checksums, não desligar validação e não adicionar uma regra de .gitattributes que altere silenciosamente os históricos antes dessa ponte. Padronizar novas migrations e verificar os hashes incorporados na CI.

Evidência local do algoritmo: `C:/Users/Vinicius/.cargo/registry/src/index.crates.io-1949cf8c6b5b557f/sqlx-core-0.8.6/src/migrate/migration.rs`; transações e lock SQLite: `C:/Users/Vinicius/.cargo/registry/src/index.crates.io-1949cf8c6b5b557f/sqlx-sqlite-0.8.6/src/migrate.rs`. Esses arquivos foram apenas lidos.

Garantir que novas migrations incorporadas pelo macro sejam detectadas na recompilação, com `rerun-if-changed` em build.rs se necessário e teste do artefato instalado. Nunca desabilitar validação de checksums para contornar alterações históricas.

**4. Remoção completa do login sem perder estudos**

Não há serviço de contas externo encontrado. A autenticação é local e a “sessão de login” é um registro persistido com dados do usuário e expiração, sem sessão autenticada de servidor encontrada. Os comandos recebem user_id do frontend; isso não deve se transformar em mecanismo de autorização do futuro agente.

O maior cuidado é que já existem duas contas com dados. Não escolher automaticamente a primeira nem fixar `user_id = 1`, pois isso ocultaria a outra disciplina.

Recomendo um **ambiente pessoal único**, reunindo os estudos das duas origens e mantendo sua proveniência técnica. IDs de disciplinas, conteúdos, itens, sessões e logs já são globais nas tabelas e devem ser preservados. Não fundir disciplinas apenas porque têm o mesmo nome.

Implementar em mudanças pequenas, mas publicar a remoção como uma entrega completa:

1. Preparar e testar a conversão em cópia, com inventário por origem e backup verificado. Definir uma política determinística para nomes iguais: permitir nomes repetidos identificados por id ou desambiguar a exibição, conservando o nome original na proveniência.
2. Separar preferências locais opcionais — nome de exibição/avatar — de conta. Migrar metadados úteis para `local_settings`/preferências e origens para um registro de proveniência sem autenticação. Preservar todos os avatares antes de selecionar um para exibição.
3. Reconstruir relações de disciplina, sessão, logs e progresso sem FK obrigatória para user. Remover hashes de senha e campos exigidos apenas pelo cadastro. Só remover user após todas as tabelas dependentes e triggers terem sido convertidos; nunca usar DELETE FROM user para “limpar” o login.
4. Para estados múltiplos do mesmo item, manter os registros originais em arquivo/tabela de legado controlado e projetar o estado atual pelo último evento válido, com desempate definido. Não inventar eventos onde só há agregados. Estatísticas antigas que não possam ser reconstruídas ficam preservadas como legado, sem somar streaks ou tempos sobrepostos indiscriminadamente.
5. Retirar user_id dos DTOs de uso normal e resolver o contexto pessoal dentro do backend. A proveniência de migração não deve voltar a ser requisito de navegação ou “conta ativa”.
6. Abrir diretamente o dashboard. Remover login, cadastro, logout, expiração, proteção de rotas e tela de verificação de autenticação. Converter perfil em preferências/estatísticas pessoais.
7. Após commit e validação, remover somente a chave `auth` do store antigo; não excluir todo store.json caso outras preferências venham a existir. Backups antigos contêm hashes e dados pessoais: manter em armazenamento local protegido, fora dos materiais enviados ao agente, com retenção definida.
8. Remover Argon2, password-hash e rand se não restar uso; remover plugin-store apenas se nenhuma preferência o usar. Remover comandos antigos do invoke_handler e atualizar os lockfiles.

O banco atual tem nenhum histórico de revisão, mas a migração deve ser testada em bancos com histórico completo. Não limitar a solução ao pequeno conjunto encontrado nesta máquina. Também não prometer recuperação de respostas discursivas antigas: elas não foram persistidas pelo código atual.

**5. Arquitetura proposta e mapa de mudanças**

Preservar o arranjo geral React → comandos Tauri → serviços → repositórios SQLx. Reduzir gradualmente a dependência de `tauri::State` dentro dos serviços/repositórios para usar estado/pool explícito e permitir testes sem WebView. Não é necessário redesenhar todos os repositórios antes de começar.

```text
React: estudos, revisões, biblioteca, tarefas, configurações
                    │ comandos tipados / eventos
Rust/Tauri: aplicação e controle de acesso
  ├─ estudos e agendamento de revisões
  ├─ biblioteca e extração de materiais
  ├─ workflow de tarefas e validação dos resultados
  │     └─ adaptador OpenCode → API oficial local → OpenCode → provedor/modelo
  ├─ persistência: repositórios SQLx, migrations, backup e recuperação
  └─ atualização: plugin oficial, preparação e reinício
```

O workflow possui os estados, políticas, objetivos educacionais e registros do Revisum. O adaptador OpenCode possui os detalhes de conexão, versão do protocolo, IDs externos, eventos e cancelamento. DTOs educacionais não devem depender dos tipos de mensagem do OpenCode. Não criar registry de provedores de agentes, SDK universal, plugins para Codex/Claude ou interface genérica com implementações vazias nesta etapa.

| Área | Arquivos existentes provavelmente afetados | Módulos novos propostos |
|---|---|---|
| Bootstrap/dados | src-tauri/src/db/config.rs, db_methods.rs, lib.rs, build.rs, error/app_error.rs | db/preflight.rs, backup.rs, recovery.rs, compatibility.rs |
| Schema | src-tauri/migrations/01–03 preservados; novas migrations a partir de 04 | Fixtures de banco e metadados de compatibilidade |
| Login | src/routes/AppRoutes.tsx, components/ProtectedRoute.tsx, context/TauriContext.tsx, util/AuthStoreManager.ts, features/auth | Contexto de aplicação local e preferências |
| Conta/perfil | features/profile, layouts/DashboardLayout.tsx, dashboard/Navbar.tsx e Sidebar.tsx, tauri/user.ts | Comandos e serviço de preferências/estatísticas |
| Vínculos de usuário | Todos os comandos e serviços de estudo/revisão; model/user*, repository/user*, service_factory.rs, DTOs e src/types | Proveniência de migração, ambiente pessoal |
| Revisões | hooks/useSession.ts, ReviewQuestion.tsx, ReviewCard.tsx, SessionSummary.tsx, ReviewSessionPage.tsx, tauri/session.ts; review_service.rs e session_repository.rs | Módulo de algoritmo SRS e tentativas persistidas |
| IPC duplicado | src/tauri/studyItem.ts e src/features/discipline/tauri/studyItem.ts | Um único cliente de comandos de itens |
| Biblioteca | filesystem.rs, AppPaths, telas de disciplina/conteúdo | library/, extratores e repositories de materiais |
| OpenCode | lib.rs, Cargo.toml/Cargo.lock, capabilities apenas conforme necessidade | integrations/opencode/{connection,client,events,process,version}.rs |
| Workflow | lib.rs, tipos IPC e migrations novas | tasks/{workflow,policy,context,result_validation}.rs; repositories de tarefas |
| UI de IA | AppRoutes, Sidebar e ToastContext | features/tasks e configurações de conexão |
| Updater | tauri.conf.json, lib.rs, capabilities/default.json, manifests/locks, .github/workflows/revisum.yml | update_service.rs, UI de atualização e etapa de publicação |
| Versões | package.json, package-lock.json, src-tauri/Cargo.toml, Cargo.lock, tauri.conf.json, sversion.py | Validação de igualdade de versões em CI |

Esses são nomes sugeridos; a implementação pode ajustar a estrutura sem expandir o escopo funcional. Manter componentes de tabelas, navegação, toasts, animações e formulários existentes onde adequados.

**6. Interfaces oficiais do OpenCode e recomendação de integração**

A documentação consultada apresenta **OpenCode 1 e OpenCode 2**, ambos com comando `opencode`, mas com quebra de contrato de clientes/API/plugins. Portanto, instalar ou localizar um executável não confirma compatibilidade. Não usar “latest” indiscriminadamente nem presumir que `@opencode-ai/sdk` seja o SDK adequado a qualquer instalação. Referência: [migração oficial V1 → V2](https://opencode.ai/v2/docs/migrate-v1/).

| Interface | Evidência oficial | Aplicação no Revisum |
|---|---|---|
| V1 SDK JS/TS | `@opencode-ai/sdk`, cliente tipado, sessões e eventos | Opção apenas para uma versão V1 explicitamente homologada |
| V1 servidor | `opencode serve`, HTTP/OpenAPI, health/version, sessões, eventos SSE | API documentada; não compatível automaticamente com V2 |
| V2 cliente | `@opencode/client`, tipos gerados do contrato HTTP; entrada principal compatível com browser | Principal referência tipada para homologação do contrato V2 |
| V2 SDK embutido | `@opencode/sdk` hospeda o servidor em memória | Não recomendado inicialmente: muda a proposta de controlar instalação externa e amplia runtime/distribuição |
| V2 API HTTP | Referência OpenAPI com info, sessões, mensagens, permissões e eventos | Permite adaptador Rust; a superfície é descrita como experimental |
| CLI de tarefas | Execução não interativa existe | Não usar parsing de TUI, stdout informal ou logs como protocolo principal |

Fontes: [SDK V1](https://opencode.ai/docs/sdk/), [servidor V1](https://opencode.ai/docs/server/), [cliente V2](https://opencode.ai/v2/docs/build/client/), [SDK embutido V2](https://opencode.ai/v2/docs/build/sdk/) e [API HTTP V2](https://opencode.ai/v2/docs/api).

**Recomendação para o stack atual:** controlador de processo e adaptador HTTP/eventos no Rust, usando a API oficial do servidor externo. Isso mantém tokens de conexão e política fora da WebView e evita adicionar Node/Bun como sidecar apenas para iniciar processos. Avaliar um cliente Rust gerado de uma especificação fixada ou um subconjunto pequeno de endpoints com DTOs tipados. O cliente JS oficial deve orientar a prova de contrato; usá-lo diretamente na UI é alternativa, mas exige um transporte nativo seguro e não elimina a necessidade de Rust para lifecycle e permissões.

O alvo inicial proposto é **uma versão V2 explicitamente homologada**, com sua API fixada, sem suporte simultâneo V1/V2. Como a API V2 é experimental, a fase de integração começa com prova de conexão, eventos, cancelamento e política. A versão exata, distribuição e mínimo suportado só serão definidos após essa prova; este relatório não inventa um intervalo de versões testado. Se o contrato não cumprir os requisitos, essa fase deve ser revista antes de disponibilizar execução. As fases de banco, login e updater independem dessa decisão.

Não tratar helpers Node de descoberta de serviço do cliente V2 como disponíveis em React/Tauri. Não ler arquivos internos de credenciais para “descobrir acesso”. Para conexão a serviço existente, usar o mecanismo oficial de pairing/configuração fornecida pelo usuário. A V2 tem serviço compartilhado; o Revisum só pode encerrar processo/instância que possuir, nunca indiscriminadamente qualquer `opencode` encontrado. Referência: [serviço de background e modos de conexão](https://opencode.ai/v2/docs/cli/).

**7. Instalação guiada, assistida ou automática**

| Opção | Vantagens | Custos/riscos | Recomendação |
|---|---|---|---|
| Guiada | Menos privilégios; usuário mantém controle da instalação e autenticação | Mais passos iniciais; diferenças de PATH e SO | Primeira versão |
| Assistida com ação explícita | Conveniência e diagnóstico integrado | Precisa reconhecer método, arquitetura, pacote e conflitos | Etapa posterior, após integração estabilizada |
| Automática silenciosa | Menos interação aparente | Pode substituir instalação, executar scripts, pedir elevação e quebrar compatibilidade | Não adotar inicialmente |

A documentação distingue inclusive os pacotes: V1 usa `opencode-ai`; V2 usa `@opencode/cli` ou binários próprios. Há binários V2 para Windows, macOS e Linux, e a página V2 informa que gerenciadores de pacotes Windows não são suportados. Não apresentar instruções V1 de Scoop/Chocolatey como se valessem para V2. Referências: [instalação V1](https://opencode.ai/docs/) e [instalação V2](https://opencode.ai/v2/docs/).

Fluxo guiado proposto:

1. Detectar executável sem iniciar tarefas: busca controlada no PATH do processo e opção de selecionar caminho. Não executar um `opencode` localizado em diretório de material importado. Validar identidade, versão, timeout e código de saída usando opção oficial.
2. Diferenciar ausente, não executável, versão incompatível, serviço indisponível, conexão recusada e porta ocupada. Aplicativos iniciados pelo menu podem ter PATH diferente do terminal, especialmente em macOS/Windows.
3. Exibir instruções oficiais específicas da família/versão e do SO. Disponibilizar copiar instrução/abrir documentação, sem executar instaladores automaticamente.
4. Orientar autenticação no próprio OpenCode pelo fluxo oficial `/connect`/provedor. O Revisum não importa auth.json, cookies, tokens de outros agentes nem credenciais de sessões privadas.
5. Conectar ao endpoint autorizado ou iniciar processo próprio com parâmetros fixos. Usar loopback, autenticação oficial e uma estratégia explícita de ownership. Detalhes de serve/pairing devem corresponder à versão homologada.
6. Verificar identidade do servidor, versão, prontidão e modelo/provedor selecionado. “Servidor conectado” não comprova autenticação válida no provedor. Um teste mínimo explícito deve detectar credencial expirada, quota ou modelo indisponível.
7. Liberar tarefa somente com conexão e política prontas; exibir erro com ação possível, como revisar caminho, conectar provedor ou tentar novamente.

“Agente local” descreve o processo de execução. O modelo pode ser remoto e receber os trechos enviados. A UI precisa informar provedor e destino dos materiais; funcionamento totalmente offline depende de modelo/provedor local configurado e testado, e não existe no projeto hoje.

Uma instalação assistida futura precisará: fonte oficial por SO/arquitetura; versão fixada; checksum e assinatura/proveniência verificável conforme disponibilizados; download temporário; verificação antes de execução; instalação por usuário quando suportada; tratamento de UAC/permissões Unix/quarentena; detecção de pacote já gerenciado; rollback do binário; compatibilidade glibc/musl no Linux; atualização separada do Revisum. Um hash baixado da mesma fonte sem autenticação não substitui assinatura. Não sobrescrever V1 com V2 ou uma instalação gerenciada pelo usuário sem decisão explícita. WSL demanda tratamento de caminhos, serviço e rede próprio e fica fora do suporte inicial, salvo homologação específica.

**8. Workflow de tarefas e segurança**

Primeiro escopo: resumir materiais selecionados, explicar conceitos, identificar tópicos/lacunas e propor uma trilha em rascunho. O agente não altera documentos originais, projetos, banco do Revisum ou agenda de revisão. O Revisum grava seu próprio histórico e os rascunhos validados; “somente leitura” se refere ao acesso do agente aos materiais/projetos.

```text
rascunho → preparando contexto → pronto → executando → validando → concluído
                                 │           │             └→ resultado inválido
                                 │           ├→ conexão perdida → reconciliando
                                 │           ├→ aguardando decisão permitida
                                 │           └→ cancelando → cancelado/interrompido
                                 └→ bloqueado por conexão/política
```

Não chamar uma tarefa de concluída apenas porque o stream terminou. O estado terminal depende da sessão/mensagem confirmada, ausência de execução pendente e resultado validado.

Etapas do workflow:

1. Registrar tarefa com UUID interno, objetivo, tipo, versão do contrato, limites, modelo/provedor e política. Inicialmente executar uma tarefa por vez.
2. Selecionar explicitamente materiais e conhecimentos prévios. Montar um manifesto com IDs, hashes, versão da extração e localizadores de páginas/trechos. Não enviar o banco inteiro ou a pasta pessoal.
3. Preparar diretório de contexto pertencente ao Revisum, separado de AppData sensível e do projeto original. Copiar apenas material autorizado; excluir configurações executáveis, `.opencode`, plugins, arquivos de ambiente, chaves e backups. Validar caminhos canônicos e symlinks/junctions.
4. Mostrar materiais e destino do modelo e aplicar política efetiva. Contexto importado é dado não confiável: instruções nele não podem conceder ferramentas ou permissões.
5. Criar sessão externa e persistir seu vínculo antes de enviar trabalho. Continuar uma sessão somente quando tarefa, contexto, versão e política forem compatíveis. Sessões de revisão humana e sessões OpenCode são entidades diferentes.
6. Acompanhar eventos filtrados pela sessão/localização e persistir marcos. Não registrar tokens ou payloads secretos. Se ocorrer perda de conexão, consultar estado/mensagens e reconciliar antes de reenviar.
7. Validar a resposta por contrato do Revisum: schema, campos obrigatórios, limites, referências aos materiais, IDs conhecidos e ausência de instruções executáveis. Usar saída estruturada suportada pela versão; caso ela não esteja disponível, validar o JSON recebido e tratar falha como resultado inválido.
8. Guardar resultado bruto limitado e resultado validado, com proveniência. Apresentar proposta ao estudante; a incorporação a conteúdos/trilhas é comando explícito do Revisum.
9. Em cancelamento, solicitar interrupção oficial e confirmar estado. Distinguir solicitação enviada de processo realmente parado. Não apagar tarefa nem logs.

A documentação V2 do cliente informa que eventos são ao vivo, sem replay nem reconexão automática. Portanto, implementar reconexão com backoff e reconciliação por leitura de sessão/mensagens; não pressupor entrega exatamente uma vez. Falha após envio, mas antes de registrar resposta, deve produzir estado “resultado incerto” até reconciliação, não uma segunda execução silenciosa.

Persistência nova proposta, criada apenas nas fases correspondentes: `study_material`, `material_extraction`, `task`, `task_material`, `task_run`, `task_event`, `task_result` e registros de política/decisão quando necessários. Uma nova tentativa de execução é um run distinto; IDs externos pertencem ao adaptador. Trilhas e etapas terão tabelas próprias posteriormente. Registrar versão do prompt/contrato e do algoritmo; retenção de eventos deve ter limite, sem apagar resultados ou evidências essenciais.

**Controles concretos**

- Negar por padrão ferramentas não necessárias. Permitir somente leitura/pesquisa do contexto autorizado. Na primeira entrega, bloquear shell, escrita/patch, execução de código, subagentes, MCP e ferramentas/plugins não homologados, assim como rede de pesquisa fora do escopo. O acesso do provedor ao modelo é uma necessidade separada.
- Não confiar apenas no agente “plan”: ele tem regras próprias e não equivale a sandbox do SO. Na V2, subagentes possuem suas próprias permissões e shell usa a autoridade do usuário do sistema. Regras e ações V1/V2 diferem. Verificar política efetiva e negar execução se ela não puder ser aplicada. Referência: [permissões oficiais V2](https://opencode.ai/v2/docs/permissions/).
- Usar processo/configuração de execução controlados, sem carregar plugins de materiais ou projetos arbitrários. Auditar precedência de configuração e políticas administrativas da versão suportada. Um serviço compartilhado cuja política não possa ser garantida pode servir para diagnóstico, mas não deve receber tarefa declarada como restrita.
- Caminho autorizado e cwd não constituem isolamento do sistema operacional. Para prometer contenção forte de todo o processo, adicionar sandbox por plataforma. Na primeira versão, documentar o limite da garantia, reduzir ferramentas/contexto e comprovar por testes adversariais o comportamento esperado; não anunciar isolamento absoluto.
- Não executar comandos encontrados em texto de resposta. Não fornecer endpoints genéricos “executar shell”, “acessar qualquer URL” ou “escrever arquivo” à WebView. Eventos do agente atualizam estado e resultados, sem disparar ações arbitrárias.
- Impor limites de tempo, tamanho de material, saída, eventos, número de passos quando suportado e concorrência. Limite de custo só pode ser garantido quando houver controle correspondente do provedor; não prometer hard cap baseado apenas em estimativa de tokens.
- Renderizar Markdown sem HTML ativo ou scripts; validar links e imagens. Manter credenciais de conexão no backend/memória ou armazenamento seguro do SO se persistência se tornar necessária.
- Operações futuras de escrita devem usar cópia/worktree isolada, aprovação específica para comandos, testes e alteração, visualização do diff e possibilidade de descarte. Não reutilizar autorizações de leitura para isso.

**Comandos e permissões Tauri**

Propor comandos estreitos: `get_app_state`, `check_database_health`, `create_backup`, `restore_backup`, `get_opencode_status`, `configure_opencode_connection`, `connect_opencode`, `start_study_task`, `cancel_study_task`, `get_task_history`, `get_task_result`, `check_app_update`, `download_app_update` e `install_app_update`. São propostas de API, não comandos existentes. Restauração exige escolha explícita do backup e validação antes de substituir dados.

Eventos Rust → UI devem transportar progresso e estado tipados. Toda entrada é validada no backend, mesmo quando selecionada na UI. Para iniciar OpenCode, usar criação nativa de processo com executável validado e vetor fixo de argumentos, sem `cmd /c`/shell concatenado. No Windows, suportar wrappers de gerenciador de pacotes apenas com launcher específico auditado; não transformar um `.cmd` arbitrário em exceção genérica.

Não é necessário adicionar plugin-shell, plugin-http ou plugin-process ao frontend se Rust executar lifecycle/rede e o updater for encapsulado por comandos. Se optar por APIs JS dos plugins, conceder somente permissões necessárias de check/download/install e relaunch, conforme schemas da versão instalada. O plugin-process serve para exit/relaunch; não substitui controle de subprocessos.

Remover permissões SQL residuais e restringir assets aos diretórios de imagens/materiais apresentados. Um seletor de arquivos pode exigir plugin-dialog; ele deve conceder seleção, sem leitura recursiva global. Não habilitar acesso remoto às capabilities da janela principal. Referência: [capabilities Tauri](https://v2.tauri.app/security/capabilities/).

**9. Atualizador Tauri e publicação segura**

Estado encontrado: nenhum plugin updater ou process nos manifests; nenhum registro de updater no Builder; nenhuma pubkey, endpoint ou createUpdaterArtifacts; nenhum uso de UI de atualização. A CI publica rascunhos, usa `prerelease: false`, e não contém configuração de assinatura de updater. Não foi possível confirmar nesta análise o flag da release remota v0.3.0; a classificação como pre-release foi informada pelo usuário e deve orientar a nova política.

O suporte proposto começa nas plataformas já presentes na CI, após comprovar seus builds. macOS exige adicionar runners, alvos e assinatura/notarização; não está suportado operacionalmente apenas por o Tauri permitir compilação.

Plano em partes verificáveis:

1. Adicionar `tauri-plugin-updater` compatível com a linha Tauri 2 homologada, registrar no Rust e fixar locks/toolchain. Verificar MSRV da versão selecionada; a documentação atual indica Rust 1.90+, enquanto o ambiente analisado tem 1.93. Não adotar uma revisão nova sem compilar todas as plataformas.
2. Configurar geração de artefatos, chave pública e endpoint HTTPS. Guardar chave privada e senha somente como secrets de publicação, com backup seguro e acesso restrito. O cliente distribuído recebe apenas a pública.
3. Preparar metadados com versão SemVer, notas, data, plataformas e URL/assinatura de cada artefato. A assinatura é o conteúdo gerado para o pacote exato; não um link para `.sig`.
4. Implementar serviço e UI: verificação automática com intervalo/backoff e ação manual; versão/notas disponíveis; consentimento para instalar; progresso, cancelamento quando suportado, erro e tentativa novamente; aviso de reinício. Não atualizar no meio de revisão ou tarefa.

Esses requisitos e formatos estão descritos no [updater oficial Tauri 2](https://v2.tauri.app/plugin/updater/). Requisitos de migrations, compatibilidade e backup descritos neste plano são responsabilidades adicionais do Revisum.

5. Ajustar a CI para gerar instaladores e assinaturas por alvo, validar igualdade das versões/tag, testar migrations e consolidar um único manifesto após todos os jobs esperados. Não expor manifesto parcial durante builds paralelos. Publicar o feed apenas depois da aprovação dos artefatos completos. A ação oficial auxilia na publicação dos metadados/assinaturas: [tauri-action](https://github.com/tauri-apps/tauri-action).
6. Separar canal de testes e estável. A URL GitHub `releases/latest/download/latest.json` não deve ser assumida como feed de pre-releases. Recomendo um feed HTTPS público separado por canal, com URLs de artefatos imutáveis por tag, e apenas versões explicitamente promovidas. Não embutir token privado do GitHub no app para baixar atualizações.
7. Ensaiar atualização entre duas versões realmente instaladas em cada alvo e formato. O plano de suporte inclui Windows x64/ARM64 e Linux x64; validar combinação de instalador e arquitetura, permissões e mudança de formato. Para Linux, tratar AppImage como canal de updater; DEB/RPM seguem o gerenciador de pacotes, sem prometer o mesmo auto-update. Para macOS futuro, planejar app bundle e pacote de atualização apropriado.
8. Validar assinatura incorreta, pacote trocado, arquivo truncado, feed malformado, versão igual/menor, alvo ausente, falta de rede e espaço, download interrompido e falha do instalador. Não presumir retomada por HTTP Range: inicialmente uma nova tentativa pode reiniciar o download.

Assinatura do updater não substitui Authenticode do Windows nem Developer ID/notarização do macOS. Planejar os dois níveis separadamente, inclusive custos/certificados e manutenção de identidade. Windows pode executar aplicações sem assinatura de código, mas isso não elimina avisos de reputação. Fontes: [assinatura Windows](https://v2.tauri.app/distribute/sign/windows/) e [assinatura macOS](https://v2.tauri.app/distribute/sign/macos/).

**Proteção dos dados no update**

Antes de instalar: impedir novas escritas, finalizar ou interromper de forma persistida as atividades, validar compatibilidade, criar backup consistente com inventário de imagens/materiais e fechar o pool. Se backup obrigatório falhar, a instalação é bloqueada com explicação.

Depois de instalar: o novo binário executa preflight e migrations antes de permitir estudos. Instalação não deve incluir um banco modelo sobre AppData, alterar o identificador do produto nem remover o diretório de dados. Ensaiar esses comportamentos no instalador real, incluindo execução interrompida e reabertura.

O updater valida o pacote, não a compatibilidade do schema. A partir da release que introduzir a infraestrutura, definir contrato mínimo de leitor/schema e uma política de versões intermediárias quando necessário. Para instalação manual que pule versões, todas as migrations suportadas devem continuar embarcadas; casos fora da faixa suportada devem abrir recuperação sem escrever.

Rollback do executável não desfaz migration. Não executar down migration destrutiva automaticamente. Se o binário anterior não entende o schema, ele não deve ser autorizado a escrever; esse bloqueio só pode ser garantido por versões que já o implementem. A v0.3.0 não possui essa proteção. Recuperação pode exigir a cópia pré-update e binário compatível; preservar também o banco pós-falha para não descartar dados novos sem decisão do usuário.

Usuários na v0.3.0 precisarão instalar manualmente a primeira versão que contém updater. Ela não pode receber atualização automática retroativamente. O primeiro teste automático será dessa nova versão para uma release seguinte assinada.

**10. Plano de testes e critérios de aceitação**

Priorizar testes que protejam dados e cruzem fronteiras reais: SQLx/SQLite, comandos/serviços, processo/API OpenCode e instaladores. Criar fixtures sintéticas; não versionar o banco pessoal do usuário.

| Área | Casos obrigatórios | Aceitação |
|---|---|---|
| Inicialização | Banco vazio, já migrado, arquivo inacessível, inválido e schema futuro | Nunca substituir banco existente por vazio; erro recuperável e sem escrita indevida |
| Migrations | Histórico 1/2/3, variantes LF/CRLF reconhecidas, baseline reconhecido, parcial, checksum desconhecido, queda durante transformação, disco cheio | Ordem correta, transações, integridade/FKs e equivalência dos dados; nova abertura idempotente; nenhum bypass de checksum desconhecido |
| Backup | WAL ativo, muitos anexos, pouco espaço, interrupção, restore | Backup verificável; restauração recupera estudos e vínculos, preservando original |
| Múltiplos usuários antigos | 0/1/N usuários, nomes iguais, histórico e estados compartilhados inconsistentes | Todos os estudos visíveis no ambiente único; IDs, logs e proveniência preservados |
| Login removido | Primeira abertura e abertura com store antigo/expirado | Dashboard direto, sem cadastro, senha, logout ou user_id obrigatório nos fluxos |
| Revisão | IDs distintos de question/studyitem, acerto/erro, HARD/MEDIUM/EASY, reenvio e navegação | Resultado salvo no item correto; respondidos/acertos separados; sem duplicação involuntária |
| Finalização/cancelamento | Finalizar duas vezes, fechar janela, crash e sair sem concluir | Tempo não duplicado; logs preservados; estado interrompido recuperável |
| SRS | Datas/fuso, item novo, erro, acerto objetivo, vencimento e repetição | Algoritmo documentado e versionado, fila realmente respeita agendamento |
| Arquivos | Extensão falsa, tamanho excessivo, symlink/junction, arquivo removido, rollback | Sem escape de diretório; sem leitura de arquivos privados não selecionados |
| OpenCode conexão | Ausente, versão errada, PATH divergente, porta ocupada, serviço compartilhado | Erro acionável e nenhuma tarefa executada antes da prontidão/política |
| OpenCode execução | Auth expirada, quota, eventos duplicados/perdidos, saída inválida e cancelamento | Estados persistidos, reconciliação sem reenvio silencioso e histórico íntegro |
| Política de IA | Prompt injection pedindo shell/segredos/MCP/edição/subagente | Operações negadas e auditáveis; originais e banco sem alterações pelo agente |
| Updater | Duas instalações reais, pacote adulterado/truncado, rede/instalador falhando | Só pacote válido instala; dados preservados; app antigo continua utilizável se instalação não ocorreu |
| Release | Tags/versions, todos os alvos, assinaturas e feed por canal | Nenhuma publicação parcial ou chave privada exposta; pre-release não chega ao canal estável |

Ferramentas propostas: testes Rust de serviços/algoritmo e integração SQLx em bancos temporários; testes de UI com mocks tipados onde úteis; testes de contrato com servidor OpenCode real homologado; smoke tests dos instaladores por SO/arquitetura. Não depender exclusivamente de mocks para permissões, migrations ou updater. E2E via WebDriver deve respeitar o suporte de cada plataforma; em macOS pode ser necessário roteiro manual de aceitação.

Verificações já feitas nesta análise: execução dos três scripts SQL em SQLite em memória; integridade/FKs desse schema; reprodução da duplicação do trigger; verificação do retorno de SELECT EXISTS; comparação do schema normalizado e checksums com o banco local. Não foram executados testes Rust/React, CI ou atualização instalada.

**11. Riscos, decisões pendentes e dependências externas**

| Prioridade | Risco/decisão | Tratamento proposto |
|---|---|---|
| P0 | Perda de dados na retirada de user e FKs CASCADE | Backup/restauração primeiro; transformação por cópia e comparação; remover dependências antes da tabela |
| P0 | Bancos distribuídos diferirem deste banco local | Fixtures por release e reconhecimento explícito de schema; bloquear desconhecidos |
| P0 | LF/CRLF produzir checksum incompatível entre builds | Homologar variantes históricas e ponte auditável antes de padronizar bytes; testar banco Windows em build com conteúdo canônico |
| P0 | Métricas atuais alimentarem trilhas incorretas | Corrigir tentativas, IDs, acurácia e SRS antes da adaptação |
| P0 | Agente executar comandos ou carregar configuração não confiável | Contexto mínimo, política efetiva testada, sem shell/plugins externos; sandbox quando exigida contenção forte |
| P1 | OpenCode V1/V2 e API V2 experimental | Homologar uma família/revisão; teste de contrato e aviso de versão incompatível |
| P1 | Processo local usar provedor remoto | Informar destino e selecionar explicitamente o material enviado |
| P1 | Atualização sem assinatura/feed confiável | Chave pública embarcada, segredo restrito, manifesto promovido apenas após validação |
| P1 | Atualização/retorno entre schemas incompatíveis | Contrato de leitor e recuperação; sem promessa de rollback automático de dados |
| P1 | Windows ARM64/Linux/macOS sem smoke test real | Não declarar suporte por existência de entrada na matriz; homologar instalação e atualização |
| P2 | Extração PDF/OCR/documentos malformados | Limites, processo isolado quando necessário, erros por arquivo e proveniência |
| P2 | Consultas N+1 e acoplamento a State | Refatorar nos caminhos que forem alterados; medir antes de otimizar em bloco |

Decisões propostas como padrão, ainda ajustáveis na fase correspondente:

- Ambiente pessoal único com todas as origens locais preservadas; sem perfis com login disfarçado.
- Instalação guiada do OpenCode e uma versão V2 homologada; sem suporte WSL ou instalação automática inicial.
- Backend Rust como responsável por workflow, política, processo e transporte; cliente/API oficial como contrato.
- Materiais iniciais TXT/Markdown e referências a projetos selecionados; PDF textual após prova do extrator. DOCX e OCR em entregas próprias. Não enviar formatos desconhecidos diretamente ao agente como se tivessem sido extraídos.
- Manter originais gerenciados pelo Revisum para materiais importados quando o usuário escolher importar; referências externas devem ser explícitas e detectar desaparecimento/alteração. Guardar hash e versão, sem deduplicar silenciosamente documentos diferentes.
- Canais separados de testes/estável e instalação de update controlada. Definir hospedagem exata do feed antes da fase de publicação.
- Retenção inicial proposta: últimos três backups válidos e sempre o imediatamente anterior à transformação incompatível, sujeitos a espaço e configuração. A regra final precisa definir limpeza segura, sem apagar o único backup restaurável.

Dependências externas: acesso a releases/contratos oficiais OpenCode; instalação e autenticação válidas do provedor; disponibilidade/limites do modelo; GitHub Actions/releases e hospedagem pública HTTPS; guarda das chaves de updater; eventual certificado Windows e conta Apple para macOS. Nenhuma dessas configurações foi presumida como já existente ou foi criada nesta etapa.

**12. Roadmap priorizado e política de versões**

Usar a v0.3.0 como referência histórica e começar a próxima implementação na linha **0.4.0**. Esta análise não altera a versão. O nível atual é de uma aplicação inicial de revisão com funcionalidades parciais, não de um produto pronto para 1.0.

Cada entrega publicada recebe um novo número: PATCH para correção de comportamento/segurança sem nova capacidade de produto; MINOR para nova capacidade ou mudança incompatível durante 0.x. Uma fase pode ter várias prévias `-alpha.N`, `-beta.N`, `-rc.N`, sem alterar a release já publicada. Commits intermediários de uma mesma entrega não exigem uma nova MINOR. Se uma correção crescer para feature, reavaliar o número antes de publicar. Marcar explicitamente pre-release no GitHub quando aplicável; testar a conversão do SemVer nos instaladores Windows.

`sversion.py` hoje sincroniza somente package.json → tauri.conf.json. Ele não mantém Cargo.toml nem ambos os locks. A primeira fase deve validar as cinco fontes relevantes e a tag em conjunto; preferir uma fonte canônica e uma verificação de CI que impeça divergências.

| Ordem/versão proposta | Entregas pequenas, em sequência | Arquivos/módulos afetados | Resultado e verificação de saída |
|---|---|---|---|
| Fase 0 — análise atual | Inventário, diagnóstico e decisões-base | Somente este relatório, fora do repositório | Código, manifests e banco pessoal sem alterações |
| P0 — 0.4.0-alpha.1 até 0.4.0 | 1) Fixar processo de build/versões; 2) fixtures de schema/histórico e variantes LF/CRLF; 3) preflight e exclusão de manutenção; 4) backup/restore; 5) ponte restrita de checksums conhecidos, compatibilidade e tela de recuperação | db/config.rs, novos db/preflight/backup/recovery/compatibility, lib.rs, build.rs, error, CI, manifests, sversion.py e política de EOL após a ponte | Banco vazio e v0.3.0 abrem com variantes conhecidas; corrupção/checksum desconhecido/schema futuro bloqueiam escrita; backup com WAL restaura dados e arquivos. Não remover login ainda |
| P0 — 0.4.1 | 1) Corrigir EXISTS/vínculos; 2) corrigir IDs de questões e respondidos/acertos; 3) nova migration para trigger idempotente; 4) cancelamento persistido e finalização confiável; 5) separar/testar a regra SRS existente | review_service, session/content repositories, nova migration 04+, hooks/useSession, componentes de revisão e tauri/session | Testes negativos passam; finalizar duas vezes soma uma vez; cancelamento não perde logs; IDs e métricas corretos. Se o escopo incluir um novo mecanismo de revisão, promovê-lo para uma MINOR própria |
| P0 — 0.5.0 | 1) Simular migração pessoal com múltiplas origens; 2) converter schema e estatísticas/proveniência; 3) trocar contexto e IPC; 4) retirar telas/comandos/dependências de autenticação | Migrations novas, user/model/repository/service/command, service_factory, src/tauri, AppRoutes, TauriContext, AuthStoreManager, layouts, perfil, manifests/locks | Dashboard direto; ambas as disciplinas do banco atual e todo histórico dos fixtures acessíveis; nenhuma senha/cadastro exigidos; sem tabelas de autenticação no schema ativo |
| P1 — 0.6.0 | 1) Plugin/configuração e UI; 2) segredos e artefatos assinados; 3) feed separado por canal; 4) instalação controlada e recuperação; 5) promoção de release testada | update_service, lib.rs, tauri.conf/capabilities, manifests/locks, features/config, CI | Instalador manual introduz updater; duas prévias permitem ensaio real de atualização; assinatura inválida recusada; banco preservado e migrado com segurança |
| P1 — 0.7.0 | 1) Schema de materiais; 2) importação TXT/Markdown com limites/hash; 3) vínculo a conteúdo; 4) preview e manifesto de contexto | library, filesystem/AppPaths, migrations, repositories, UI de conteúdo/biblioteca | Importar e reabrir sem perda, localizar a fonte de cada trecho, rejeitar escape de caminho e arquivos inválidos |
| P1 — 0.8.0 | 1) Prova de contrato da versão OpenCode escolhida; 2) detecção/caminho; 3) conexão/pairing oficial; 4) lifecycle e política controlados; 5) diagnóstico UI | integrations/opencode, command, lib.rs, Cargo/locks, configurações e capability mínima | Conexão sem leitura de credenciais privadas; versão e política verificadas; inexistência/auth/porta dão erros úteis; não encerrar serviço alheio |
| P1 — 0.9.0 | 1) Persistência task/run/event/result; 2) contexto autorizado; 3) tarefa de resumo/análise; 4) eventos/cancelamento/reconciliação; 5) resultado validado e histórico | tasks/workflow/policy/context/result_validation, repositories/migrations, features/tasks, adaptador OpenCode | Um material vira análise rastreável; interrupção não duplica execução; tentativa de shell/escrita é bloqueada; nenhuma alteração nos originais |
| P2 — 0.10.0 | 1) Persistir respostas/tentativas/rubricas; 2) trilha em rascunho com pré-requisitos; 3) aceitar etapas explicitamente; 4) adaptar propostas usando evidências e histórico | Estudos/SRS, novas tabelas de learning_attempt/path/step e UI; contratos de tarefa | Explicar por que uma etapa foi sugerida; preservar respostas e versões; permitir revisão humana; nenhuma alteração retroativa silenciosa do histórico |
| P2 — 0.11.0 ou posteriores | PDF textual e depois DOCX/OCR em entregas próprias; ou exercícios práticos em projetos isolados com diff/testes/aprovações; cada capacidade ganha sua MINOR | Extratores/biblioteca ou tasks/policy/projetos conforme a entrega | Homologação específica de formato ou de execução. Não agrupar extras sem necessidade e não habilitar escrita antes dos testes de contenção |

Correções posteriores em cada linha usam `0.5.1`, `0.6.1` etc. Recursos adicionais não devem ser disfarçados como PATCH. O número final é revisado pelo escopo efetivamente concluído, não por uma promessa deste documento. A versão 1.0 só deve ser considerada após fluxo pessoal, migrations, recuperação, atualização e integração homologados e previsíveis.

A próxima implementação recomendada é **0.4.0: proteção e recuperação dos dados locais**, com mudanças pequenas e resultados verificáveis antes de remover login ou executar agentes.
