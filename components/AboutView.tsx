import React, { useState } from 'react';
import { generateShareablePost } from '../services/geminiService';
import { Loader } from './Loader';
import { AcademicCapIcon, ClipboardDocumentIcon, CodeBracketIcon, CpuChipIcon, ExclamationTriangleIcon, SparklesIcon } from './IconComponents';

// Feature Card component
const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 transition-all duration-300 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10">
        <div className="flex items-center gap-4 mb-3">
            <div className="bg-gray-900 p-2 rounded-full">{icon}</div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <p className="text-gray-400 text-sm">{description}</p>
    </div>
);


// Section component
const InfoSection: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <section className="space-y-6">
        <div className="flex items-center gap-3">
            <div className="text-indigo-400">{icon}</div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        <div>{children}</div>
    </section>
);


export const AboutView: React.FC = () => {
    const [post, setPost] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<boolean>(false);

    const handleGeneratePost = async () => {
        setIsLoading(true);
        setError(null);
        setPost('');
        try {
            const result = await generateShareablePost();
            setPost(result);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyToClipboard = () => {
        if (!post) return;
        navigator.clipboard.writeText(post);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    const features = [
        { icon: <SparklesIcon className="w-6 h-6 text-yellow-400" />, title: "Single & Batch Analysis", description: "Analyze individual texts or upload files for bulk processing with detailed results and visualizations." },
        { icon: <SparklesIcon className="w-6 h-6 text-yellow-400" />, title: "Aspect-Based Sentiment", description: "Go beyond overall sentiment to identify and analyze sentiment towards specific topics within the text." },
        { icon: <SparklesIcon className="w-6 h-6 text-yellow-400" />, title: "Statistical Dashboard", description: "Visualize sentiment trends and distributions with an interactive dashboard and beautiful charts." },
        { icon: <SparklesIcon className="w-6 h-6 text-yellow-400" />, title: "AI-Powered Reporting", description: "Automatically generate comprehensive, human-readable reports from your data using Gemini Pro." },
    ];
    
    const techStack = ["React", "TypeScript", "Tailwind CSS", "Gemini API", "Recharts", "jsPDF"];

    return (
        <div className="space-y-12 animate-fade-in text-gray-300">
            {/* Header */}
            <header className="text-center">
                <h1 className="text-3xl font-bold text-white">About The Application</h1>
                <p className="mt-2 text-md text-gray-400 max-w-3xl mx-auto">
                    This is an advanced tool for sentiment analysis, providing detailed scores, aspect-based insights, and statistical validation, all powered by the Gemini API.
                </p>
            </header>

            {/* Key Features */}
            <InfoSection icon={<SparklesIcon className="w-8 h-8"/>} title="Key Features">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {features.map(f => <FeatureCard key={f.title} {...f} />)}
                </div>
            </InfoSection>

            {/* Technology Stack */}
            <InfoSection icon={<CpuChipIcon className="w-8 h-8"/>} title="Technology Stack">
                <div className="flex flex-wrap gap-3">
                    {techStack.map(tech => (
                        <span key={tech} className="bg-gray-700/50 border border-gray-600 text-gray-300 text-sm font-medium px-4 py-2 rounded-full">
                            {tech}
                        </span>
                    ))}
                </div>
            </InfoSection>
            
            {/* About the Innovator */}
            <InfoSection icon={<AcademicCapIcon className="w-8 h-8"/>} title="About the Innovator">
                 <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex items-center gap-6">
                    <CodeBracketIcon className="w-12 h-12 text-indigo-400 flex-shrink-0" />
                    <div>
                        <h3 className="text-xl font-bold text-white">Shikher</h3>
                        <p className="text-gray-400 mt-1">This application, its algorithms, and methodologies were innovated and designed by Shikher for advanced AI-powered analytics.</p>
                    </div>
                 </div>
            </InfoSection>

            {/* Share this Project */}
            <InfoSection icon={<ClipboardDocumentIcon className="w-8 h-8" />} title="Share this Project">
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <p className="mb-4 text-gray-400">
                        Generate a professional LinkedIn post to share this project with your network.
                    </p>
                    <button
                        onClick={handleGeneratePost}
                        disabled={isLoading}
                        className="w-full sm:w-auto bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition"
                    >
                        {isLoading ? 'Drafting Post...' : 'Draft a LinkedIn Post'}
                    </button>
                    
                    {isLoading && <div className="flex justify-center p-8"><Loader text="Generating post..."/></div>}

                    {error && (
                         <div className="mt-4 bg-red-900/30 border border-red-500/50 text-red-300 p-4 rounded-lg flex items-start space-x-3">
                            <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold">Generation Failed</h4>
                                <p className="text-sm mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    {post && (
                        <div className="mt-6 space-y-4">
                            <textarea
                                readOnly
                                value={post}
                                rows={10}
                                className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                                onClick={handleCopyToClipboard}
                                className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition"
                            >
                                {copied ? 'Copied!' : 'Copy to Clipboard'}
                            </button>
                        </div>
                    )}
                </div>
            </InfoSection>

        </div>
    );
};
