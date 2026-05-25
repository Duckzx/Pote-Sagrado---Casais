# 🎬 Guia de Produção — Comercial Pote Sagrado

## Visão Geral

**Projeto**: Comercial animado em Remotion  
**Formato**: 1080×1920 · 9:16 · 30fps · ~46 segundos  
**Destino**: Instagram Reels, TikTok, YouTube Shorts

---

## 1. Setup Inicial

```bash
# Instalar dependências (uma única vez)
npm install

# Abrir o Remotion Studio para preview interativo
npm run remotion:studio
```

O Studio abre em `http://localhost:3000` com preview frame-a-frame do comercial.

---

## 2. Estrutura das Cenas

| Cena | Frames | Tempo | Conteúdo |
|------|--------|-------|----------|
| 01 Abertura   | 0–120    | 0s–4s  | Logo + partículas douradas + tagline |
| 02 Login      | 120–240  | 4s–8s  | Tela de login + cursor clicando |
| 03 Pote       | 240–450  | 8s–15s | Home + depósito R$150 + confete |
| 04 Missões    | 450–630  | 15s–21s | Tab missões + destaque dourado |
| 05 LoveCards  | 630–900  | 21s–30s | Cartas do amor + digitação + envio |
| 06 Share      | 900–1080 | 30s–36s | Widget compartilhável em destaque |
| 07 Montagem   | 1080–1260 | 36s–42s | Mini cards + "Metas. Momentos. Vocês." |
| 08 Encerramento | 1260–1380 | 42s–46s | Logo final + CTA dourado |

---

## 3. Narração (Português Brasileiro)

**Perfil de voz**: Jovem adulta, acolhedora, neutra, sorridente sem exagero.

```
Todo casal tem aquele plano que vive saindo na conversa...

Uma viagem, uma conquista, um momento só de vocês.

No Pote Sagrado, cada pequena economia deixa o sonho mais perto.

E economizar deixa de ser chato quando vira um desafio a dois.

Porque não é só sobre guardar dinheiro.

É sobre lembrar por que vocês começaram.

E quando o progresso aparece, dá até vontade de mostrar para o mundo.

Pote Sagrado.

Metas, momentos e conquistas para viver juntos.

Comece o pote de vocês.
```

**Como gravar/integrar**:

