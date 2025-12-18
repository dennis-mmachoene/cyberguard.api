import { getGeminiModel, getGeminiChat } from '../config/gemini.js';
import { sanitizeAIPrompt, sanitizeAIResponse } from '../utils/sanitizers.js';
import AuditLog from '../models/AuditLog.js';

class AIService {
  // Generate extended learning content explanation
  async generateContentExplanation(topic, context, userId) {
    try {
      const sanitizedTopic = sanitizeAIPrompt(topic);
      const sanitizedContext = sanitizeAIPrompt(context);
      
      const prompt = `You are a cybersecurity education assistant. Provide a clear, concise explanation of the following cybersecurity topic. Keep the explanation educational, accurate, and accessible to learners.

Topic: ${sanitizedTopic}
Context: ${sanitizedContext}

Provide a 2-3 paragraph explanation focusing on:
1. What this concept is
2. Why it matters for cybersecurity
3. Real-world implications

Keep the language professional but approachable. Do not include code examples or technical implementations.`;

      const model = getGeminiModel();
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      const sanitizedResponse = sanitizeAIResponse(text);
      
      // Log AI usage
      await AuditLog.create({
        userId,
        action: 'ai.content-generated',
        category: 'ai',
        severity: 'info',
        details: {
          type: 'content-explanation',
          topic: sanitizedTopic,
        },
      });
      
      return {
        success: true,
        content: sanitizedResponse,
      };
    } catch (error) {
      console.error('AI Content Generation Error:', error);
      
      await AuditLog.create({
        userId,
        action: 'ai.request-blocked',
        category: 'ai',
        severity: 'warning',
        details: {
          type: 'content-explanation',
          error: error.message,
        },
      });
      
      return {
        success: false,
        error: 'Failed to generate content explanation',
      };
    }
  }

  // Generate adaptive quiz question based on performance
  async generateAdaptiveQuestion(level, topic, difficulty, userId) {
    try {
      const sanitizedTopic = sanitizeAIPrompt(topic);
      
      const prompt = `Generate a cybersecurity quiz question for the following specifications:

Level: ${level}
Topic: ${sanitizedTopic}
Difficulty: ${difficulty}

Create a multiple-choice question with:
- One clear question
- Four options (A, B, C, D)
- Correct answer indicated
- Brief explanation of why the answer is correct

Format your response as JSON:
{
  "question": "...",
  "options": ["A...", "B...", "C...", "D..."],
  "correctAnswer": 0-3,
  "explanation": "..."
}

Ensure the question tests understanding, not memorization. Make it relevant to real-world cybersecurity scenarios.`;

      const model = getGeminiModel();
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid AI response format');
      }
      
      const questionData = JSON.parse(jsonMatch[0]);
      
      // Validate structure
      if (!questionData.question || !Array.isArray(questionData.options) || 
          questionData.options.length !== 4 || typeof questionData.correctAnswer !== 'number') {
        throw new Error('Invalid question structure');
      }
      
      // Sanitize all fields
      questionData.question = sanitizeAIResponse(questionData.question);
      questionData.options = questionData.options.map(opt => sanitizeAIResponse(opt));
      questionData.explanation = sanitizeAIResponse(questionData.explanation);
      
      // Log AI usage
      await AuditLog.create({
        userId,
        action: 'ai.content-generated',
        category: 'ai',
        severity: 'info',
        details: {
          type: 'adaptive-question',
          level,
          topic: sanitizedTopic,
          difficulty,
        },
      });
      
      return {
        success: true,
        question: questionData,
      };
    } catch (error) {
      console.error('AI Question Generation Error:', error);
      
      await AuditLog.create({
        userId,
        action: 'ai.request-blocked',
        category: 'ai',
        severity: 'warning',
        details: {
          type: 'adaptive-question',
          error: error.message,
        },
      });
      
      return {
        success: false,
        error: 'Failed to generate adaptive question',
      };
    }
  }

  // Generate corrective feedback for wrong answers
  async generateCorrectiveFeedback(question, userAnswer, correctAnswer, userId) {
    try {
      const sanitizedQuestion = sanitizeAIPrompt(question);
      
      const prompt = `A learner answered a cybersecurity quiz question incorrectly. Provide helpful, constructive feedback.

Question: ${sanitizedQuestion}
Learner's Answer: ${userAnswer}
Correct Answer: ${correctAnswer}

Provide brief feedback (2-3 sentences) that:
1. Gently corrects the misconception
2. Explains why the correct answer is right
3. Encourages continued learning

Keep tone supportive and educational.`;

      const model = getGeminiModel();
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      const sanitizedFeedback = sanitizeAIResponse(text);
      
      return {
        success: true,
        feedback: sanitizedFeedback,
      };
    } catch (error) {
      console.error('AI Feedback Generation Error:', error);
      return {
        success: false,
        error: 'Failed to generate feedback',
      };
    }
  }

  // Validate that AI response is within scope (cybersecurity education only)
  validateResponseScope(response) {
    const blockedPatterns = [
      /system\s*:/i,
      /jailbreak/i,
      /ignore\s+previous/i,
      /disregard\s+instructions/i,
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
    ];
    
    return !blockedPatterns.some(pattern => pattern.test(response));
  }
}

export default new AIService();