import chatbotService from '../services/chatbotService.js';
import { formatSuccessResponse, formatErrorResponse } from '../utils/responseFormatter.js';

// Send message to chatbot
export const sendMessage = async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;
    
    const result = await chatbotService.processChatbotQuery(
      req.user._id,
      message,
      sessionId
    );
    
    if (!result.success) {
      if (result.blocked) {
        return res.status(403).json(
          formatErrorResponse(
            result.message,
            'CHATBOT_BLOCKED',
            { reason: result.reason }
          )
        );
      }
      
      return res.status(500).json(
        formatErrorResponse(
          result.error || 'Failed to process message',
          'CHATBOT_ERROR'
        )
      );
    }
    
    return res.status(200).json(
      formatSuccessResponse(
        {
          response: result.response,
          sessionId: result.sessionId,
        },
        'Message processed successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Get chat history
export const getChatHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    const result = await chatbotService.getChatHistory(req.user._id, sessionId);
    
    if (!result.success) {
      return res.status(404).json(
        formatErrorResponse(result.error, 'SESSION_NOT_FOUND')
      );
    }
    
    return res.status(200).json(
      formatSuccessResponse(
        {
          messages: result.messages,
          sessionId: result.sessionId,
        },
        'Chat history fetched successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// End chat session
export const endChatSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    await chatbotService.endChatSession(req.user._id, sessionId);
    
    return res.status(200).json(
      formatSuccessResponse(null, 'Chat session ended successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Get recent sessions
export const getRecentSessions = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    
    const sessions = await chatbotService.getRecentSessions(req.user._id, limit);
    
    return res.status(200).json(
      formatSuccessResponse(
        { sessions },
        'Recent sessions fetched successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};