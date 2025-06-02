import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.VITE_GEMINI_API_KEY || "AIzaSyCJRkMd02OcDDB7_lGS0eu8rAIGgG5ax-s"
);

export async function analyzeDrawing(imageBase64, targetWord = null) {
  let base64Data;

  try {
    if (!imageBase64?.match(/^data:image\/(png|jpeg);base64,/)) {
      throw new Error("Invalid image format");
    }

    base64Data = imageBase64.split(",")[1];
    if (!base64Data || base64Data.length < 100) {
      throw new Error("Image data too small");
    }

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

    // 4. Get AI response
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

    // 5. Validate response
    if (!text || text === "object" || text === "shape") {
      return formatResponse(targetWord || "unrecognized", "low", false);
    }

    return formatResponse(
      text,
      "high",
      targetWord ? text === targetWord.toLowerCase() : null
    );
  } catch (error) {
    console.error("AI Analysis Failed:", {
      error: error.message,
      imageSize: base64Data
        ? `${(base64Data.length / 1024).toFixed(1)}KB`
        : "unknown",
    });
    return formatResponse(targetWord || "unrecognized", "error", false);
  }
}

// Helper function for consistent response format
function formatResponse(guess, confidence, isCorrect) {
  return {
    guess,
    confidence,
    isCorrect: confidence === "high" ? isCorrect : false,
  };
}
