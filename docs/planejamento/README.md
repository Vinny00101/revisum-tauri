# Planejamento do Revisum

Esta pasta guarda temporariamente o diagnóstico e o planejamento da evolução do projeto. O documento principal é [Diagnóstico técnico e roadmap](revisum-diagnostico-e-roadmap.md), elaborado em 15/10/2026 sobre a base v0.3.0.

O diagnóstico registra o estado observado naquela análise. Suas referências a arquivos fora do repositório e à ausência de mudanças descrevem a etapa original; a inclusão desta pasta e a limpeza dos arquivos de editor são preparativos posteriores. Os nomes de módulos novos e as versões do roadmap são propostas, não funcionalidades já implementadas.

## Fluxo de branches

1. Atualizar as referências de `origin` e sincronizar `dev` com `main`, preservando os commits existentes. Usar fast-forward quando possível; resolver divergências sem force-push.
2. Criar uma branch `codex/<versão>` a partir da `dev` atualizada quando começar o trabalho dessa versão. A primeira é `codex/0.4.0`. Criar as branches futuras somente quando suas versões forem iniciadas, para que partam do estado atualizado.
3. Implementar, testar e revisar as alterações na branch da versão. Correções publicadas usam seu próprio número, por exemplo `codex/0.4.1`.
4. Integrar o trabalho concluído em `dev` e executar a validação integrada.
5. Promover a entrega validada de `dev` para `main`. O fluxo de implementação é `codex/<versão>` → `dev` → `main`.
6. Preparar tag e publicação conforme o processo de release aplicável. Não publicar uma versão incompleta nem tratar a criação da branch como uma release.

Durante a preparação deste planejamento, `dev` foi sincronizada com a base `main` e a branch `codex/0.4.0` foi criada. A implementação da 0.4.0 ainda não começou. O planejamento e a limpeza de `.vs`/`.vscode` ficam na branch de trabalho para acompanhar essa fase.

## Versionamento

- Base histórica: v0.3.0, informada como pre-release.
- Próxima linha: 0.4.0, começando pela proteção e recuperação dos dados locais.
- Cada entrega publicada deve receber uma versão nova: PATCH para correções e MINOR para novas capacidades ou mudanças incompatíveis durante 0.x.
- Usar `-alpha.N`, `-beta.N` e `-rc.N` quando necessário e marcar corretamente o status de pre-release no GitHub.
- Sincronizar `package.json`, `package-lock.json`, `src-tauri/Cargo.toml`, `src-tauri/Cargo.lock` e `src-tauri/tauri.conf.json` ao preparar uma entrega. Verificar também a tag e os metadados de publicação.
- A organização documental atual não altera a versão do aplicativo nem implementa as features planejadas.

## Prioridade da próxima fase

Seguir os critérios de saída do diagnóstico: compatibilidade das migrations existentes, tratamento controlado das variantes LF/CRLF, backup/restauração, preflight e recuperação. Preservar banco, arquivos e histórico. A remoção do login e as integrações vêm depois dessas proteções.
