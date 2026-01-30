
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { AiSettings, DesignType, PaletteItem } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateImage = async (prompt: string, settings: AiSettings): Promise<string> => {
  const ai = getAi();
  try {
    const response = await ai.models.generateContent({
      model: settings.imageModel,
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: settings.aspectRatio,
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    throw new Error('No image was generated.');
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
};

export const editImage = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string,
  settings: AiSettings
): Promise<string> => {
  const ai = getAi();
  try {
    const response = await ai.models.generateContent({
      model: settings.editModel,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    throw new Error('No edited image was returned.');
  } catch (error) {
    console.error('Error editing image:', error);
    throw error;
  }
};

export const generateSvg = async (prompt: string, type: DesignType, settings: AiSettings): Promise<string> => {
    const ai = getAi();
    const typePrompt = type === 'logo' ? 'a professional logo' : 'an SVG icon/graphic';
    const systemInstruction = `You are an expert SVG designer. Your task is to generate clean, valid, single-file SVG code based on the user's prompt. 
- The SVG should be scalable and use vector shapes.
- Do not include any raster images.
- Use a modern, flat design aesthetic.
- The output MUST be ONLY the SVG code itself, starting with <svg> and ending with </svg>. 
- Do NOT include markdown code blocks like \`\`\`svg or any other explanatory text.`;

  try {
    const response = await ai.models.generateContent({
        model: settings.textModel,
        contents: `Generate ${typePrompt} for: "${prompt}"`,
        config: {
            systemInstruction: systemInstruction,
            temperature: settings.temperature,
        },
    });

    const svgCode = response.text.trim();

    if (svgCode.startsWith('<svg') && svgCode.endsWith('</svg>')) {
        return svgCode;
    }
    
    throw new Error('Generated response was not valid SVG code.');

  } catch (error) {
    console.error('Error generating SVG:', error);
    throw error;
  }
};

export const generateColorPalette = async (prompt: string, settings: AiSettings): Promise<PaletteItem[]> => {
  const ai = getAi();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on the following design prompt, suggest a harmonious 5-color palette: "${prompt}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              hex: { type: Type.STRING, description: 'The hex color code (e.g. #FFFFFF)' },
              name: { type: Type.STRING, description: 'A descriptive name for the color' }
            },
            required: ['hex', 'name']
          }
        }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error('Error generating palette:', error);
    return [];
  }
};
