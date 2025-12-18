import { getGeminiChat } from '../config/gemini.js';
import { sanitizeAIPrompt, sanitizeAIResponse } from '../utils/sanitizers.js';
import ChatSession from '../models/ChatSession.js';
import { generateSessionId } from '../utils/tokenGenerator.js';
import platformFAQ from '../data/platformFAQ.js';
import cybersecurityConcepts from '../data/cybersecurityConcepts.js';
import progressTrackingService from './progressTrackingService.js';
import AuditLog from '../models/AuditLog.js';

class ChatbotService {
  // System prompt for the AI chatbot
  getSystemPrompt() {
    return `You are the Cyberguard AI Assistant, a helpful guide for the Cyberguard cybersecurity education platform. Your role is strictly limited to:

1. Explaining how the Cyberguard platform works (learning paths, modules, points, badges, leaderboard)
2. Clarifying cybersecurity concepts covered in the platform's learning content
3. Answering platform-related questions
4. Guiding users on how to navigate and use features

STRICT RULES (NON-NEGOTIABLE):
- You CANNOT help with quiz questions or provide answers to learning challenges
- You CANNOT perform actions on behalf of users (no creating, deleting, modifying data)
- You CANNOT access private user data or system internals
- You CANNOT provide exploit guidance or real-world attack instructions
- You MUST refuse questions outside cybersecurity education scope
- You MUST stay within your knowledge boundary

If a question falls outside your scope, politely decline and suggest appropriate resources or clarify what you can help with.

Keep responses concise, helpful, and educational. Always maintain a professional but friendly tone.`;
  }

  // Check if user is in an active learning module (chatbot should be blocked)
  async isUserInActiveModule(userId) {
    try {
      const activeModule = await progressTrackingService.getActiveModule(userId);
      return !!activeModule;
    } catch (error) {
      return false;
    }
  }

  // Process chatbot query
  async processChatbotQuery(userId, message, sessionId = null) {
    try {
      // Check if user is in active module
      const inActiveModule = await this.isUserInActiveModule(userId);
      
      if (inActiveModule) {
        // Block chatbot during active learning
        await AuditLog.create({
          userId,
          action: 'chatbot.blocked-during-challenge',
          category: 'chatbot',
          severity: 'info',
          metadata: {
            query: message.substring(0, 100),
            blocked: true,
            reason: 'active-module',
          },
        });
        
        return {
          success: false,
          blocked: true,
          reason: 'active-module',
          message: "I can't help while you're completing a learning activity. Please finish the module or challenge first.",
        };
      }
      
      // Sanitize input
      const sanitizedMessage = sanitizeAIPrompt(message);
      
      // Get or create session
      let session;
      if (sessionId) {
        session = await ChatSession.findOne({ sessionId, userId, isActive: true });
      }
      
      if (!session) {
        const newSessionId = generateSessionId();
        session = await ChatSession.create({
          userId,
          sessionId: newSessionId,
          messages: [],
        });
      }
      
      // Build context for AI
      const context = this.buildContext();
      
      // Prepare chat history
      const chatHistory = session.messages.slice(-10).map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }));
      
      // Add system context as first message if history is empty
      if (chatHistory.length === 0) {
        chatHistory.unshift({
          role: 'user',
          parts: [{ text: this.getSystemPrompt() }],
        });
        chatHistory.push({
          role: 'model',
          parts: [{ text: 'Understood. I am ready to help you with Cyberguard platform questions and cybersecurity education topics.' }],
        });
      }
      
      // Create chat with history
      const chat = getGeminiChat(chatHistory);
      
      // Send user message
      const result = await chat.sendMessage(`${context}\n\nUser Question: ${sanitizedMessage}`);
      const response = result.response;
      const aiResponse = response.text();
      
      // Sanitize response
      const sanitizedResponse = sanitizeAIResponse(aiResponse);
      
      // Validate response is within scope
      if (!this.validateResponseScope(sanitizedResponse)) {
        throw new Error('Response validation failed');
      }
      
      // Add messages to session
      session.addMessage('user', sanitizedMessage);
      session.addMessage('assistant', sanitizedResponse);
      await session.save();
      
      // Log query
      await AuditLog.create({
        userId,
        action: 'chatbot.query',
        category: 'chatbot',
        severity: 'info',
        metadata: {
          query: sanitizedMessage.substring(0, 100),
          blocked: false,
        },
      });
      
      return {
        success: true,
        response: sanitizedResponse,
        sessionId: session.sessionId,
      };
    } catch (error) {
      console.error('Chatbot Error:', error);
      
      await AuditLog.create({
        userId,
        action: 'chatbot.query',
        category: 'chatbot',
        severity: 'warning',
        details: {
          error: error.message,
        },
      });
      
      return {
        success: false,
        error: 'I encountered an error processing your request. Please try rephrasing your question or contact support if the issue persists.',
      };
    }
  }

  // Build context from FAQ and concepts
  buildContext() {
    const faqContext = platformFAQ.map(category => {
      const questions = category.questions.map(q => `Q: ${q.question}\nA: ${q.answer}`).join('\n\n');
      return `${category.category}:\n${questions}`;
    }).join('\n\n---\n\n');
    
    const conceptsContext = Object.entries(cybersecurityConcepts).map(([category, concepts]) => {
      const items = concepts.map(c => `- ${c.term}: ${c.definition}`).join('\n');
      return `${category}:\n${items}`;
    }).join('\n\n');
    
    return `PLATFORM KNOWLEDGE BASE:\n\n${faqContext}\n\n---\n\nCYBERSECURITY CONCEPTS:\n\n${conceptsContext}`;
  }

  // Validate response is within allowed scope
  validateResponseScope(response) {
    // Check for blocked patterns
    const blockedPatterns = [
      /system\s*:/i,
      /jailbreak/i,
      /ignore\s+previous/i,
      /disregard\s+instructions/i,
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /exploit.*steps/i,
      /how\s+to\s+hack/i,
    ];
    
    // Check for answer-giving patterns
    const answerPatterns = [
      /the\s+correct\s+answer\s+is/i,
      /answer:\s*[A-D]/i,
      /choose\s+option\s+[A-D]/i,
    ];
    
    const hasBlockedContent = blockedPatterns.some(pattern => pattern.test(response));
    const hasAnswers = answerPatterns.some(pattern => pattern.test(response));
    
    return !hasBlockedContent && !hasAnswers;
  }

  // Get user's chat history
  async getChatHistory(userId, sessionId) {
    try {
      const session = await ChatSession.findOne({ userId, sessionId });
      
      if (!session) {
        return {
          success: false,
          error: 'Session not found',
        };
      }
      
      return {
        success: true,
        messages: session.messages,
        sessionId: session.sessionId,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch chat history',
      };
    }
  }

  // End chat session
  async endChatSession(userId, sessionId) {
    try {
      const session = await ChatSession.findOne({ userId, sessionId });
      
      if (session) {
        session.endSession();
        await session.save();
      }
      
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }

  // Get recent sessions for user
  async getRecentSessions(userId, limit = 5) {
    try {
      const sessions = await ChatSession.find({ userId })
        .sort({ lastMessageAt: -1 })
        .limit(limit)
        .select('sessionId lastMessageAt messageCount isActive');
      
      return sessions;
    } catch (error) {
      throw new Error('Failed to fetch recent sessions');
    }
  }
}

export default new ChatbotService();