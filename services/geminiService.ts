import { GoogleGenAI, Type } from "@google/genai";
import { SentimentResult, AspectResult, StatisticsData } from '../types';

// --- Custom Error Classes ---
export class GeminiApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiApiError';
  }
}
export class InvalidApiKeyError extends GeminiApiError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidApiKeyError';
  }
}
export class ContentBlockedError extends GeminiApiError {
  constructor(message: string) {
    super(message);
    this.name = 'ContentBlockedError';
  }
}
export class RateLimitError extends GeminiApiError {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}
export class ModelNotFoundError extends GeminiApiError {
    constructor(message: string) {
      super(message);
      this.name = 'ModelNotFoundError';
    }
}
export class ApiServerError extends GeminiApiError {
    constructor(message: string) {
      super(message);
      this.name = 'ApiServerError';
    }
}
export class NetworkError extends GeminiApiError {
    constructor(message: string) {
      super(message);
      this.name = 'NetworkError';
    }
}
export class InvalidFormatError extends GeminiApiError {
    constructor(message: string) {
      super(message);
      this.name = 'InvalidFormatError';
    }
}


const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const sentimentSchema = {
  type: Type.OBJECT,
  properties: {
    sentiment: {
      type: Type.STRING,
      description: 'The overall sentiment of the text. Must be one of: positive, negative, neutral.',
      enum: ['positive', 'negative', 'neutral'],
    },
    confidence: {
      type: Type.NUMBER,
      description: 'A confidence score between 0.0 and 1.0 for the sentiment classification.',
    },
    scores: {
      type: Type.OBJECT,
      properties: {
        positive: { type: Type.NUMBER, description: 'Score for positive sentiment (0.0 to 1.0)' },
        negative: { type: Type.NUMBER, description: 'Score for negative sentiment (0.0 to 1.0)' },
        neutral: { type: Type.NUMBER, description: 'Score for neutral sentiment (0.0 to 1.0)' },
      },
      required: ['positive', 'negative', 'neutral']
    }
  },
  required: ['sentiment', 'confidence', 'scores'],
};


const aspectSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            aspect: {
                type: Type.STRING,
                description: 'The specific feature or topic being discussed in the text.'
            },
            sentiment: {
                type: Type.STRING,
                description: 'The sentiment towards the aspect. Must be one of: positive, negative, neutral.',
                enum: ['positive', 'negative', 'neutral']
            },
            confidence: {
                type: Type.NUMBER,
                description: 'A confidence score between 0.0 and 1.0 for the aspect sentiment.'
            }
        },
        required: ['aspect', 'sentiment', 'confidence']
    }
};

const systemInstruction = `You are an expert sentiment analysis engine. Your task is to analyze text with high accuracy, considering context, nuance, sarcasm, and idioms. 
You must always respond in the structured JSON format requested.`;


/**
 * Handles errors from the Gemini API and throws a corresponding custom error.
 * @param error The error caught from the try/catch block.
 * @param context A string describing the operation that failed (e.g., 'sentiment analysis').
 * @param rawResponse The raw text response from the model, if available.
 * @throws {GeminiApiError} A specific custom error with a user-friendly message.
 */
const handleGeminiError = (error: unknown, context: string, rawResponse?: string): never => {
    // Log the full error for better debugging
    console.error(`Error during ${context}:`, JSON.stringify(error, null, 2));

    // If it's already one of our custom API errors, it has a user-friendly message. Re-throw it.
    if (error instanceof GeminiApiError) {
        throw error;
    }

    // Handle JSON parsing errors specifically
    if (error instanceof SyntaxError) {
        console.error('Raw model response that failed to parse:', rawResponse);
        throw new InvalidFormatError('The AI model returned an invalid format. This can happen occasionally. Please try again.');
    }

    // Handle errors from the Gemini API (and other generic errors)
    if (error instanceof Error) {
        const message = error.message.toLowerCase();

        // Specific API key issue
        if (message.includes('api key not valid')) {
            throw new InvalidApiKeyError('Invalid API Key: Please check your API key configuration. It might be incorrect, expired, or missing required permissions.');
        }
        // Content safety blocking
        if (message.includes('blocked') || message.includes('safety')) {
            throw new ContentBlockedError('Content Blocked: The request was blocked due to safety settings. Please adjust your input text.');
        }
        // Quota/rate limit issues
        if (message.includes('resource has been exhausted') || message.includes('quota') || message.includes('rate limit')) {
            throw new RateLimitError('Quota Exceeded: You have exceeded your API usage limit. Please check your plan and billing details.');
        }
        // Model not found
        if (message.includes('model not found')) {
            throw new ModelNotFoundError('Model Not Found: The specified AI model is not available. This could be a temporary issue or an incorrect model name.');
        }
        // Generic server-side errors
        if (message.includes('500') || message.includes('server error')) {
             throw new ApiServerError('API Server Error: The AI service is currently experiencing issues. Please try again in a few moments.');
        }
        // Network errors
        if (message.includes('fetch failed') || message.includes('network')) {
            throw new NetworkError('Network Error: Could not connect to the AI service. Please check your internet connection.');
        }
    }
    
    // Fallback for any other unexpected errors
    throw new GeminiApiError(`An unexpected error occurred during ${context}. Please check the console for details and try again.`);
}


