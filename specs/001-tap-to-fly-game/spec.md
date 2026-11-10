# Feature Specification: Jogo "Toque para Voar" (MVP TapBird)

**Feature Branch**: `001-tap-to-fly-game`

**Created**: 2026-11-10

**Status**: Draft

**Input**: User description: "jogo de toque para voar com personagem, obstáculos, pontuação e telas de início/fim; cenário original"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Voar e desviar de obstáculos (Priority: P1)

O jogador controla um pássaro original que cai continuamente pela gravidade. A cada toque,
clique ou pressionar de tecla, o pássaro recebe um impulso para cima. Pares de pilares de rocha
surgem pela direita e se movem para a esquerda, cada par com uma passagem em altura variável.
Se o pássaro encostar em um pilar, no chão ou no teto, a partida termina.

**Why this priority**: é o núcleo do jogo; sem isso não há jogo. Sozinho já entrega uma
experiência jogável e o principal objeto de estudo (gravidade, input, colisão).

**Independent Test**: iniciar o jogo, tocar repetidamente e verificar que o pássaro sobe e cai,
que obstáculos aparecem continuamente e que encostar em qualquer um deles encerra a partida.

**Acceptance Scenarios**:

1. **Given** uma partida em andamento, **When** o jogador não faz nenhuma ação, **Then** o
   pássaro cai de forma acelerada até atingir o chão e a partida termina.
2. **Given** uma partida em andamento, **When** o jogador toca/clica/pressiona espaço, **Then**
   o pássaro recebe um impulso imediato para cima, independentemente da velocidade anterior.
3. **Given** uma partida em andamento, **When** o tempo passa, **Then** novos pares de pilares
   surgem em intervalos regulares, com passagens em alturas diferentes entre si.
4. **Given** o pássaro passando pela abertura de um par de pilares, **When** ele não toca os
   pilares, **Then** a partida continua normalmente.
5. **Given** o pássaro encostando em um pilar, no chão ou no limite superior da tela, **When**
   a colisão ocorre, **Then** a partida termina imediatamente e o movimento para.

---

### User Story 2 - Pontuação (Priority: P2)

Cada par de pilares que o pássaro ultrapassa com sucesso soma 1 ponto. A pontuação atual fica
visível durante toda a partida.

**Why this priority**: dá objetivo e sensação de progresso ao jogo, mas depende do loop
principal (P1) existir.

**Independent Test**: jogar uma partida, passar por N pares de pilares e confirmar que o placar
exibido é exatamente N.

**Acceptance Scenarios**:

1. **Given** o início de uma partida, **When** a partida começa, **Then** a pontuação exibida
   é 0.
2. **Given** uma partida em andamento, **When** o pássaro ultrapassa completamente um par de
   pilares, **Then** a pontuação aumenta em exatamente 1.
3. **Given** um par de pilares já contado, **When** o pássaro continua voando, **Then** aquele
   par não é contado novamente.

---

### User Story 3 - Telas de início e de fim de jogo (Priority: P3)

Ao abrir o jogo, o jogador vê uma tela de início com o nome do jogo e a instrução de como
jogar; a partida só começa com a primeira ação. Ao colidir, aparece a tela de fim de jogo com a
pontuação da partida, o recorde e a opção de jogar novamente.

**Why this priority**: completa o ciclo de jogo (início → partida → fim → reinício), mas o jogo
já é testável sem estas telas.

**Independent Test**: abrir o jogo, confirmar a tela de início, iniciar com uma ação, colidir,
confirmar a tela de fim com pontuação e recorde, e reiniciar com uma ação.

**Acceptance Scenarios**:

1. **Given** o jogo recém-aberto, **When** a tela carrega, **Then** é exibida a tela de início
   com o título e a instrução "toque, clique ou pressione espaço para voar", e o pássaro não
   cai.
2. **Given** a tela de início, **When** o jogador realiza a primeira ação, **Then** a partida
   começa com o pássaro já recebendo o primeiro impulso.
3. **Given** uma colisão, **When** a partida termina, **Then** é exibida a tela de fim com a
   pontuação obtida e o recorde.
4. **Given** a tela de fim, **When** o jogador realiza uma ação de reinício, **Then** uma nova
   partida começa com pontuação 0 e os obstáculos anteriores removidos.
5. **Given** uma pontuação maior que o recorde anterior, **When** a partida termina, **Then** o
   recorde é atualizado e permanece salvo ao reabrir o jogo no mesmo dispositivo.

---

### Edge Cases

- Ações repetidas muito rápidas: cada ação aplica um impulso; o pássaro não pode ultrapassar o
  limite superior sem que isso conte como colisão.
