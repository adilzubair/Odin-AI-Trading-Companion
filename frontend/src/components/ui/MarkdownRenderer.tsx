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
        <div className={`prose prose-invert prose-sm max-w-none 
            prose-headings:font-bold prose-headings:text-white prose-headings:mb-3 prose-headings:mt-6
            prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
            prose-strong:text-white prose-strong:font-semibold
            prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
            prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
            prose-li:text-gray-300 prose-li:mb-1
            prose-table:w-full prose-table:my-6 prose-table:border-collapse prose-table:border prose-table:border-white/[0.1]
            prose-th:border prose-th:border-white/[0.1] prose-th:bg-white/[0.05] prose-th:p-3 prose-th:text-left prose-th:font-semibold prose-th:text-white
            prose-td:border prose-td:border-white/[0.1] prose-td:p-3 prose-td:text-gray-300
            prose-hr:border-white/[0.1] prose-hr:my-6
            prose-blockquote:border-l-4 prose-blockquote:border-purple-500/50 prose-blockquote:bg-white/[0.02] prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:italic
            ${className}`}
        >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
            </ReactMarkdown>
        </div>
    );
}
