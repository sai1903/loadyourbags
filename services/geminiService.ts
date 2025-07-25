

import { GoogleGenAI, Type } from "@google/genai";

// Ensure the API key is available as an environment variable
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProductDescription = async (
  productName: string,
  keywords: string
): Promise<string> => {
  try {
    const prompt = `Generate a compelling, short e-commerce product description for a product named "${productName}". 
    Incorporate the following keywords: ${keywords}.
    The tone should be enthusiastic and persuasive, targeting online shoppers. Make it about 2-3 sentences long.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
          topP: 1,
          topK: 1,
        }
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating product description:", error);
    // Provide a user-friendly error message
    return "We had trouble generating a description. Please try again or write one manually.";
  }
};

export const generateFaqs = async (
  productName: string,
  productContext: string // description, specs, etc.
): Promise<{ question: string; answer: string }[]> => {
  try {
    const prompt = `Based on the following product information, generate 3-5 frequently asked questions (FAQs) with clear, concise answers.
    The product is named "${productName}".
    Product context: "${productContext}".
    
    Return the result as a JSON array of objects, where each object has a "question" and "answer" key.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: "The frequently asked question.",
              },
              answer: {
                type: Type.STRING,
                description: "The answer to the question.",
              },
            },
            required: ["question", "answer"],
          },
        },
      },
    });

    const jsonString = response.text.trim();
    const faqs = JSON.parse(jsonString);
    return Array.isArray(faqs) ? faqs : [];

  } catch (error) {
    console.error("Error generating product FAQs:", error);
    return [];
  }
};
