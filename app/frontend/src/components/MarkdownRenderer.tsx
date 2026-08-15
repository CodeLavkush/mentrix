import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  // Simple, safe markdown parser that handles code blocks, bold, italics, lists, headings, and quotes
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockLang = '';
    let codeBlockLines: string[] = [];

    const formatInline = (str: string): React.ReactNode[] => {
      // Process inline code `...`, bold **...**, italics *...*
      const parts: React.ReactNode[] = [];
      const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|https?:\/\/[^\s]+)/g;
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(str)) !== null) {
        if (match.index > lastIndex) {
          parts.push(str.slice(lastIndex, match.index));
        }
        const m = match[0];
        if (m.startsWith('`') && m.endsWith('`')) {
          parts.push(
            <code
              key={match.index}
              className="bg-slate-100 dark:bg-slate-800/90 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded font-mono text-[11px] border border-slate-200 dark:border-slate-700/60 font-semibold"
            >
              {m.slice(1, -1)}
            </code>
          );
        } else if (m.startsWith('**') && m.endsWith('**')) {
          parts.push(
            <strong key={match.index} className="text-slate-900 dark:text-white font-bold">
              {m.slice(2, -2)}
            </strong>
          );
        } else if (m.startsWith('*') && m.endsWith('*')) {
          parts.push(
            <em key={match.index} className="text-slate-700 dark:text-slate-200 italic">
              {m.slice(1, -1)}
            </em>
          );
        } else if (m.startsWith('http')) {
          parts.push(
            <a
              key={match.index}
              href={m}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:underline break-all font-medium"
            >
              {m}
            </a>
          );
        }
        lastIndex = match.index + m.length;
      }

      if (lastIndex < str.length) {
        parts.push(str.slice(lastIndex));
      }
      return parts.length > 0 ? parts : [str];
    };

    lines.forEach((line, index) => {
      // Check code block fence
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // Close code block
          const codeString = codeBlockLines.join('\n');
          elements.push(
            <CodeBlock key={`code-${index}`} code={codeString} language={codeBlockLang} />
          );
          codeBlockLines = [];
          inCodeBlock = false;
          codeBlockLang = '';
        } else {
          // Open code block
          inCodeBlock = true;
          codeBlockLang = line.trim().slice(3).trim();
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockLines.push(line);
        return;
      }

      const trimmed = line.trim();

      // Heading 1
      if (trimmed.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-lg font-bold font-outfit text-slate-900 dark:text-white mt-3 mb-1.5 border-b border-slate-200 dark:border-slate-800 pb-1">
            {formatInline(trimmed.slice(2))}
          </h1>
        );
      }
      // Heading 2
      else if (trimmed.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-base font-bold font-outfit text-indigo-600 dark:text-indigo-300 mt-2.5 mb-1">
            {formatInline(trimmed.slice(3))}
          </h2>
        );
      }
      // Heading 3
      else if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-sm font-semibold font-outfit text-indigo-700 dark:text-indigo-200 mt-2 mb-1">
            {formatInline(trimmed.slice(4))}
          </h3>
        );
      }
      // Blockquote
      else if (trimmed.startsWith('> ')) {
        elements.push(
          <blockquote
            key={index}
            className="border-l-2 border-indigo-500 pl-3 my-1.5 text-slate-700 dark:text-slate-300 italic bg-indigo-50/50 dark:bg-indigo-500/5 py-1 rounded-r"
          >
            {formatInline(trimmed.slice(2))}
          </blockquote>
        );
      }
      // Bullet list
      else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        elements.push(
          <div key={index} className="flex items-start space-x-2 my-0.5 ml-2">
            <span className="text-indigo-500 dark:text-indigo-400 font-bold text-xs mt-0.5">•</span>
            <span className="flex-1 text-slate-800 dark:text-slate-200">{formatInline(trimmed.slice(2))}</span>
          </div>
        );
      }
      // Numbered list
      else if (/^\d+\.\s/.test(trimmed)) {
        const num = trimmed.match(/^\d+\./)?.[0] || '1.';
        const rest = trimmed.replace(/^\d+\.\s*/, '');
        elements.push(
          <div key={index} className="flex items-start space-x-2 my-0.5 ml-2">
            <span className="text-indigo-500 dark:text-indigo-400 font-mono text-[11px] mt-0.5 font-bold">{num}</span>
            <span className="flex-1 text-slate-800 dark:text-slate-200">{formatInline(rest)}</span>
          </div>
        );
      }
      // Empty line
      else if (!trimmed) {
        elements.push(<div key={index} className="h-2" />);
      }
      // Normal paragraph line
      else {
        elements.push(
          <p key={index} className="my-1 leading-relaxed text-slate-800 dark:text-slate-200">
            {formatInline(line)}
          </p>
        );
      }
    });

    if (inCodeBlock && codeBlockLines.length > 0) {
      elements.push(
        <CodeBlock key="code-final" code={codeBlockLines.join('\n')} language={codeBlockLang} />
      );
    }

    return elements;
  };

  return <div className={`space-y-0.5 font-inter text-xs ${className}`}>{renderFormattedText(content)}</div>;
};

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-xs shadow-md">
      <div className="bg-slate-100 dark:bg-slate-900/90 px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400">
        <span className="font-semibold uppercase tracking-wider">{language || 'Code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
              <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-slate-900 dark:text-slate-200 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default MarkdownRenderer;
