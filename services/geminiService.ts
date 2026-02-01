import { GoogleGenAI } from "@google/genai";

export const createConsultationSession = () => {
  // Mengambil API Key yang sudah dipetakan oleh Vite dari VITE_API_KEY
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "") {
    console.error("DEBUG: process.env.API_KEY is empty. Please check VITE_API_KEY in Vercel settings.");
    throw new Error("API Key missing");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

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
  } catch (error) {
    console.error("Gagal menginisialisasi GoogleGenAI:", error);
    throw error;
  }
};

export const sendMessageToUstaz = async (chatSession: any, message: string) => {
  try {
    if (!chatSession) throw new Error("No chat session initialized");
    
    // Menggunakan sendMessageStream untuk respon yang lebih interaktif
    const response = await chatSession.sendMessageStream({ message });
    return response;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};