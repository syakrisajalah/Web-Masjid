import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const createConsultationSession = () => {
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
