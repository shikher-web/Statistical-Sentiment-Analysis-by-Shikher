import React, { useMemo, useState } from 'react';
import { StatisticsData } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { generateDetailedReport } from '../services/geminiService';
import { Loader } from './Loader';
import { ArrowDownTrayIcon, ExclamationTriangleIcon } from './IconComponents';

// Allows TypeScript to recognize the jsPDF global variable from the script tag
declare const jspdf: any;

// Mock data generation
const generateMockData = (): StatisticsData => {
    const data = {
        total_analyses: 1245,
        positive_count: 589,
        negative_count: 312,
        neutral_count: 344,
        avg_confidence: 0.89,
        sentiment_over_time: [] as any[],
    };

    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 29);
    for (let i = 0; i < 30; i++) {
        data.sentiment_over_time.push({
            date: currentDate.toISOString().split('T')[0],
            positive: Math.floor(Math.random() * 20) + 10,
            negative: Math.floor(Math.random() * 10) + 5,
            neutral: Math.floor(Math.random() * 10) + 8,
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return data;
};

const StatCard: React.FC<{ title: string; value: string; subtext?: string; }> = ({ title, value, subtext }) => (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h4 className="text-sm text-gray-400 font-medium">{title}</h4>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
        {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
    </div>
);

// A simple component to render the markdown-like report
const ReportRenderer: React.FC<{ content: string }> = ({ content }) => {
    const formattedContent = content
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 text-indigo-400">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3 text-white">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^- (.*$)/gim, '<li class="ml-5 list-disc">$1</li>');
  
    return <div className="prose prose-invert text-gray-300" dangerouslySetInnerHTML={{ __html: formattedContent }} />;
};


export const StatisticsView: React.FC = () => {
    const statsData = useMemo(() => generateMockData(), []);
    const [report, setReport] = useState<string | null>(null);
    const [isReportLoading, setIsReportLoading] = useState<boolean>(false);
    const [reportError, setReportError] = useState<string | null>(null);
    
    const netSentimentScore = ((statsData.positive_count - statsData.negative_count) / statsData.total_analyses * 100).toFixed(1);

    const handleGenerateReport = async () => {
        setIsReportLoading(true);
        setReportError(null);
        setReport(null);
        try {
            const generatedReport = await generateDetailedReport(statsData);
            setReport(generatedReport);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred.';
            setReportError(message);
        } finally {
            setIsReportLoading(false);
        }
    };

    const handleDownloadPdf = () => {
        if (!report) return;
        
        const { jsPDF } = jspdf;
        const doc = new jsPDF();
        
        // Remove markdown for clean text
        const cleanText = report
            .replace(/^# (.*$)/gim, '$1\n')
            .replace(/^## (.*$)/gim, '\n$1\n')
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/^- /gim, '  • ');

        const lines = doc.splitTextToSize(cleanText, 180); // 180 is page width minus margins
        doc.text(lines, 15, 15);
        doc.save('Sentiment_Analysis_Report.pdf');
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-white">Dashboard Statistics</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Analyses" value={statsData.total_analyses.toLocaleString()} />
                <StatCard title="Positive Sentiment" value={`${((statsData.positive_count / statsData.total_analyses) * 100).toFixed(1)}%`} subtext={`${statsData.positive_count.toLocaleString()} analyses`} />
                <StatCard title="Avg. Confidence" value={`${(statsData.avg_confidence * 100).toFixed(1)}%`} />
                <StatCard title="Net Sentiment Score" value={`${netSentimentScore}`} subtext="(Positive - Negative) / Total" />
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Sentiment Over Time (Last 30 Days)</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                         <AreaChart
                            data={statsData.sentiment_over_time}
                            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                        >
                            <defs>
                                <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                            <XAxis dataKey="date" tickFormatter={(dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} stroke="#9ca3af"/>
                            <YAxis stroke="#9ca3af"/>
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563', borderRadius: '0.5rem' }}/>
                            <Legend />
                            <Area type="monotone" dataKey="positive" stroke="#4ade80" fillOpacity={1} fill="url(#colorPositive)" />
                            <Area type="monotone" dataKey="negative" stroke="#f87171" fillOpacity={1} fill="url(#colorNegative)" />
                            <Area type="monotone" dataKey="neutral" stroke="#facc15" fillOpacity={0.1} fill="#facc15" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Report Section */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <h3 className="text-xl font-bold text-white">AI-Powered Detailed Report</h3>
                        <button
                            onClick={handleGenerateReport}
                            disabled={isReportLoading}
                            className="w-full sm:w-auto bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition"
                        >
                            {isReportLoading ? 'Generating...' : 'Generate Full Report'}
                        </button>
                    </div>
                </div>
                {isReportLoading && <div className="flex justify-center p-8"><Loader text="Generating Report..."/></div>}
                
                {reportError && (
                    <div className="m-6 bg-red-900/30 border border-red-500/50 text-red-300 p-4 rounded-lg flex items-start space-x-3">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold">Report Generation Failed</h4>
                            <p className="text-sm mt-1">{reportError}</p>
                        </div>
                    </div>
                )}
                
                {report && (
                    <div className="border-t border-gray-700 p-6">
                        <div className="flex justify-end mb-4">
                             <button onClick={handleDownloadPdf} className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-3 rounded-md transition">
                                <ArrowDownTrayIcon className="w-4 h-4" />
                                Download PDF
                            </button>
                        </div>
                        <div className="bg-gray-900/50 p-6 rounded-md border border-gray-600">
                            <ReportRenderer content={report} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};