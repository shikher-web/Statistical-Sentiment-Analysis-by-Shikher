import React, { useState, useRef, useCallback } from 'react';
import { analyzeText } from '../services/geminiService';
import { SentimentResult, AVAILABLE_MODELS } from '../types';
import { Loader } from './Loader';
import { ArrowUpTrayIcon, ArrowDownTrayIcon, ExclamationTriangleIcon } from './IconComponents';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const CHART_COLORS = { positive: '#4ade80', negative: '#f87171', neutral: '#facc15' };

export const BatchAnalysisView: React.FC = () => {
    const [texts, setTexts] = useState<string[]>([]);
    const [results, setResults] = useState<SentimentResult[]>([]);
    const [model, setModel] = useState<string>(AVAILABLE_MODELS[0]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
                setTexts(lines);
                setResults([]);
                setError(null);
            };
            reader.readAsText(file);
        }
    };
    
    const triggerFileSelect = () => fileInputRef.current?.click();

    const handleAnalyzeBatch = useCallback(async () => {
        if (texts.length === 0) {
            setError('Please upload a file with texts to analyze.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResults([]);
        setProgress(0);

        const newResults: SentimentResult[] = [];
        const errors: { text: string, message: string }[] = [];

        for (let i = 0; i < texts.length; i++) {
            try {
                const result = await analyzeText(texts[i], model);
                newResults.push(result);
            } catch (err) {
                 const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
                 errors.push({ text: texts[i], message: errorMessage });
                 newResults.push({ text: texts[i], sentiment: 'error', confidence: 0, scores: { positive: 0, negative: 0, neutral: 0 }, error: errorMessage });
                 console.error(`Failed to process: "${texts[i]}"`, err);
            }
            setResults([...newResults]); // Update results incrementally for responsive UI
            setProgress(((i + 1) / texts.length) * 100);
        }

        if (errors.length > 0) {
            setError(`${errors.length} out of ${texts.length} texts failed to analyze. See the results table for details.`);
        }

        setIsLoading(false);
    }, [texts, model]);
    
    const downloadResults = () => {
        const header = "text,sentiment,confidence,positive_score,negative_score,neutral_score,error\n";
        const csv = results.map(r => 
            `"${r.text.replace(/"/g, '""')}",${r.sentiment},${r.confidence},${r.scores.positive},${r.scores.negative},${r.scores.neutral},"${r.error ? r.error.replace(/"/g, '""') : ''}"`
        ).join('\n');
        const blob = new Blob([header + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = "sentiment_analysis_results.csv";
        link.click();
    };

    const validResults = results.filter(r => r.sentiment !== 'error');
    const sentimentCounts = validResults.reduce((acc, r) => {
        acc[r.sentiment] = (acc[r.sentiment] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const pieData = Object.keys(sentimentCounts).map(key => ({ name: key, value: sentimentCounts[key] }));

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-gray-900 border border-gray-600 rounded-md p-4 flex flex-col items-center justify-center text-center">
                    <ArrowUpTrayIcon className="w-10 h-10 text-gray-500 mb-2" />
                    <button onClick={triggerFileSelect} className="text-indigo-400 font-semibold hover:underline">
                        {fileName ? `File: ${fileName} (${texts.length} texts)` : 'Upload a .txt or .csv file'}
                    </button>
                    <p className="text-xs text-gray-500 mt-1">One text per line.</p>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".txt,.csv" className="hidden" />
                </div>
                <div className="bg-gray-900 border border-gray-600 rounded-md p-4">
                     <label htmlFor="batch-model-select" className="block text-sm font-medium text-gray-300 mb-2">
                        Analysis Model
                    </label>
                    <select
                        id="batch-model-select"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 rounded-md p-2.5 text-gray-200 focus:ring-2 focus:ring-indigo-500"
                    >
                        {AVAILABLE_MODELS.map((m) => (
                        <option key={m} value={m}>
                            {m}
                        </option>
                        ))}
                    </select>
                </div>
            </div>

            <button
                onClick={handleAnalyzeBatch}
                disabled={isLoading || texts.length === 0}
                className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-md hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition"
            >
                {isLoading ? `Processing... ${Math.round(progress)}%` : `Analyze ${texts.length} Texts`}
            </button>
            
            {isLoading && (
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            )}
            
            {error && (
                <div className="bg-red-900/30 border border-red-500/50 text-red-300 p-4 rounded-lg flex items-start space-x-3 animate-fade-in">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-bold">Batch Analysis Issue</h4>
                    <p className="text-sm mt-1">{error}</p>
                </div>
                </div>
            )}

            {results.length > 0 && !isLoading && (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                           <h3 className="text-lg font-semibold text-white mb-4">Sentiment Distribution</h3>
                           <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CHART_COLORS[entry.name.toLowerCase() as keyof typeof CHART_COLORS]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                           </div>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                           <h3 className="text-lg font-semibold text-white mb-4">Confidence Score Distribution</h3>
                            <div className="h-64">
                               <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={validResults}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                                        <XAxis dataKey="text" tickFormatter={(value) => value.substring(0, 10) + '...'} stroke="#9ca3af" />
                                        <YAxis stroke="#9ca3af" domain={[0, 1]}/>
                                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} />
                                        <Bar dataKey="confidence" fill="#818cf8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                           <h3 className="text-lg font-semibold text-white">Analysis Results</h3>
                           <button onClick={downloadResults} className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-3 rounded-md transition">
                               <ArrowDownTrayIcon className="w-4 h-4" />
                               Download CSV
                           </button>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            <table className="w-full text-sm text-left text-gray-300">
                                <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Text</th>
                                        <th scope="col" className="px-6 py-3">Sentiment</th>
                                        <th scope="col" className="px-6 py-3">Confidence / Error</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map((result, index) => (
                                        <tr key={index} className={`border-b border-gray-700 ${result.sentiment === 'error' ? 'bg-red-900/20' : 'hover:bg-gray-700/50'}`}>
                                            <td className="px-6 py-4 truncate max-w-sm">{result.text}</td>
                                            <td className="px-6 py-4 capitalize">
                                                <span className={`font-semibold ${result.sentiment === 'error' ? 'text-red-400' : ''}`}>{result.sentiment}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {result.sentiment === 'error' ? (
                                                    <span className="text-red-400 text-xs" title={result.error}>{result.error}</span>
                                                ) : (
                                                    `${(result.confidence * 100).toFixed(1)}%`
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