export const analyzeText = async (text: string, model: string): Promise<SentimentResult> => {
  let responseText: string = '';
  try {
    const prompt = `
      Analyze the sentiment of the following text, acting as a high-precision '${model}' sentiment analysis model.
      Consider subtleties like sarcasm, mixed emotions, and context.
      
      Text: "${text}"
      
      Provide your analysis in a structured JSON format. 
      - The 'sentiment' must be strictly one of 'positive', 'negative', or 'neutral'.
      - The 'confidence' score must be a float between 0.0 and 1.0, representing your certainty.
      - The 'scores' object must contain positive, negative, and neutral scores, also between 0.0 and 1.0, that sum to 1.0.
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: sentimentSchema,
      },
    });

    responseText = response.text;
    const parsedResult = JSON.parse(responseText);

    // Post-parsing validation to ensure the structure is correct
    if (typeof parsedResult !== 'object' || parsedResult === null || !parsedResult.sentiment || typeof parsedResult.confidence !== 'number' || typeof parsedResult.scores !== 'object') {
        throw new InvalidFormatError('The AI model returned a response with a missing or invalid structure. Please try again.');
    }

    return { ...(parsedResult as Omit<SentimentResult, 'text'>), text };
  } catch (error) {
    handleGeminiError(error, 'sentiment analysis', responseText);
  }
};

export const analyzeAspects = async (text: string): Promise<AspectResult[]> => {
    let responseText: string = '';
    try {
      const prompt = `
        Perform a detailed aspect-based sentiment analysis on the following text.
        Your goal is to identify key aspects (specific features, topics, or entities) and determine the sentiment for each one individually.
        An aspect should be a concise noun or noun phrase.
  
        Text: "${text}"
  
        Return the result as a JSON array of objects. Each object must have:
        - 'aspect': The identified noun/noun phrase.
        - 'sentiment': The sentiment for that specific aspect ('positive', 'negative', or 'neutral').
        - 'confidence': A score from 0.0 to 1.0 for the aspect's sentiment.

        If no specific, tangible aspects are mentioned, return an empty array [].
      `;
  
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: aspectSchema,
        },
      });

      responseText = response.text;
      const parsedResult = JSON.parse(responseText);
      
      // Post-parsing validation to ensure the structure is correct
      if (!Array.isArray(parsedResult)) {
        throw new InvalidFormatError('The AI model was expected to return a list of aspects but provided a different format. Please try again.');
      }

      return parsedResult as AspectResult[];
    } catch (error) {
      handleGeminiError(error, 'aspect-based analysis', responseText);
    }
};


export const generateDetailedReport = async (statsData: StatisticsData): Promise<string> => {
    let responseText: string = '';
    try {
      const prompt = `
        Act as a professional data analyst. You have been given a dataset summarizing the results of a sentiment analysis project.
        Your task is to generate a comprehensive, well-structured report based on this data. The report should be easy to read and provide actionable insights.
        
        Use Markdown for formatting. Specifically:
        - Use '#' for the main title.
        - Use '##' for section headings.
        - Use '**' for bolding key terms or numbers.
        - Use bullet points ('-') for lists.

        Here is the data:
        ${JSON.stringify(statsData, null, 2)}

        Please structure your report with the following sections:
        1.  **# Sentiment Analysis Report**: A main title.
        2.  **## 1. Introduction & Overview**: Briefly introduce the report's purpose and summarize the total number of texts analyzed.
        3.  **## 2. Key Findings & Sentiment Distribution**: Provide a high-level summary of the findings. State the overall sentiment breakdown (positive, negative, neutral percentages) and the Net Sentiment Score.
        4.  **## 3. Detailed Analysis**: 
            - Elaborate on the sentiment distribution.
            - Discuss the average confidence score and what it implies about the clarity of sentiment in the texts.
            - Analyze the 'Sentiment Over Time' data. Point out any significant trends, peaks, or troughs in positive or negative sentiment.
        5.  **## 4. Conclusion & Recommendations**: Summarize the most critical insights. If possible, suggest potential actions or areas for further investigation based on the sentiment data.
      `;
  
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro', // Using a more powerful model for report generation
        contents: prompt,
      });

      responseText = response.text;
      return responseText;
    } catch (error) {
      handleGeminiError(error, 'detailed report generation', responseText);
    }
}