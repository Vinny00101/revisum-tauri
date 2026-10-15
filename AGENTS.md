# Orientações do projeto

## Planejamento e escopo

- Consultar `docs/planejamento/README.md` e `docs/planejamento/revisum-diagnostico-e-roadmap.md` antes de iniciar uma fase da evolução do Revisum.
- Para produto e UI, consultar também `docs/planejamento/visao-workspace-e-aprendizagem.md`: a direção é um workspace de materiais relacionados, provas, revisões e tarefas. Métricas e pontuação são determinísticas; a IA interpreta evidências e propõe estudos. Curadoria e preferências devem persistir localmente, com escopo explícito e sem dependência do agente.
- Distinguir funcionalidades existentes de propostas e respeitar o escopo autorizado para a fase atual.
- Priorizar preservação dos dados locais, migrations compatíveis e backup/restauração antes de remover login ou habilitar agentes.
- Não editar as migrations históricas 01–03 nem normalizar suas quebras de linha sem o tratamento de compatibilidade descrito no diagnóstico.

## Branches e entregas

- Sincronizar `dev` com `main` antes de iniciar uma versão, preservando o histórico e sem force-push.
- Trabalhar em uma branch `<descricao>/<versão>` criada a partir da `dev` atualizada, com uma descrição curta em minúsculas e palavras separadas por hífen, por exemplo `protecao-dados/0.4.0`. Criar cada branch no início da respectiva versão, não antecipadamente para todo o roadmap.
- Integrar a versão concluída e validada em `dev`; após validação integrada, promover `dev` para `main`.
- Não implementar versões diretamente em `main` nem promover trabalho incompleto como release.
- A linha em implementação é 0.4.0; a primeira prévia é 0.4.0-alpha.1. Consultar `docs/versoes/0.4.0.md` para escopo e validações. Cada entrega publicada recebe novo número conforme seu escopo; sincronizar manifests, lockfiles, configuração Tauri e tag.
- Arquivos locais de IDE em `.vs/` e `.vscode/` devem permanecer fora do controle de versão.
- Executar a CI automaticamente apenas em pushes para `dev`/`main` e PRs com destino à `dev`; branches de trabalho podem ser validadas manualmente. Cancelar validações anteriores da mesma branch ou PR quando uma nova execução começar. Publicação de instaladores permanece limitada a tags `v*` ou execução manual.
