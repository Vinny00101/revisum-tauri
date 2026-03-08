# Visão Geral

O Revisum é uma aplicação desktop de alto desempenho focada em gestão de estudos e revisão espaçada. Desenvolvido para auxiliar estudantes a organizar disciplinas, criar bancos de questões e manter a constância nos estudos através de métricas detalhadas e algoritmos de revisão.

A aplicação combina a leveza de uma interface web moderna com a robustez de um backend nativo, garantindo funcionamento offline e persistência de dados segura.

# Funcionalidades Principais

## Sistema de Estudo

- Flashcards e Questões: Suporte para criação de Cards (Frente/Verso) e Questões (Objetivas e Discursivas).

- Revisão Espaçada (SRS): Algoritmo inteligente que calcula o próximo agendamento de revisão com base na dificuldade relatada pelo usuário (Easy, Medium, Hard, Wrong). (AVISO: ainda não foi finalizado a lógica do SRS)

- Sessões de Estudo: Modos dedicados para revisão de Cards ou resolução de Questões com cronômetro integrado.

## Gestão de Conteúdo

- Organização Hierárquica: Disciplinas -> Conteúdos -> Itens de Estudo.

## Métricas e Gamificação

- Streaks (Ofensiva): Acompanhamento de dias consecutivos de estudo

- Análise de Desempenho: Cálculo automático de porcentagem de domínio por disciplina.

- Tempo de Estudo: Registro automático do tempo total dedicado aos estudos via triggers de banco de dados.


# Arquitetura Técnica

## Stack Tecnológico
- Core/Backend: Tauri (Rust) - Para gerenciamento de janelas, sistema de arquivos e performance nativa.

- Frontend: React.js - Interface de usuário reativa e baseada em componentes.

- Estilização: Tailwind CSS - Design moderno e responsivo.
Animações: Framer Motion - Transições fluidas de interface.

- Banco de Dados: SQLite - Persistência local, rápida e sem necessidade de servidor externo.

## Estrutura de Dados (Database)

O sistema utiliza um banco relacional robusto com integridade referencial e automação via Triggers:

### Entidades Principais:

- user: Gerenciamento de perfil e autenticação local.

- discipline & content: Estrutura organizacional das matérias.

- studyitem: Polimorfismo para armazenar tanto CARD quanto QUESTION.

### Sistema de Revisão:

- study_item_review_state: Armazena o fator de facilidade (ease factor) e datas de revisão.
- review_session & reviewlog: Histórico detalhado de cada interação do usuário com o conteúdo.

### Automação (Triggers SQL):

- Cálculo automático do tempo total de estudo ao finalizar uma sessão.

# Instalação e Execução

## Pré-requisitos
- Node.js (v18+)
- Rust & Cargo (para compilação do Tauri)
- Gerenciador de pacotes (npm, yarn ou pnpm)

# licença

Este projeto é um software livre: você pode redistribuí-lo e/ou modificá-lo sob os termos da GNU General Public License conforme publicada pela Free Software Foundation, seja a versão 3 da Licença, ou (a seu critério) qualquer versão posterior.

O Revisum é distribuído na esperança de que seja útil, mas SEM QUALQUER GARANTIA; sem mesmo a garantia implícita de COMERCIALIZAÇÃO ou ADEQUAÇÃO A UM PROPÓSITO PARTICULAR.

Consulte o arquivo **LICENSE** para mais detalhes.


