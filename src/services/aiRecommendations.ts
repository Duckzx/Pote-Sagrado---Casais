import { GoogleGenAI } from '@google/genai';

export async function getDestinationRecommendation(answers: string[]) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing.");
      return null;
    }
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Como um consultor de viagens de luxo para casais, o casal respondeu às seguintes preferências sobre o estilo de viagem deles:
${answers.join(', ')}.

Por favor, baseando-se nestas preferências, sugira EXATAMENTE UM destino incrível para a viagem deles. Retorne a resposta APENAS em JSON estruturado com os três campos:
1. "dest": O nome do destino e país (ex: "Kyoto, Japão").
2. "reason": Uma frase de duas a três linhas explicando vividamente e de forma super romântica o motivo ideal para irem para lá e porque baseou-se nos gostos deles.
3. "imageKeyword": Uma única palavra-chave em inglês para buscar uma foto desse destino no Unsplash.

Retorne SOMENTE o JSON puro (sem marcação block tick, sem \`\`\`json).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    return {
      dest: data.dest || "Destino Mistério",
      reason: data.reason || "Não foi possível gerar um motivo, mas confiem no oráculo!",
      tags: [...answers],
      image: `https://loremflickr.com/400/300/${encodeURIComponent(data.imageKeyword || 'travel')}/all?random=1`
    };
  } catch (error) {
    console.error("Gemini AI error:", error);
    return null;
  }
}
