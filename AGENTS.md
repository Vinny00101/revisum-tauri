# Orientações do projeto

## Planejamento e escopo

- Consultar `docs/planejamento/README.md` e `docs/planejamento/revisum-diagnostico-e-roadmap.md` antes de iniciar uma fase da evolução do Revisum.
- Distinguir funcionalidades existentes de propostas e respeitar o escopo autorizado para a fase atual.
- Priorizar preservação dos dados locais, migrations compatíveis e backup/restauração antes de remover login ou habilitar agentes.
- Não editar as migrations históricas 01–03 nem normalizar suas quebras de linha sem o tratamento de compatibilidade descrito no diagnóstico.

## Branches e entregas

- Sincronizar `dev` com `main` antes de iniciar uma versão, preservando o histórico e sem force-push.
- Trabalhar em uma branch `codex/<versão>` criada a partir da `dev` atualizada. Criar cada branch no início da respectiva versão, não antecipadamente para todo o roadmap.
- Integrar a versão concluída e validada em `dev`; após validação integrada, promover `dev` para `main`.
- Não implementar versões diretamente em `main` nem promover trabalho incompleto como release.
- A próxima versão de implementação é 0.4.0. Cada entrega publicada recebe novo número conforme seu escopo; sincronizar manifests, lockfiles, configuração Tauri e tag.
- Arquivos locais de IDE em `.vs/` e `.vscode/` devem permanecer fora do controle de versão.
