import { GoogleGenAI } from "@google/genai";

// Lazy initialization to prevent runtime crash in browsers where process is undefined
let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    // Safety check: only access process.env if it exists. 
    // In Vercel/Builds, process.env.API_KEY is replaced by string literal.
    // In raw browser, this prevents ReferenceError.
    let key = '';
    try {
      if (typeof process !== 'undefined' && process.env) {
        key = process.env.API_KEY || '';
      }
    } catch (e) {
      console.warn("Environment variable access failed", e);
    }
    
    // Fallback or empty string allowed, will fail gracefully later if used
    aiInstance = new GoogleGenAI({ apiKey: key });
  }
  return aiInstance;
};

export const createConsultationSession = () => {
  const ai = getAI();
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `Anda adalah seorang Ustadz AI yang bijaksana, ramah, dan berpengetahuan luas tentang agama Islam. 
      Tugas anda adalah menjawab pertanyaan jamaah tentang fiqih, akidah, sejarah Islam, dan konsultasi kehidupan sehari-hari berdasarkan Al-Quran dan As-Sunnah.
      Jawaban harus santun, menyejukkan hati, dan mudah dipahami. Gunakan Bahasa Indonesia yang baik.
      Jika pertanyaan menyangkut fatwa spesifik yang kontroversial, sarankan untuk berkonsultasi langsung dengan ulama setempat.`,
    },
  });
};

export const sendMessageToUstaz = async (chatSession: any, message: string) => {
  try {
    const response = await chatSession.sendMessageStream({ message });
    return response;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};