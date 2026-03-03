# Registro de Alterações - Engineering Tools Pro

Todas as mudanças importantes neste projeto serão documentadas aqui.

## [2.0.0] - 03-03-2026

### Novas Funcionalidades

#### **Paint Pro - Ferramenta de Desenho Avançada**
- Adicionado sistema completo de desenho estilo Paint/Gartic
- **Ferramentas disponíveis:** lápis, pincel, marcador, caneta caligráfica e borracha
- **Formas geométricas:** linha, retângulo, círculo, triângulo, seta e estrela
- Controles de opacidade e tamanho do traço
- Estilos de linha: sólida, tracejada e pontilhada
- Opção de preenchimento para formas geométricas
- Histórico com desfazer/refazer (Ctrl+Z/Ctrl+Y)
- Atalhos de teclado: P (lápis), B (pincel), M (marcador), E (borracha), L (linha), R (retângulo), O (círculo), T (triângulo)
- Coordenadas do mouse em tempo real
- Salvamento de desenhos em formato PNG
- Suporte completo a dispositivos touch

#### **Wiki das Pontes - Guia Educativo**
- Seção educativa sobre engenharia de pontes
- **Tipos de pontes explicados:** viga, treliça (Warren, Pratt, Howe, K), arco, suspensa, estaiada, móvel
- **Forças estruturais:** compressão, tração, cisalhamento, flexão (com analogias do dia a dia)
- **Curiosidades:**
  - Ponte mais alta do mundo: Huajiang Canyon (625m)
  - Ponte mais longa: Danyang-Kunshan (164km)
  - Ponte mais antiga: Arkadiko (3300 anos)
  - Ponte assombrada: Overtoun (Escócia)
  - Ponte viva: Pontes de raízes na Índia
- Links acessíveis para Wikipedia, YouTube e Instagram
- Conteúdo visual e didático para todos os públicos

#### **Ranking de Teste de Cargas**
- Desafio interativo onde grupos competem para ver quem coloca mais peso sem a estrutura ceder
- **Limite máximo:** 10 toneladas (10.000kg)
- **Tipos de pesos:**
  - Pesos pré-definidos: 1kg, 5kg, 10kg, 20kg, 50kg, 100kg
  - Pesos especiais aleatórios: 
    - Livro Linguagens/Humanas (900g - 1kg)
    - Livro Matemática/Natureza (700g - 800g)
  - Pesos personalizados até 5 toneladas por adição
- **Sistema inteligente de agrupamento:** cargas iguais são agrupadas (ex: "2x 5kg", "5x Livros")
- Barra de progresso visual com alerta de cores (verde, amarelo, vermelho)
- Ranking automático com medalhas 
- Persistência dos dados no localStorage

### Melhorias e Correções
- Interface mais responsiva para dispositivos móveis
- Melhor contraste e legibilidade em todas as seções
- Correção de bugs na calculadora científica
- Otimização de desempenho geral

---

## [1.0.0] - 02-03-2026

### Funcionalidades Iniciais
- Calculadora científica com funções trigonométricas
- Biblioteca de fórmulas de engenharia
- Catálogo de pontes
- Executor de fórmulas
