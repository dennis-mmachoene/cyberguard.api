import { GoogleGenerativeAI } from '@google/generative-ai';
import environment from './environment.js';

const genAI = new GoogleGenerativeAI(environment.ai.gemini.apiKey);

const getGeminiModel = () => {
  return genAI.getGenerativeModel({
    model: environment.ai.gemini.model,
    safetySettings: environment.ai.gemini.safetySettings,
    generationConfig: environment.ai.gemini.generationConfig,
  });
};

const getGeminiChat = (history = []) => {
  const model = getGeminiModel();
  return model.startChat({
    history,
    generationConfig: environment.ai.gemini.generationConfig,
    safetySettings: environment.ai.gemini.safetySettings,
  });
};

export { getGeminiModel, getGeminiChat };