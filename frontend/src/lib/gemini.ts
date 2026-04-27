import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function extractFeedbackFromImage(base64Image: string, mimeType: string = "image/png") {
  try {
    const response = await axios.post(`${API_URL}/ai/extract`, {
      image: base64Image,
      mimeType: mimeType
    });
    
    return response.data;
  } catch (error: any) {
    console.error("Gemini Extraction Error:", error);
    throw new Error(error.response?.data?.error || "Failed to process image with AI");
  }
}

export async function extractFeedbackFromText(rawText: string) {
  try {
    // For text, we can still use a simplified backend call or just the same extraction logic
    const response = await axios.post(`${API_URL}/ai/extract`, {
      image: rawText, // The backend handles it if it's not a base64 image too
      mimeType: 'text/plain'
    });
    
    return response.data;
  } catch (error: any) {
    console.error("Gemini Text Error:", error);
    throw new Error(error.response?.data?.error || "Failed to process text with AI");
  }
}
export async function chatWithAI(message: string) {
  try {
    const response = await axios.post(`${API_URL}/ai/chat`, { message });
    return response.data.reply;
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    throw new Error(error.response?.data?.error || "Failed to connect to AI");
  }
}

export async function enhanceTestimonial(feedback: string, tone: string) {
  try {
    const response = await axios.post(`${API_URL}/ai/enhance`, { feedback, tone });
    return response.data.feedback;
  } catch (error: any) {
    console.error("AI Enhance Error:", error);
    throw new Error(error.response?.data?.error || "Failed to enhance testimonial");
  }
}
