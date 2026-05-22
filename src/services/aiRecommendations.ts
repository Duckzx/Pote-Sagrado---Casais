export async function getDestinationRecommendation(answers: string[]) {
  try {
    const prompt = `Como um consultor de viagens de luxo para casais, o casal respondeu às seguintes preferências sobre o estilo de viagem deles:
${answers.join(', ')}.

Por favor, baseando-se nestas preferências, sugira EXATAMENTE UM destino incrível para a viagem deles. Retorne a resposta APENAS em JSON estruturado com os três campos:
1. "dest": O nome do destino e país (ex: "Kyoto, Japão").
2. "reason": Uma frase de duas a três linhas explicando vividamente e de forma super romântica o motivo ideal para irem para lá e porque baseou-se nos gostos deles.
3. "imageKeyword": Uma única palavra-chave em inglês para buscar uma foto desse destino no Unsplash.

Retorne SOMENTE o JSON puro.`;

    const { auth } = await import('../firebase');
    const token = await auth.currentUser?.getIdToken();

    const response = await fetch('/api/gemini', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ prompt })
    });
    const dataGen = await response.json();
    
    if (dataGen.error) {
      throw new Error(dataGen.error);
    }
    
    const textRaw = dataGen.candidates?.[0]?.content?.parts?.[0]?.text;
    const text = textRaw ? textRaw.replace(/^```json/, '').replace(/```$/, '').trim() : "{}";
    
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
