// src/utils/ai-service.js
// REMOVA as linhas de importação do GoogleGenerativeAI e a inicialização do genAI
// import { GoogleGenerativeAI } from "@google/generative-ai"; // REMOVA ESTA LINHA
// const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY); // REMOVA ESTA LINHA

export async function analyzeDrawing(imageBase64, targetWord = null) {
  // Sua lógica de validação de imagem continua aqui no frontend
  if (!imageBase64?.match(/^data:image\/(png|jpeg);base64,/)) {
    throw new Error("Invalid image format");
  }

  // A chave da API não é mais necessária aqui, pois a chamada vai para o backend
  // Apenas a validação da imagem e o envio para o backend
  const base64Data = imageBase64; // Envie a string base64 completa, o backend fará o split

  try {
    // Chame sua Serverless Function no Vercel.
    // A URL '/api/analyze-gemini' é o caminho padrão para funções na pasta 'api' no Vercel.
    const response = await fetch('/api/analyze-gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64Data, targetWord }) // Envia os dados para sua função
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Backend error: ${errorData.error || response.statusText}`);
    }

    const result = await response.json(); // Sua função serverless retorna a resposta formatada
    return result; // Já é o formato final que você espera
  } catch (error) {
    console.error("AI Analysis Failed via Proxy:", {
      error: error.message,
      imageSize: imageBase64 ? `${(imageBase64.length / 1024).toFixed(1)}KB` : "unknown",
    });
    // Use a função formatResponse para erros também
    return formatResponse(targetWord || "unrecognized", "error", false);
  }
}

// Mantenha esta função auxiliar se ela for usada em outros lugares ou para o retorno de erro
function formatResponse(guess, confidence, isCorrect) {
  return {
    guess,
    confidence,
    isCorrect: confidence === "high" ? isCorrect : false,
  };
}