export interface SentimentScores {
  positive: number;
  negative: number;
  neutral: number;
}

export interface SentimentResult {
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'error';
  confidence: number;
  scores: SentimentScores;
  error?: string;
}

export interface AspectResult {
  aspect: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export interface AnalysisRecord extends SentimentResult {
  id: number;
  model_used: string;
  timestamp: string;
}

export interface StatisticsData {
    total_analyses: number;
    positive_count: number;
    negative_count: number;
    neutral_count: number;
    avg_confidence: number;
    sentiment_over_time: {
        date: string;
        positive: number;
        negative: number;
        neutral: number;
    }[];
}

export const AVAILABLE_MODELS = ['VADER', 'TextBlob', 'Naive Bayes', 'BERT', 'RoBERTa'];
