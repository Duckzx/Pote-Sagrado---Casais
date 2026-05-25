// =====================================================
// SUBTITLES — Legendas sincronizadas por frame (30fps)
// Palavras em dourado marcadas com [GOLD]texto[/GOLD]
// =====================================================

export interface Subtitle {
  from: number;
  to: number;
  text: string; // suporta [GOLD]...[/GOLD] para highlight
}

export const SUBTITLES: Subtitle[] = [
  // Cena 01 — Abertura
  {
    from: 10,
    to: 115,
    text: 'Todo casal tem aquele plano que vive saindo na conversa...',
  },

  // Cena 02 — Login
  {
    from: 125,
    to: 200,
    text: 'Uma viagem, uma conquista,',
  },
  {
    from: 200,
    to: 235,
    text: 'um momento só de vocês.',
  },

  // Cena 03 — Pote
  {
    from: 250,
    to: 380,
    text: 'No [GOLD]Pote Sagrado[/GOLD], cada pequena [GOLD]economia[/GOLD] deixa o sonho mais perto.',
  },

  // Cena 04 — Missões
  {
    from: 460,
    to: 580,
    text: 'E economizar deixa de ser chato quando vira um [GOLD]desafio a dois[/GOLD].',
  },

  // Cena 05 — LoveCards
  {
    from: 640,
    to: 750,
    text: 'Porque não é só sobre [GOLD]guardar dinheiro[/GOLD].',
  },
  {
    from: 760,
    to: 895,
    text: 'É sobre lembrar por que vocês [GOLD]começaram[/GOLD].',
  },

  // Cena 06 — Share
  {
    from: 910,
    to: 1075,
    text: 'E quando o progresso aparece, dá até vontade de mostrar para o mundo.',
  },

  // Cena 07 — Montagem
  {
    from: 1090,
    to: 1250,
    text: '[GOLD]Pote Sagrado[/GOLD]. Metas, momentos e [GOLD]conquistas[/GOLD] para viver juntos.',
  },

  // Cena 08 — Encerramento
  {
    from: 1270,
    to: 1370,
    text: 'Comece o pote de vocês.',
  },
];

// Narration script (full text for reference)
export const NARRATION_SCRIPT = `
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
`.trim();
