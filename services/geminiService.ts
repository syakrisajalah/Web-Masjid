import { GoogleGenAI } from "@google/genai";

// Lazy initialization to prevent runtime crash
let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    let key = '';
    
    // 1. Coba ambil dari Vite Environment (Standar Hosting Modern/Vercel)
    try {
       // @ts-ignore
       if (typeof import.meta !== 'undefined' && import.meta.env) {
          // @ts-ignore
          key = import.meta.env.VITE_API_KEY || '';
       }
    } catch (e) { /* Ignore if not in Vite */ }

    // 2. Coba ambil dari Process Env (Node.js / AI Studio) jika belum ada
    if (!key) {
        try {
            if (typeof process !== 'undefined' && process && process.env) {
                // @ts-ignore
                key = process.env.API_KEY || '';
            }
        } catch (e) { /* Ignore */ }
    }
    
    // Fallback if no key is found
    if (!key) {
        console.warn("API Key not found. AI features will be disabled.");
        return null;
    }

    aiInstance = new GoogleGenAI({ apiKey: key });
  }
  return aiInstance;
};

export const createConsultationSession = () => {
  const ai = getAI();
  if (!ai) {
      // Return dummy object to prevent crash, UI handles errors separately
      return {
          sendMessageStream: async () => { throw new Error("API Key Missing"); }
      };
  }

  return ai.chats.create({
    model: 'gemini-2.0-flash-exp',
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
    if (!chatSession) throw new Error("No chat session");
    const response = await chatSession.sendMessageStream({ message });
    return response;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};