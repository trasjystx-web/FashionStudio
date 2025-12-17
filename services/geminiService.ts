import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AspectRatio, ImageResolution } from "../types";

// Using the prompt instructions mapping:
// Nano Banana Pro / Gemini Pro Image -> gemini-3-pro-image-preview
// Gemini 3 Pro -> gemini-3-pro-preview

const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Helper to strip base64 prefix
const stripBase64 = (dataUrl: string) => {
  return dataUrl.split(',')[1];
};

const getMimeType = (dataUrl: string) => {
  return dataUrl.substring(dataUrl.indexOf(':') + 1, dataUrl.indexOf(';'));
};

export const generatePose = async (
  modelImage: string,
  poseDescription: string
): Promise<string> => {
  if (!API_KEY) throw new Error("API Key missing");

  const prompt = `Generate a photorealistic full-body image of this person. 
  The person should be in the following pose: ${poseDescription}.
  Maintain the facial features and body type of the reference person exactly.
  The background should be a neutral studio background.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview', // NanoBanana Pro
      contents: {
        parts: [
          {
            text: prompt
          },
          {
            inlineData: {
              mimeType: getMimeType(modelImage),
              data: stripBase64(modelImage)
            }
          }
        ]
      },
      config: {
        imageConfig: {
          imageSize: "1K",
          aspectRatio: "3:4"
        }
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Pose generation error:", error);
    throw error;
  }
};

export const generateFashionLook = async (
  poseImage: string,
  clothingImages: string[],
  settings: {
    cameraAngle: string;
    resolution: ImageResolution;
    aspectRatio: AspectRatio;
    additionalPrompt?: string;
  }
): Promise<string> => {
  if (!API_KEY) throw new Error("API Key missing");

  const prompt = `Edit the reference image (the person in the pose). 
  Dress the model in the provided clothing items. 
  Ensure the clothing fits naturally with realistic fabric physics, wrinkles, and lighting.
  Camera Angle: ${settings.cameraAngle}.
  Style: ${settings.additionalPrompt || 'High fashion photography'}.
  Output a photorealistic image.`;

  const parts: any[] = [
    { text: prompt },
    { 
      inlineData: { 
        mimeType: getMimeType(poseImage), 
        data: stripBase64(poseImage) 
      } 
    }
  ];

  // Add clothing references
  clothingImages.forEach((img) => {
    parts.push({
      inlineData: {
        mimeType: getMimeType(img),
        data: stripBase64(img)
      }
    });
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview', // NanoBanana Pro
      contents: { parts },
      config: {
        imageConfig: {
          imageSize: settings.resolution,
          aspectRatio: settings.aspectRatio
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No fashion image generated");
  } catch (error) {
    console.error("Fashion generation error:", error);
    throw error;
  }
};

export const chatWithAssistant = async (
  history: {role: 'user'|'model', text: string}[],
  newMessage: string
): Promise<string> => {
  if (!API_KEY) throw new Error("API Key missing");
  
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    history: history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    })),
    config: {
      systemInstruction: "You are an expert fashion photography assistant and stylist. You help users refine their prompts for AI image generation, suggest camera angles, and advise on styling. Keep answers concise and helpful."
    }
  });

  const result = await chat.sendMessage({ message: newMessage });
  return result.text || "I couldn't process that.";
};
