import { GoogleGenAI } from "@google/genai";

// Initialize AI Instance strictly following guidelines
// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
// The key is assumed to be handled externally and is a hard requirement.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const createConsultationSession = () => {
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
