import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
    if (!content) return null;

    return (
        <div className={`text-gray-300 ${className}`}>
            <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                    // Headers
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-white mt-8 mb-4 border-b border-white/10 pb-2 flex items-center gap-2" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-bold text-purple-400 mt-6 mb-3 flex items-center gap-2" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-white/90 mt-5 mb-2" {...props} />,
                    h4: ({node, ...props}) => <h4 className="text-base font-semibold text-white/80 mt-4 mb-2 uppercase tracking-wide" {...props} />,
                    
                    // Text
                    p: ({node, ...props}) => <p className="leading-7 mb-4 text-gray-300" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold text-white bg-white/5 px-1 rounded" {...props} />,
                    em: ({node, ...props}) => <em className="text-gray-400 italic" {...props} />,
                    
                    // Lists
                    ul: ({node, ...props}) => <ul className="list-none space-y-2 my-4 pl-4" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal space-y-2 my-4 pl-8 text-gray-300" {...props} />,
                    li: ({node, ...props}) => (
                        <li className="relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-purple-500 before:font-bold">
                            <span {...props} />
                        </li>
                    ),
                    
                    // Tables - Card style
                    table: ({node, ...props}) => (
                        <div className="my-6 rounded-lg border border-white/10 overflow-hidden bg-white/[0.02]">
                            <table className="w-full text-sm text-left" {...props} />
                        </div>
                    ),
                    thead: ({node, ...props}) => <thead className="bg-white/5 text-xs uppercase text-gray-400 font-medium" {...props} />,
                    tbody: ({node, ...props}) => <tbody className="divide-y divide-white/5" {...props} />,
                    tr: ({node, ...props}) => <tr className="hover:bg-white/[0.02] transition-colors" {...props} />,
                    th: ({node, ...props}) => <th className="px-4 py-3 font-medium text-white" {...props} />,
                    td: ({node, ...props}) => <td className="px-4 py-3 text-gray-300 border-r border-white/5 last:border-r-0" {...props} />,
                    
                    // Misc
                    hr: ({node, ...props}) => <hr className="my-8 border-white/10" {...props} />,
                    blockquote: ({node, ...props}) => (
                        <blockquote className="border-l-4 border-purple-500/50 bg-white/[0.03] px-4 py-3 my-4 rounded-r italic text-gray-300">
                            {props.children}
                        </blockquote>
                    ),
                    code: ({node, ...props}) => <code className="bg-black/30 rounded px-1.5 py-0.5 font-mono text-sm text-purple-300" {...props} />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
