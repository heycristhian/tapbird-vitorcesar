<!--
Sync Impact Report
- Version change: (template, unversioned) → 1.0.0
- Modified principles: n/a (initial adoption; all placeholders replaced)
  - [PRINCIPLE_1_NAME] → I. Escopo de MVP
  - [PRINCIPLE_2_NAME] → II. Simplicidade e Clareza para Estudo
  - [PRINCIPLE_3_NAME] → III. Identidade Original
  - [PRINCIPLE_4_NAME] → IV. Loop de Jogo Determinístico e Testável
  - [PRINCIPLE_5_NAME] → V. Jogável a Cada Incremento
- Added sections: Restrições Técnicas; Fluxo de Desenvolvimento; Governança
- Removed sections: none
- Templates: not modified (read at runtime by dependent commands)
- Follow-up TODOs: none
-->

# TapBird Constitution

## Core Principles

### I. Escopo de MVP

O TapBird é um jogo de "toque para voar" (gênero de obstáculos com rolagem lateral), feito
somente para estudo. O escopo do MVP é fechado e DEVE conter apenas:

- Um personagem controlado por um único input (toque, clique ou tecla) que aplica impulso
  vertical contra a gravidade.
- Obstáculos gerados continuamente, com uma passagem por onde o personagem deve passar.
- Detecção de colisão com obstáculos, chão e teto, encerrando a partida.
- Pontuação incrementada a cada obstáculo superado, exibida na tela.
- Estados de tela: início, jogando e fim de jogo (com reinício).

Qualquer funcionalidade fora dessa lista (ranking online, contas, lojas, múltiplos
personagens, fases, monetização) NÃO DEVE entrar no MVP e só pode ser adicionada por emenda
ou como feature posterior explicitamente especificada.

**Justificativa**: o objetivo é aprender os fundamentos de um game loop, não construir um
produto. Escopo fechado evita que o estudo se perca em funcionalidades secundárias.

### II. Simplicidade e Clareza para Estudo

- O código DEVE priorizar legibilidade sobre performance ou abstração.
- Dependências externas DEVEM ser mínimas; cada dependência adicionada DEVE ter justificativa
  registrada no plano da feature.
- Constantes de jogo (gravidade, impulso, velocidade, espaçamento de obstáculos) DEVEM ficar
  centralizadas e nomeadas, para facilitar experimentação.
- Padrões de arquitetura complexos (ECS, injeção de dependência, camadas excessivas) NÃO DEVEM
  ser usados sem necessidade comprovada (YAGNI).

**Justificativa**: código simples e comentado onde não é óbvio é a melhor ferramenta de estudo.

### III. Identidade Original

- O cenário, o personagem e os obstáculos são livres e DEVEM ser originais: o jogo NÃO DEVE
  reutilizar nome, personagens, sprites, sons, músicas ou visual de jogos existentes.
- Arte DEVE ser própria, gerada por código (formas geométricas, cores) ou de fontes com
  licença livre devidamente creditada.

**Justificativa**: o projeto adota uma mecânica de gênero conhecida, mas com identidade própria,
evitando problemas de direitos autorais.

### IV. Loop de Jogo Determinístico e Testável

- A lógica de jogo (física, colisão, pontuação, geração de obstáculos) DEVE ser separada da
  renderização e do tratamento de input.
- A atualização de física DEVE usar delta time (ou passo fixo) para comportar-se igual em
  diferentes taxas de quadros.
- A geração aleatória DEVE aceitar semente (seed) injetável para permitir reprodução.
- Regras de colisão e pontuação DEVEM ter testes automatizados simples; testes de renderização
  são opcionais.

**Justificativa**: separar lógica de apresentação é a principal lição de arquitetura de jogos e
torna o comportamento verificável.

### V. Jogável a Cada Incremento

- Cada incremento de trabalho DEVE terminar com o jogo executável localmente.
- A ordem de implementação DEVE seguir o valor jogável: personagem + gravidade → input →
  obstáculos → colisão → pontuação → telas de início/fim → polimento visual.
- Polimento (animações, sons, partículas) só DEVE ser feito após o loop principal estar completo.

**Justificativa**: ver o jogo funcionando a cada passo mantém o aprendizado concreto e evita
grandes trechos de código não validados.

## Restrições Técnicas

- O jogo DEVE rodar localmente sem servidor de backend nem banco de dados; persistência, se
  existir, limita-se ao recorde local (ex.: armazenamento do navegador ou arquivo local).
- A escolha de linguagem/engine é feita no plano da feature (`/speckit-plan`), preferindo
  opções leves que rodem com um único comando (ex.: HTML5 Canvas + JavaScript/TypeScript).
- O jogo DEVE manter uma taxa de quadros fluida (meta: 60 FPS) em um computador comum.
- Controles DEVEM funcionar com teclado (espaço) e mouse/toque.

## Fluxo de Desenvolvimento

- O trabalho segue o fluxo Spec Kit: `/speckit-specify` → `/speckit-clarify` (opcional) →
  `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`.
- Cada plano DEVE conter uma verificação de conformidade com esta constituição (Constitution
  Check), justificando qualquer desvio.
- Antes de concluir uma feature, os testes de lógica DEVEM passar e o jogo DEVE ser testado
  manualmente por ao menos uma partida completa (início → colisão → reinício).

## Governance

- Esta constituição prevalece sobre outras práticas do projeto em caso de conflito.
- Emendas DEVEM ser feitas via `/speckit-constitution`, com Sync Impact Report descrevendo a
  mudança.
- Versionamento semântico:
  - MAJOR: remoção ou redefinição incompatível de princípios.
  - MINOR: novo princípio/seção ou expansão material de orientação.
  - PATCH: esclarecimentos, redação e correções sem mudança de sentido.
- Toda spec, plano e lista de tarefas DEVE ser revisada quanto à conformidade com os princípios;
  complexidade adicional DEVE ser justificada por escrito no plano.

**Version**: 1.0.0 | **Ratified**: 2026-11-10 | **Last Amended**: 2026-11-10
