# Pote Sagrado - Design & Identidade Visual

Este documento detalha todas as características visuais, tonais e estruturais que compõem o design do "Pote Sagrado", garantindo a consistência na manutenção e na adição de novos recursos.

## 1. Tipografia e Fontes

O projeto adota uma hierarquia tipográfica focada na elegância e clareza, utilizando pares de Serif/Sans-serif:
- **Fontes Serifadas (`font-serif`)**: Utilizadas para títulos (`h1`, `h2`, `h3`, `h4`, `h5`, `h6`) e elementos de destaque (como os nomes das Medalhas). Conferem um aspecto elegante e editorial (Cookbook).
  - Stack: `"Georgia", "Times New Roman", serif`
- **Fontes Sans-Serif (`font-sans`)**: Utilizadas para textos corridos, botões, legendas e rótulos (`body`, botões, descrições).
  - Stack: `"Helvetica Neue", Arial, sans-serif`
- **Estilos Comuns**: Letras maiúsculas com espaçamento expandido (`uppercase tracking-widest`, `text-[10px]`) são amplamente utilizadas para microcopys e botões, remetendo a um layout de revistas culinárias ou diários sofisticados.

## 2. Temas e Paleta de Cores (Tonalidades)

A aplicação conta com um sistema de temas dinâmico, baseado em atributos HTML (`data-theme`), que altera variáveis globais de CSS inseridas em `src/index.css`.

### 2.1 Tema "Cookbook" (Padrão)
Um tema em tons terrosos e orgânicos, lembrando papel pólen, cadernos clássicos e café.
- **Background (`--theme-bg`)**: `#FDFBF7` (Bege bem claro/Papel)
- **Texto (`--theme-text`)**: `#2C2A26` (Preto atenuado/Carvão)
- **Bordas (`--theme-border`)**: `#E8E4D9`
- **Primária (`--theme-primary`)**: `#8E7F6D` (Marrom acinzentado) / **Hover**: `#7A6C5C`
- **Accent/Gold (`--theme-gold`)**: `#C5A059` (Dourado metálico/Mostarda)
- **Cards/Battle (`--theme-battle`)**: `#F4F1EA`
- **Mural (`--theme-mural`)**: `#FFF9E6`

### 2.2 Tema "Mediterranean"
Remete ao entardecer no mediterrâneo, terracota e areia.
- **Background**: `#FFF5EE`
- **Texto**: `#4A2E2B`
- **Bordas**: `#F4D5CB`
- **Primária**: `#E07A5F` (Coral/Terracota) / **Hover**: `#D06A4F`
- **Accent**: `#F2CC8F` (Pôr do sol)

### 2.3 Tema "Nordic"
Frio, elegante, tons pálidos de azul e gelo.
- **Background**: `#F0F4F8`
- **Texto**: `#1A2B3C`
- **Bordas**: `#D9E2EC`
- **Primária**: `#5C7C8A` (Azul acinzentado) / **Hover**: `#4A6A78`
- **Accent**: `#829AB1`

### 2.4 Tema "Tropical"
Tons de folhagens e ilhas paradisíacas.
- **Background**: `#F2FAF5`
- **Texto**: `#1E392A`
- **Bordas**: `#CDEBDB`
- **Primária**: `#2A9D8F` (Esmeralda/Menta profundo) / **Hover**: `#21867A`
- **Accent**: `#E9C46A` (Areia de praia)

### 2.5 Tema "Midnight" (Dark Mode)
Escuro, neon suave e elegância noturna.
- **Background**: `#1A1A2E`
- **Texto**: `#E8E4D9`
- **Bordas**: `#2D2D44`
- **Primária**: `#C5A059` (Dourado sobre fundo escuro) / **Hover**: `#D4AF6A`
- **Componentes Nativos (inputs/textareas)**: Fundo `#232340`, modo `color-scheme: dark`.

## 3. Formas, Estruturas e Efeitos Especiais (Shapes & Forms)

- **Bordas e Cantos**: Amplo uso de `rounded-xl`, `rounded-2xl` e `rounded-3xl` em painéis (Cards) flutuantes e modais.
- **Glassmorphism / Frosted Glass**: 
  - Fundo translúcido com `backdrop-blur-md` e branco semitransparente (`bg-white/60`, `bg-white/80`).
  - Navegação inferior (BottomNav) fluida e translúcida utilizando classes de filtro backdrop do Tailwind.
- **Sombra e Elevação**: Sombras suaves (`shadow-sm` para listas, `shadow-xl` ou `shadow-2xl` para Modais e painéis de Widget). Modais freqüentemente trazem radial-gradients no fundo escurecido.
- **Texturas**: 
  - `.bg-dotted` (Padrão de pontilhismo em SVG usado no background).
  - Background "Ondas Coloridas" (usando o componente de shader `<ColorBends>`)
  - `<GlassSurface>` para efeitos acetinados.

