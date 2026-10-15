# Planejamento do Revisum

Esta pasta guarda temporariamente o diagnóstico e o planejamento da evolução do projeto. O documento principal é [Diagnóstico técnico e roadmap](revisum-diagnostico-e-roadmap.md), elaborado em 15/10/2026 sobre a base v0.3.0.

A direção de produto foi ampliada em [Workspace e aprendizagem assistida](visao-workspace-e-aprendizagem.md): redesign completo da experiência, arquivos relacionados, provas de concurso, análise de desempenho, planos por próximas revisões, pesquisa de sites/vídeos e curadoria persistente. Esse complemento detalha os requisitos e orienta o roadmap atualizado a partir da 0.7.0. As prioridades de proteção dos dados e retirada do login permanecem.

O diagnóstico registra o estado observado naquela análise. Suas referências a arquivos fora do repositório e à ausência de mudanças descrevem a etapa original; a inclusão desta pasta e a limpeza dos arquivos de editor são preparativos posteriores. Os nomes de módulos novos e as versões do roadmap são propostas, não funcionalidades já implementadas.

## Fluxo de branches

1. Atualizar as referências de `origin` e sincronizar `dev` com `main`, preservando os commits existentes. Usar fast-forward quando possível; resolver divergências sem force-push.
2. Criar uma branch `<descricao>/<versão>` a partir da `dev` atualizada quando começar o trabalho dessa versão. Usar uma descrição curta em minúsculas e palavras separadas por hífen. A primeira é `protecao-dados/0.4.0`. Criar as branches futuras somente quando suas versões forem iniciadas, para que partam do estado atualizado.
3. Implementar, testar e revisar as alterações na branch da versão. Correções publicadas usam seu próprio número e uma descrição do escopo, por exemplo `correcoes-revisao/0.4.1`.
4. Integrar o trabalho concluído em `dev` e executar a validação integrada.
5. Promover a entrega validada de `dev` para `main`. O fluxo de implementação é `<descricao>/<versão>` → `dev` → `main`.
6. Preparar tag e publicação conforme o processo de release aplicável. Não publicar uma versão incompleta nem tratar a criação da branch como uma release.

Durante a preparação deste planejamento, `dev` foi sincronizada com a base `main`. A branch de trabalho atual é `protecao-dados/0.4.0`, renomeada para seguir a regra de descrição por versão. A primeira implementação está na prévia **0.4.0-alpha.1**; consulte [entrega e validação da 0.4.0](../versoes/0.4.0.md). O diagnóstico original continua como referência histórica, e o documento de versão distingue implementação de planejamento.

## Versionamento

- Base histórica: v0.3.0, informada como pre-release.
- Próxima linha: 0.4.0, começando pela proteção e recuperação dos dados locais.
- Cada entrega publicada deve receber uma versão nova: PATCH para correções e MINOR para novas capacidades ou mudanças incompatíveis durante 0.x.
- Usar `-alpha.N`, `-beta.N` e `-rc.N` quando necessário e marcar corretamente o status de pre-release no GitHub.
- Sincronizar `package.json`, `package-lock.json`, `src-tauri/Cargo.toml`, `src-tauri/Cargo.lock` e `src-tauri/tauri.conf.json` ao preparar uma entrega. Verificar também a tag e os metadados de publicação.
- A organização documental atual não altera a versão do aplicativo nem implementa as features planejadas.

## Prioridade da fase atual

Seguir os critérios de saída do diagnóstico: compatibilidade das migrations existentes, tratamento controlado das variantes LF/CRLF, backup/restauração, preflight e recuperação. Preservar banco, arquivos e histórico. A remoção do login e as integrações vêm depois dessas proteções.
