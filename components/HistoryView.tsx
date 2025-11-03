
import React, { useState, useMemo } from 'react';
import { AnalysisRecord } from '../types';

// Mock data generation
const generateMockHistory = (): AnalysisRecord[] => {
    const history: AnalysisRecord[] = [];
    const sentiments: Array<'positive' | 'negative' | 'neutral'> = ['positive', 'negative', 'neutral'];
    const models = ['VADER', 'TextBlob', 'BERT'];
    const sampleTexts = [
        "The new phone is amazing, battery life is incredible!",
        "I'm very disappointed with the customer service.",
        "The product is okay, it does what it says on the box.",
        "Absolutely fantastic experience from start to finish.",
        "The shipping was delayed and the package arrived damaged.",
        "It's a decent movie, but not something I'd watch again.",
        "The software update completely broke the app for me.",
        "Best purchase I've made all year, highly recommend!",
        "The user interface is a bit confusing to navigate."
    ];

    for (let i = 0; i < 50; i++) {
        const sentiment = sentiments[i % 3];
        const text = sampleTexts[i % sampleTexts.length];
        history.push({
            id: 1000 + i,
            text: text,
            sentiment: sentiment,
            confidence: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
            scores: { positive: 0.8, negative: 0.1, neutral: 0.1 },
            model_used: models[i % 3],
            timestamp: new Date(Date.now() - i * 3600000).toISOString(),
        });
    }
    return history;
};


export const HistoryView: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const historyData = useMemo(() => generateMockHistory(), []);

    const filteredHistory = historyData.filter(record => 
        record.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.sentiment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.model_used.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const sentimentColor: { [key: string]: string } = {
        positive: 'bg-green-500/20 text-green-300',
        negative: 'bg-red-500/20 text-red-300',
        neutral: 'bg-yellow-500/20 text-yellow-300',
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-white">Analysis History</h2>
            
            <div>
                 <input
                    type="text"
                    placeholder="Search history..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-lg bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="max-h-[60vh] overflow-y-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3">Timestamp</th>
                                <th scope="col" className="px-6 py-3">Text</th>
                                <th scope="col" className="px-6 py-3">Sentiment</th>
                                <th scope="col" className="px-6 py-3">Model</th>
                                <th scope="col" className="px-6 py-3">Confidence</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistory.map((record) => (
                                <tr key={record.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(record.timestamp).toLocaleString()}</td>
                                    <td className="px-6 py-4 truncate max-w-md">{record.text}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${sentimentColor[record.sentiment]}`}>
                                            {record.sentiment}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{record.model_used}</td>
                                    <td className="px-6 py-4">{(record.confidence * 100).toFixed(1)}%</td>
                                </tr>
                            ))}
                             {filteredHistory.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-500">No records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
