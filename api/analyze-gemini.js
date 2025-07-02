// api/analyze-gemini.js
// Este código roda no ambiente Serverless do Vercel (Node.js), NÃO no navegador.
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function (req, res) {
  // A chave da API será lida das variáveis de ambiente do Vercel, não do .env local.
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "Gemini API Key is not configured on the server." });
  }

  // O Vercel Functions automaticamente faz o parse do body para JSON
  const { imageBase64, targetWord } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: "Image data is required." });
  }

  // Validação básica da imagem (opcional, mas bom ter)
  if (!imageBase64.match(/^data:image\/(png|jpeg);base64,/)) {
    return res.status(400).json({ error: "Invalid image format." });
  }
  const base64Data = imageBase64.split(",")[1];


  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      ],
      generationConfig: {
        temperature: 0.1,
        topP: 0.3,
        maxOutputTokens: 5,
      },
    });

    // Seu prompt original (copie e cole todo o conteúdo do seu prompt aqui)
    const prompt = `
You are analyzing drawings made by children ages 5-8 for an English learning game.
Follow these rules STRICTLY:

1. SHAPE-BASED ANALYSIS:
    - Circle with lines radiating out = "sun"
    - Square with triangle on top = "house"
    - Four lines attached to oval = "dog" (not specific breeds)
    - Green triangle on rectangle = "tree"

2. COLOR INTERPRETATION:
    - Yellow circle = "sun" (ignore if lines are missing)
    - Brown rectangle with green top = "tree"
    - Red circle = "apple" (only if stem present)

3. CHILD DRAWING CONVENTIONS:
    - Faces: Circle with dots for eyes
    - Animals: Basic shapes with legs as straight lines
    - Vehicles: Rectangles with circles as wheels
    - Plants: Simple stem with leaves or flowers

4. WORD SELECTION RULES:
    - Only choose from these words (never invent new ones):
      ${[
        "apple",
        "ball",
        "cat",
        "dog",
        "egg",
        "fish",
        "girl",
        "hat",
        "ice",
        "nose",
        "owl",
        "pig",
        "queen",
        "rain",
        "tree",
        "umbrella",
        "box",
        "book",
        "car",
        "duck",
        "eye",
        "foot",
        "grape",
        "hand",
        "orange",
        "pen",
        "rose",
        "table",
        "violin",
        "window",
        "ant",
        "bag",
        "cup",
        "door",
        "ear",
        "flag",
        "lip",
        "rat",
        "web",
      ].join(", ")}

5. RESPONSE FORMAT:
    - Single lowercase word only
    - If unclear, respond with "Desconhecido"
    - Never add explanations
    - For ambiguous cases, choose the simpler option

${
      targetWord
        ? `
6. CONTEXT CLUES:
    - The target word relates to: "${targetWord}"
    - Consider similar shapes but don't say the word itself
    - If between options, pick one closer to this category
`
        : ""
    }

EXAMPLES OF PROPER ANALYSIS:
- Circle with 8 lines = "sun" (not "wheel")
- Brown rectangle + green blob = "tree" (not "broccoli")
- Circle + 4 lines + tail = "dog" (not "wolf")
- Red circle + stem = "apple" (not "tomato")
`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { data: base64Data, mimeType: "image/png" } },
          ],
        },
      ],
    });

    const response = await result.response;
    const text = response
      .text()
      .trim()
      .toLowerCase()
      .replace(/[^a-z]/g, "");

    // Adapte a função formatResponse se ela for usada aqui, ou retorne diretamente
    function formatResponse(guess, confidence, isCorrect) {
      return {
        guess,
        confidence,
        isCorrect: confidence === "high" ? isCorrect : false,
      };
    }

    // Retorne a resposta formatada para o frontend
    if (!text || text === "object" || text === "shape") {
      return res.status(200).json(formatResponse(targetWord || "unrecognized", "low", false));
    }

    return res.status(200).json(formatResponse(
      text,
      "high",
      targetWord ? text === targetWord.toLowerCase() : null
    ));

  } catch (error) {
    console.error("Serverless AI Analysis Failed:", {
      error: error.message,
      imageSize: base64Data
        ? `${(base64Data.length / 1024).toFixed(1)}KB`
        : "unknown",
    });
    return res.status(500).json({ error: "Failed to analyze drawing via API proxy.", details: error.message });
  }
}