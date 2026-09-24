import React from "react";

const PHRASES: { text: string; author?: string }[] = [
  { text: "Cada real guardado é um capítulo que vocês ainda vão viver juntos." },
  { text: "O amor mora nos detalhes. E os sonhos, no pote." },
  { text: "Não é sobre ter tudo. É sobre construir tudo a dois." },
  { text: "Pequenas economias, grandes memórias." },
  { text: "Sonho dividido é sonho que chega mais rápido." },
  { text: "Hoje é um ótimo dia para dizer obrigado por coisas pequenas." },
  { text: "Quem planeja junto, comemora em dobro." },
  { text: "Um café em casa hoje, uma viagem inesquecível amanhã." },
  { text: "O melhor investimento continua sendo tempo de qualidade." },
  { text: "Vocês não estão juntando dinheiro. Estão juntando histórias." },
  { text: "Amar também é cuidar do futuro de quem está ao seu lado." },
  { text: "Celebre o progresso, não só a linha de chegada." },
  { text: "Um bilhete, um abraço, um depósito: todo gesto conta." },
  { text: "Parceria é quando o nosso vale mais que o meu." },
];

function dayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86400000);
}

/** Editorial quote that changes every day (same for both partners). */
export const DailyAffirmation: React.FC = () => {
  const phrase = PHRASES[dayOfYear(new Date()) % PHRASES.length];
  return (
    <figure className="text-center px-6 py-2">
      <span className="block font-serif text-3xl leading-none text-cookbook-gold/70 select-none">“</span>
      <blockquote className="font-serif italic text-lg text-cookbook-text/80 leading-snug -mt-2">
        {phrase.text}
      </blockquote>
      <figcaption className="font-sans text-[9px] uppercase tracking-[0.25em] text-cookbook-text/35 font-bold mt-2">
        Frase do dia
      </figcaption>
    </figure>
  );
};
