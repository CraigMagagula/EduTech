
import { GoogleGenAI, GenerateContentResponse, Content } from "@google/genai";
import { EducationalMaterialRequest, MaterialType, GenerationResult, GroundingSource } from '../types';
import { GEMINI_MODEL_NAME } from '../constants';

if (!process.env.API_KEY) {
  console.warn("Gemini API key (process.env.API_KEY) is not set. API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

function constructPrompt(request: EducationalMaterialRequest): string {
  const { materialType, topic, audience, objectives, additionalDetails } = request;

  let promptBase = `You are an expert curriculum developer and AI assistant.
Topic: "${topic}"
Target Audience: ${audience}.
`;

  if (objectives) {
    promptBase += `Key Learning Objectives/Concepts or Specific Areas of Interest:\n${objectives.split('\n').map(obj => `- ${obj.trim()}`).join('\n')}\n\n`;
  }
  
  if (additionalDetails) {
    promptBase += `Additional Instructions or specific focus areas:\n${additionalDetails}\n\n`;
  }

  let specificInstructions = "";

  switch (materialType) {
    case MaterialType.LESSON_PLAN:
      specificInstructions = `Please generate a detailed lesson plan. Include: Title, Learning Objectives, Materials Needed, Step-by-step Procedure (intro, activities, conclusion), Assessment Methods, Differentiation/Extension, Time Allocation. Language: for an educator.`;
      break;
    case MaterialType.STUDY_GUIDE:
      specificInstructions = `Please generate a comprehensive study guide. Include: Title, Overview, Key Concepts/Definitions, Important Formulas/Principles, Examples/Case Studies, Practice Questions, Study Tips. Structure for easy following.`;
      break;
    case MaterialType.QUIZ:
      specificInstructions = `Please generate a well-structured quiz. Include: Quiz Title, Instructions, 5-10 Questions (mix of types like multiple-choice (A,B,C,D), true/false, short answer, clearly labeled), and a separate Answer Key. Ensure questions are unambiguous and assess objectives.`;
      break;
    case MaterialType.FIND_RESOURCES:
      specificInstructions = `Please use your search capabilities to find 3-5 relevant educational resources (like existing question papers, books, articles, or online documents) based on the topic and audience.
For each resource, clearly provide:
1.  **Resource Title:** (The title of the document or webpage)
2.  **Brief Description:** (1-2 sentences summarizing the content and its relevance)
3.  **Direct URL:** (The web address to access the resource)

Format the output for readability, clearly labeling each part for each resource.
Example:
**Resource 1:**
*   **Title:** Introduction to Photosynthesis - Lecture Notes
*   **Description:** These university lecture notes cover the basic chemical processes and stages involved in photosynthesis, suitable for undergraduate students.
*   **URL:** https://example.edu/biology/photosynthesis_intro_notes.pdf

List the resources one after another. Ensure the URLs provided are direct links to the resources if possible.
`;
      break;
    default:
      specificInstructions = `Please generate content based on the provided details.`;
  }
  
  const finalPrompt = `${promptBase}${specificInstructions}\n\nFormat the output with clear headings for each section (if applicable for the material type) and use bullet points or numbered lists where appropriate for readability. Avoid conversational fluff and stick to delivering the requested educational material or resource list.`;
  return finalPrompt;
}

export const generateEducationalMaterial = async (request: EducationalMaterialRequest): Promise<GenerationResult> => {
  if (!process.env.API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }

  const prompt = constructPrompt(request);
  const contents: Content[] = [{ role: "user", parts: [{ text: prompt }] }];

  try {
    let response: GenerateContentResponse;
    if (request.materialType === MaterialType.FIND_RESOURCES) {
      response = await ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents,
        config: {
          tools: [{ googleSearch: {} }],
          // No thinkingConfig, default to higher quality for content generation.
        }
      });
    } else {
      response = await ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents,
        // No thinkingConfig for other types either, ensuring quality.
      });
    }
    
    const text = response.text;
    let sources: GroundingSource[] | undefined = undefined;

    if (request.materialType === MaterialType.FIND_RESOURCES && response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      sources = response.candidates[0].groundingMetadata.groundingChunks
        .map(chunk => chunk.web) // Extract the 'web' object
        .filter(webChunk => webChunk && webChunk.uri) // Ensure 'web' and 'uri' exist
        .map(webChunk => ({
          uri: webChunk.uri!, // uri is guaranteed by filter
          title: webChunk.title || webChunk.uri // Use URI as fallback for title
        }));
    }

    return { text, sources };

  } catch (error) {
    console.error("Error generating content with Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate content: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating content.");
  }
};
