import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function getLiveAIResponse(userMessage: string): Promise<string> {
  try {
    const response = await axios.post(`${API_URL}/ai/chat`, {
      message: userMessage
    });
    
    return response.data.reply;
  } catch (error: any) {
    console.error("Backend AI Call Failed:", error.message, error.response?.data);
    return `[System Error]: ${error.message}. ` + (error.response?.data?.error || "Cannot reach backend. Please restart your server.");
  }
}
