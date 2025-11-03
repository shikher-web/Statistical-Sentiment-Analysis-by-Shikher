import React, { useState } from 'react';
import { SingleAnalysisView } from './components/SingleAnalysisView';
import { BatchAnalysisView } from './components/BatchAnalysisView';
import { StatisticsView } from './components/StatisticsView';
import { HistoryView } from './components/HistoryView';
import { AboutView } from './components/AboutView';
import { ChartPieIcon, DocumentTextIcon, ClockIcon, TableCellsIcon, CodeBracketIcon, InformationCircleIcon } from './components/IconComponents';

type Tab = 'single' | 'batch' | 'statistics' | 'history' | 'about';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('single');

  const renderContent = () => {
    switch (activeTab) {
      case 'single':
        return <SingleAnalysisView />;
      case 'batch':
        return <BatchAnalysisView />;
      case 'statistics':
        return <StatisticsView />;
      case 'history':
        return <HistoryView />;
      case 'about':
        return <AboutView />;
      default:
        return <SingleAnalysisView />;
    }
  };

  const TabButton = ({ tab, label, icon }: { tab: Tab; label: string; icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 ${
        activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <header className="text-center mb-8">
            <div className="flex justify-center items-center gap-2">
                <CodeBracketIcon className="w-10 h-10 text-indigo-400" />
                <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
                    Statistical Sentiment Analysis by Shikher
                </h1>
            </div>
          <p className="mt-2 text-md text-gray-400">
            Innovated and Designed by Shikher for advanced AI-powered analytics.
          </p>
        </header>

        <main className="bg-gray-800/50 rounded-xl shadow-2xl backdrop-blur-lg border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <nav className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
              <TabButton tab="single" label="Single Analysis" icon={<DocumentTextIcon className="w-5 h-5" />} />
              <TabButton tab="batch" label="Batch Analysis" icon={<TableCellsIcon className="w-5 h-5" />} />
              <TabButton tab="statistics" label="Statistics" icon={<ChartPieIcon className="w-5 h-5" />} />
              <TabButton tab="history" label="History" icon={<ClockIcon className="w-5 h-5" />} />
              <TabButton tab="about" label="About & Share" icon={<InformationCircleIcon className="w-5 h-5" />} />
            </nav>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            {renderContent()}
          </div>
        </main>
        <footer className="text-center mt-8 text-gray-500 text-sm space-y-3">
            <p>Powered by Gemini API.</p>
            <p className="text-xs text-red-400/80 font-semibold p-2 border border-red-500/30 bg-red-900/20 rounded-md max-w-2xl mx-auto">
              Warning: This software, its algorithms, and methodologies are the intellectual property of Shikher and are protected by patent and copyright laws. Unauthorized reproduction, distribution, or use is strictly prohibited.
            </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
