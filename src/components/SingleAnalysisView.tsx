import React, { useState } from 'react';
import { analyzeText, analyzeAspects } from '../services/geminiService';
import { SentimentResult, AspectResult, AVAILABLE_MODELS } from '../types';
import { Loader } from './Loader';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ExclamationTriangleIcon } from './IconComponents';

const sentimentEmoji: { [key: string]: string } = {
  positive: '😊',
  negative: '😞',
  neutral: '😐',
};

const sentimentColor: { [key: string]: string } = {
  positive: 'text-green-400',
  negative: 'text-red-400',
  neutral: 'text-yellow-400',
};

const sentimentBg: { [key: string]: string } = {
  positive: 'bg-green-500/10',
  negative: 'bg-red-500/10',
  neutral: 'bg-yellow-500/10',
};

const CHART_COLORS = { positive: '#4ade80', negative: '#f87171', neutral: '#facc15' };

export const SingleAnalysisView: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [model, setModel] = useState<string>(AVAILABLE_MODELS[0]);
  const [sentimentResult, setSentimentResult] = useState<SentimentResult | null>(null);
  const [aspectResults, setAspectResults] = useState<AspectResult[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSentimentResult(null);
    setAspectResults(null);

    try {
      const [sentiment, aspects] = await Promise.all([
        analyzeText(text, model),
        analyzeAspects(text)
      ]);
      setSentimentResult(sentiment);
      setAspectResults(aspects);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = sentimentResult ? [
    { name: 'Positive', value: sentimentResult.scores.positive },
    { name: 'Negative', value: sentimentResult.scores.negative },
    { name: 'Neutral', value: sentimentResult.scores.neutral },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="text-input" className="block text-sm font-medium text-gray-300 mb-1">
          Text to Analyze
        </label>
        <textarea
          id="text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text here..."
          rows={6}
          className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        />
        <p className="text-xs text-gray-500 mt-1">Max 5000 characters.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-full sm:w-1/2">
            <label htmlFor="model-select" className="block text-sm font-medium text-gray-300 mb-1">
                Analysis Model
            </label>
            <select
                id="model-select"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            >
                {AVAILABLE_MODELS.map((m) => (
                <option key={m} value={m}>
                    {m}
                </option>
                ))}
            </select>
        </div>
        <div className="w-full sm:w-1/2 flex items-end h-full">
            <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full h-[50px] bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition flex items-center justify-center"
            >
            {isLoading ? 'Analyzing...' : 'Analyze Sentiment'}
            </button>
        </div>
      </div>
      
      {isLoading && <div className="flex justify-center p-8"><Loader /></div>}
      
      {error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-300 p-4 rounded-lg flex items-start space-x-3 animate-fade-in">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Analysis Failed</h4>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}
      
      {sentimentResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 animate-fade-in">
          {/* Overall Sentiment */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Overall Sentiment</h3>
            <div className="flex items-center space-x-4">
              <div className="text-6xl">{sentimentEmoji[sentimentResult.sentiment]}</div>
              <div>
                <p className={`text-2xl font-bold capitalize ${sentimentColor[sentimentResult.sentiment]}`}>{sentimentResult.sentiment}</p>
                <p className="text-gray-400">Confidence: {(sentimentResult.confidence * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>
          {/* Score Distribution */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Score Distribution</h3>
            <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={30} outerRadius={60} fill="#8884d8" paddingAngle={5} dataKey="value">
                        {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[entry.name.toLowerCase() as keyof typeof CHART_COLORS]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563', borderRadius: '0.5rem' }}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
          </div>
          {/* Aspect-based Sentiment */}
          {aspectResults && (
             <div className="md:col-span-2 bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Aspect-Based Sentiment</h3>
                {aspectResults.length > 0 ? (
                    <div className="space-y-3">
                        {aspectResults.map((aspect, index) => (
                        <div key={index} className={`p-3 rounded-md flex justify-between items-center ${sentimentBg[aspect.sentiment]}`}>
                            <span className="font-medium text-gray-200">{aspect.aspect}</span>
                            <span className={`capitalize font-semibold ${sentimentColor[aspect.sentiment]}`}>
                            {aspect.sentiment} ({(aspect.confidence * 100).toFixed(0)}%)
                            </span>
                        </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400">No specific aspects detected in the text.</p>
                )}
             </div>
          )}
        </div>
      )}
    </div>
  );
};