- Ação imediatamente após o fim de jogo: deve haver uma breve pausa (aprox. 0,5 s) antes que o
  reinício seja aceito, para evitar reinício acidental.
- Janela do jogo perde o foco ou fica oculta: a partida é pausada e retoma com uma ação do
  jogador, sem "saltos" de posição.
- Telas de tamanhos diferentes: a área de jogo mantém a proporção e fica centralizada; a
  dificuldade não muda conforme o tamanho da tela.
- Taxas de quadros diferentes: o pássaro e os obstáculos se movem na mesma velocidade real em
  dispositivos mais lentos ou mais rápidos.
- Recorde indisponível (armazenamento local bloqueado): o jogo funciona normalmente e o recorde
  vale apenas para a sessão atual.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O jogo DEVE exibir um personagem (pássaro de design original) que sofre gravidade
  constante durante a partida.
- **FR-002**: O jogador DEVE poder aplicar um impulso vertical ao personagem com toque na tela,
  clique do mouse ou tecla espaço.
- **FR-003**: O jogo DEVE gerar continuamente pares de obstáculos que se movem da direita para a
  esquerda a velocidade constante, cada par com uma passagem de altura fixa e posição vertical
  aleatória dentro de limites jogáveis.
- **FR-004**: O jogo DEVE remover obstáculos que saíram completamente da área visível.
- **FR-005**: O jogo DEVE encerrar a partida quando o personagem colidir com um obstáculo, com o
  chão ou com o limite superior da área de jogo.
- **FR-006**: O jogo DEVE somar 1 ponto cada vez que o personagem ultrapassar um par de
  obstáculos, contando cada par apenas uma vez.
- **FR-007**: O jogo DEVE exibir a pontuação atual durante a partida.
- **FR-008**: O jogo DEVE apresentar três estados: tela de início, partida em andamento e tela
  de fim de jogo.
- **FR-009**: A tela de fim DEVE mostrar a pontuação da partida, o recorde e como reiniciar.
- **FR-010**: O jogo DEVE guardar o recorde localmente no dispositivo entre sessões.
- **FR-011**: O jogo DEVE pausar automaticamente quando a janela perder o foco ou ficar oculta.
- **FR-012**: O cenário, o personagem e os obstáculos DEVEM ser originais: céu de cânion ao
  pôr do sol com camadas de fundo em movimento lento, chão de areia em rolagem e pilares de
  rocha como obstáculos, sem reaproveitar arte, nomes ou sons de jogos existentes.
- **FR-013**: O movimento do personagem e dos obstáculos DEVE ter a mesma velocidade real
  independentemente da taxa de quadros do dispositivo.
- **FR-014**: A geração de obstáculos DEVE ser reproduzível quando uma mesma semente aleatória
  for informada (para estudo e testes).

### Key Entities

- **Personagem (Pássaro)**: posição vertical, velocidade vertical, tamanho da área de colisão.
- **Par de Obstáculos**: posição horizontal, altura do centro da passagem, tamanho da passagem,
  indicador de "já pontuado".
- **Partida**: estado atual (início, jogando, pausado, fim), pontuação, lista de obstáculos
  ativos.
- **Recorde**: maior pontuação já obtida no dispositivo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um jogador novato entende como jogar e inicia uma partida em menos de 10 segundos
  após abrir o jogo, sem explicação externa.
- **SC-002**: O personagem reage a cada ação do jogador sem atraso perceptível (menos de 100 ms).
- **SC-003**: A animação permanece fluida (meta de 60 quadros por segundo) em um computador
  comum durante uma partida de 5 minutos.
- **SC-004**: Um jogador iniciante consegue ultrapassar ao menos 1 obstáculo em até 5
  tentativas.
- **SC-005**: Reiniciar após o fim de jogo leva menos de 2 segundos e uma única ação.
- **SC-006**: Em 100% dos testes automatizados de colisão e pontuação, o resultado corresponde
  ao esperado.
- **SC-007**: O jogo abre e roda localmente com um único comando ou abrindo um único arquivo,
  sem servidor.

## Assumptions

- Cenário escolhido para o MVP (o usuário deixou livre): cânion ao pôr do sol, pássaro
  geométrico próprio e pilares de rocha; arte desenhada por código ou com licença livre.
- Dificuldade fixa no MVP (velocidade e tamanho da passagem constantes); aumento progressivo de
  dificuldade fica fora do escopo.
- Sons e música são opcionais e ficam para depois do loop principal (polimento).
- Jogador único, sem contas, rankings online, lojas ou múltiplos personagens.
- Plataforma alvo: computador com teclado/mouse e dispositivos com toque, rodando localmente.
- O recorde é salvo apenas no próprio dispositivo; não há sincronização.
