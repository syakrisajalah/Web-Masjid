import { GoogleGenAI } from "@google/genai";

// Ensure API Key exists
const apiKey = process.env.API_KEY;

// Initialize AI Instance
// Note: If apiKey is missing, this might throw an error or fail silently depending on usage.
// The UI should handle cases where the AI service fails.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const createConsultationSession = () => {
  if (!ai) {
      console.error("API Key is missing via process.env.API_KEY");
      // Return a dummy object that throws a clear error when used
      return {
          sendMessageStream: async () => { throw new Error("API Key configuration is missing. Please check your .env or Vercel settings."); }
      };
  }

  // Menggunakan model 'gemini-3-flash-preview' sesuai panduan untuk Basic Text Tasks
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
    if (!chatSession) throw new Error("No chat session initialized");
    
    // Using sendMessageStream directly based on session object from @google/genai
    const response = await chatSession.sendMessageStream({ message });
    return response;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};