## 4. Animações e Transições

As animações são tratadas via CSS Keyframes puros (`src/index.css`) e combinadas com framer-motion/tailwind em alguns lugares:
- **Transições de Tema**: `transition-colors duration-500` englobando todo o body.
- **Esgotamento / Preenchimento de UI ("SacredPot")**: A imagem de percentual no Home usa `<clipPath>` num SVG para "encher" a garrafa com um líquido (`fillHeightValue`), animando de acordo com as economias de forma orgânica.
- **Confete (canvas-confetti)**: Disparo programado de confetes originando de múltiplos ângulos para desbloqueio de conquistas.
- **Partículas Flutuantes (`float-particle`)**: Símbolos e letras animam flutuando para o topo e rotacionando ao entrar numa tela de comemoração.
- **Animações de Medalhas (UserBadges)**:
  - `animate-badge-glow` (pulso sombreado colorido).
  - `animate-badge-shimmer` e `animate-badge-shimmer-delayed` (anéis de crescimento e fading no modal de conquistas).
  - `animate-badge-icon-spin` (ícones rodando em 3D).
  - Modificadores escalonados (`reveal-delay-1`, `reveal-delay-2`) para entrada de textos no popup.

## 5. Emotes, Emojis e Ícones

A iconografia utiliza, por padrão, a biblioteca **Lucide React**. No entanto, quando se tratam de emojis (emotes visuais espalhados na aplicação), estabeleceu-se um padrão claro:

- **Quotes do Dia (Home Tab)**:
  - ✈️ (Quem economiza hoje, viaja amanhã.)
  - 👣 (Cada centavo é um passo...)
  - 🌍 (Pequenas escolhas, grandes viagens.)
  - 🏝️ (O paraíso está a um depósito...)
  - 💑 (Juntos, até o impossível fica perto.)
  - 🎫 (O pote de hoje é a passagem...)
  - ⛽ (Disciplina é o combustível das aventuras.)
  - 💛 (Economizar a dois é dobrar a felicidade.)
  - 📸 (Sua próxima memória inesquecível começa agora.)
  - 🌅 (Não é sobre gastar menos, é sobre viver mais.)

- **Filtros (Missões / MissoesTab)**:
  - 🎯 (Todas)
  - 💚 (Economia)
  - ⚔️ (Desafios - "Battle")
  - ⭐ (Minhas missões customizadas)

- **Partículas Aleatórias de Celebração (Modais de Conquista)**:
  - ✨, 🌟, ⭐, 💫, 🎉, 🎊

- **Medalhas e Conquistas (Ícones associados e cores em Lucide)**:
  - **Primeiro Passo**: Ícone `<Target />` (Cor: Primária - Marrom/Theme).
  - **Mestre Cuca**: Ícone `<Coffee />` (Cor: Orange-500 | iFood, Jantares).
  - **Foco Total**: Ícone `<Award />` (Cor: Dourado - 50% de meta).
  - **Combo 3 Dias**: Ícone `<Flame />` (Cor: Red-500).
  - **Combo 7 Dias**: Ícone `<Zap />` (Cor: Purple-500).
  - **Sem Delivery**: Ícone `<Star />` (Cor: Emerald-500).
  - **Centenário**: Ícone `<Trophy />` (Cor: Amber-500).
  - **Meta Batida**: Ícone `<Award />` (Cor: Yellow-500 - 100% de meta).

## 6. Fluxos e Páginas (Tabs)

Toda a arquitetura é visualmente contida num esquema **Mobile-First / PWA**, rodando em uma "App View" encapsulada num `max-w-md mx-auto`. As "páginas" funcionam como Guias (Tabs) via `AppContext`:

1. **HomeTab**: Dashboard principal. Contém o `ShareableWidget` (O Pote Sagrado que vai exchendo e é exportável para o Instagram usando `html2canvas`), "Extrato Rápido" e "Frase do dia" giratória. Aparece o Badge System com rolagem horizontal (Snap).
2. **MissoesTab**: Gamificação. Botões estilizados com categorias (Ifood, Uber, Compras) baseadas nos Emojis que alimentam saldos negativos / economia que alimentam saldos positivos.
3. **ExtratoTab**: Ledger completo de Income / Expenses.
4. **DisputaTab**: (Opcional/Habilitável) Painéis de batalhas 1x1, Bingo de Casal. Exibidos em cards da cor "Theme.battle".
5. **MuralTab**: Um painel estilo "Pinboard" para "Polaroids", post-its, checklists, com "fita crepe" no topo das imagens usando texturas rotacionadas (`rotate-3`, `-rotate-2`).
6. **ConfigTab**: Ajustes e Temas. Local para definir meta, nomes, e alterar globalmente as cores mencionadas na Seção 2 e forçar backup de dados via Firebase.
