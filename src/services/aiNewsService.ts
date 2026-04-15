import { GoogleGenAI, Type } from "@google/genai";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { UNIQUE_DISTRICTS } from "@/src/constants/districts";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

export const generateAINews = async (category: string, categoryNepali: string) => {
  if (!apiKey) {
    throw new Error("Gemini API key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Find the latest ${category.toLowerCase() === 'monarchy' ? 'news, historical context, and trending discussions related to the monarchy of Nepal' : `trending and breaking news in Nepal for the category "${category}" (${categoryNepali})`} from ${category.toLowerCase() === 'monarchy' ? 'the past week' : 'today'}. 
  Based on the search results, write a highly detailed, professional, and high-quality news article in Nepali.
  
  The article must include:
  1. A catchy, factual, and descriptive title.
  2. A comprehensive, engaging excerpt (3-4 sentences) that highlights the key points.
  3. Detailed content (at least 8-10 long paragraphs) with a formal journalistic tone. Include background context, quotes (if available from search), implications of the news, and future outlook. Use proper HTML formatting for the content (e.g., <p>, <h2>, <blockquote>, <strong>) to make it look like a professional news article on a website. Do not wrap the whole content in a single tag, use multiple paragraphs.
  4. Relevant Nepali districts (from the provided list) that this news is specifically related to.
  5. Use the researched and searched contents to provide depth and accuracy.
  
  List of valid Nepali districts: ${UNIQUE_DISTRICTS.join(", ")}
  
  Return the response as a JSON object.`;

  const modelsToTry = [
    "gemini-1.5-flash"
  ];

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "The news title in Nepali" },
              excerpt: { type: Type.STRING, description: "A detailed summary in Nepali" },
              content: { type: Type.STRING, description: "The full detailed article body in Nepali" },
              districts: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "List of Nepali districts related to this news"
              },
              sourceUrls: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "List of source URLs used for grounding"
              },
              imageKeywords: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "A list of 3-5 specific keywords in English for searching a relevant image (e.g., ['Kathmandu', 'Nepal Politics', 'Himalayas'])" 
              }
            },
            required: ["title", "excerpt", "content", "imageKeywords", "districts"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("No content generated.");
      
      const data = JSON.parse(text);
      
      // Duplicate check: Check if an article with this title already exists
      const q = query(collection(db, "articles"), where("title", "==", data.title));
      const existing = await getDocs(q);
      
      if (!existing.empty) {
        throw new Error("यो समाचार पहिले नै अवस्थित छ।");
      }

      // Extract grounding URLs if available
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources = chunks?.map(c => c.web?.uri).filter(Boolean) as string[] || [];
      
      // Fetch image from Wikimedia Commons using keywords
      let finalImageUrl = "";
      try {
        const keywords = data.imageKeywords || [category];
        const searchString = keywords.join(" ");
        const wikiRes = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(searchString)}&gsrlimit=1&prop=imageinfo&iiprop=url&format=json&origin=*`);
        const wikiData = await wikiRes.json();
        if (wikiData.query && wikiData.query.pages) {
          const pages = wikiData.query.pages;
          const firstPageId = Object.keys(pages)[0];
          if (pages[firstPageId].imageinfo && pages[firstPageId].imageinfo.length > 0) {
            finalImageUrl = pages[firstPageId].imageinfo[0].url;
          }
        }
      } catch (err) {
        console.error("Failed to fetch image from Wikimedia:", err);
      }

      if (!finalImageUrl) {
        // Fallback to picsum if wikimedia fails
        const seed = encodeURIComponent(data.title.substring(0, 20));
        finalImageUrl = `https://picsum.photos/seed/${seed || 'news'}/1200/800`;
      }
      
      return {
        ...data,
        imageUrl: finalImageUrl,
        sourceUrls: sources.length > 0 ? sources : (data.sourceUrls || [])
      };
    } catch (error) {
      console.error(`AI Generation Error with model ${model}:`, error);
      lastError = error;
    }
  }

  throw lastError;
};