### Opção A — Eleven Labs / Play.ht (recomendado)
1. Cole o texto em [elevenlabs.io](https://elevenlabs.io)
2. Escolha voz: **Valentina** ou **Maria** (PT-BR)
3. Velocidade: 0.95x | Stability: 65% | Clarity: 80%
4. Exporte como MP3 44.1kHz stereo
5. Salve em `src/remotion/assets/audio/narration.mp3`

### Opção B — Gravação humana
1. Grave em ambiente silencioso (pop filter + microfone)
2. Normalize a -12 LUFS integrated
3. Aplique Noise Reduction leve
4. Salve em `src/remotion/assets/audio/narration.mp3`

### Adicionar ao comercial
Em `PoteSagradoCommercial.tsx`, descomente a linha:

```tsx
// <Audio src={staticFile("audio/narration.mp3")} />
```

E importe `staticFile` do remotion:
```tsx
import { staticFile } from 'remotion';
```

---

## 4. Trilha Musical

**Estilo**: Piano suave + pads cinematográficos + beat moderno discreto  
**Duração**: ~50 segundos (loop suave no final)

**Fontes gratuitas de trilha**:
- [Pixabay Music](https://pixabay.com/music/) — buscar: "romantic piano", "cinematic warmth"
- [Mixkit](https://mixkit.co/free-stock-music/) — buscar: "love story", "warm piano"
- [Freepd](https://freepd.com/) — buscar: "gentle", "romantic"

**Configuração de áudio** (em `PoteSagradoCommercial.tsx`):
```tsx
import { Audio, staticFile } from 'remotion';

// Dentro do componente:
<Audio 
  src={staticFile("audio/trilha.mp3")} 
  volume={(f) => interpolate(f, [0, 30, TOTAL_FRAMES - 30, TOTAL_FRAMES], [0, 0.7, 0.7, 0])}
/>
<Audio 
  src={staticFile("audio/narration.mp3")} 
  volume={1}
/>
```

---

## 5. Render Final

```bash
# Render completo (1080×1920 - para Reels/TikTok)
npm run remotion:render

# Render de preview menor (para revisão rápida)
npm run remotion:render:preview
```

O arquivo final será gerado em `out/pote-sagrado-comercial.mp4`.

**Configurações do render**:
- Codec: H.264
- CRF: 18 (alta qualidade)
- Pixel Format: yuv420p (compatível com todas as plataformas)
- JPEG Quality: 95%

---

## 6. Dados do Demo (casal fictício)

| Campo | Valor |
|-------|-------|
| Casal | Lia & Rafa |
| Meta | Fim de semana em Maragogi |
| Valor da Meta | R$ 2.500,00 |
| Guardado | R$ 600,00 |
| Progresso | 24% |
| Dias Juntos | 428 |
| Carta | "Qual momento simples nosso você gostaria de viver de novo?" |
| Resposta | "Aquela noite com pizza, filme ruim e a gente rindo de tudo." |
| Missão | "Troquem um delivery por um date em casa" |

Para alterar, edite `src/remotion/data/timing.ts` → objeto `DEMO`.

---

## 7. Substituição de Capturas Futuras

Quando houver capturas reais do app disponíveis:

1. Salve as imagens/vídeos em `src/remotion/assets/captures/`
2. Em cada cena, substitua o componente `AppXxxScreen` por um `<Img>` ou `<Video>` do remotion:

```tsx
import { Img, Video, staticFile } from 'remotion';

// Imagem de captura real
<Img src={staticFile("captures/home-screen.png")} style={{ width: '100%' }} />

// Vídeo de captura real
<Video src={staticFile("captures/deposit-flow.mp4")} />
```

3. Mantenha o `PhoneFrame` ao redor para o efeito de smartphone.

---

## 8. Verificação Pré-entrega

- [ ] App real foi base de referência visual
- [ ] Dados de Lia & Rafa não contêm informações pessoais reais
- [ ] Nenhuma compra Premium aparece como concluída
- [ ] Nenhum texto afirma que é banco
- [ ] Legendas sincronizadas e legíveis
- [ ] Duração entre 42–50 segundos
- [ ] Render em 1080×1920
- [ ] Áudio mixado corretamente (voz no primeiro plano)

---

## 9. Estrutura de Arquivos

```
src/remotion/
├── index.tsx                    # Entry point do Remotion
├── Root.tsx                     # Composições registradas
├── PoteSagradoCommercial.tsx    # Composição principal
├── GUIA-PRODUCAO.md             # Este arquivo
├── data/
│   ├── timing.ts                # FPS, frames, cores, dados demo
│   └── subtitles.ts             # Legendas sincronizadas por frame
├── components/
│   ├── AppScreens.tsx           # Telas fiéis do app (Login, Home, etc.)
│   ├── PhoneFrame.tsx           # Moldura de smartphone
│   ├── CursorClick.tsx          # Cursor animado + TypingText
│   ├── SubtitleTrack.tsx        # Faixa de legendas global
│   └── GoldenParticles.tsx      # Partículas douradas
├── scenes/
│   ├── OpeningScene.tsx         # Cena 01 — Abertura (0–4s)
│   ├── LoginScene.tsx           # Cena 02 — Login (4–8s)
│   ├── PotScene.tsx             # Cena 03 — Pote + Depósito (8–15s)
│   ├── MissionsScene.tsx        # Cena 04 — Missões (15–21s)
│   ├── LoveCardsScene.tsx       # Cena 05 — LoveCards (21–30s)
│   ├── ShareScene.tsx           # Cena 06 — Compartilhamento (30–36s)
│   ├── MontageScene.tsx         # Cena 07 — Montagem de marca (36–42s)
│   └── ClosingScene.tsx         # Cena 08 — Encerramento (42–46s)
└── assets/
    ├── audio/                   # narration.mp3 + trilha.mp3
    ├── captures/                # Screenshots/vídeos reais do app
    ├── logos/                   # Logo assets
    └── fonts/                   # Fontes locais (backup)
```
