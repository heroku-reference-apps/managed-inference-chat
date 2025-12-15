import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { RiToolsFill } from 'react-icons/ri';
import { markdownComponents } from '@/constants/markdownComponents';

interface ToolCall {
  id: string;
  function: {
    name: string;
    arguments: string;
  };
  result?: string;
}

const inferLanguageFromTool = (tool: ToolCall) => {
  try {
    // If no file extension, try to infer from tool name
    const toolName = tool.function.name.toLowerCase();
    if (toolName.includes('python')) return 'python';
    if (toolName.includes('node')) return 'javascript';
    if (toolName.includes('ruby')) return 'ruby';
    if (toolName.includes('go')) return 'go';

    return 'text';
  } catch (_e) {
    return 'text';
  }
};

interface CollapsibleToolExecutionProps {
  toolCalls: ToolCall[];
  expanded?: boolean;
}

export const CollapsibleToolExecution: React.FC<CollapsibleToolExecutionProps> = ({
  toolCalls,
  expanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  return (
    <div className='my-3'>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors'
      >
        {isExpanded ? (
          <ChevronDownIcon className='w-4 h-4' />
        ) : (
          <ChevronRightIcon className='w-4 h-4' />
        )}
        <RiToolsFill className='w-4 h-4' /> Tool Execution
      </button>
      {isExpanded && (
        <div className='mt-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg border border-gray-100 dark:border-slate-600'>
          {toolCalls.map((tool, index) => {
            let args;
            try {
              args = JSON.parse(tool.function.arguments);
            } catch (_e) {
              args = tool.function.arguments;
            }

            // Extract code from arguments if present
            const codeContent = typeof args === 'object' && args.code ? args.code : null;
            const otherArgs =
              typeof args === 'object' && args.code ? { ...args, code: '[shown below]' } : args;

            return (
              <div
                key={tool.id}
                className={
                  index > 0 ? 'mt-4 pt-4 border-t border-gray-200 dark:border-slate-600' : ''
                }
              >
                <div className='font-medium text-gray-700 dark:text-gray-200 mb-2'>
                  {tool.function.name}
                </div>
                <div className='bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-600'>
                  <pre className='p-3 overflow-x-auto whitespace-pre text-sm'>
                    <code className='dark:text-gray-300'>
                      {typeof otherArgs === 'string'
                        ? otherArgs
                        : JSON.stringify(otherArgs, null, 2)}
                    </code>
                  </pre>
                </div>
                {codeContent && (
                  <div className='mt-3'>
                    <div className='font-medium text-gray-700 dark:text-gray-200 mb-2'>Code:</div>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={markdownComponents}
                    >
                      {`\`\`\`${inferLanguageFromTool(tool)}\n${codeContent}\n\`\`\``}
                    </ReactMarkdown>
                  </div>
                )}
                {tool.result && (
                  <div className='mt-3'>
                    <div className='font-medium text-gray-700 dark:text-gray-200 mb-2'>Result:</div>
                    <div className='bg-green-50 dark:bg-green-900/30 rounded border border-green-200 dark:border-green-800'>
                      <pre className='p-3 overflow-x-auto whitespace-pre-wrap text-sm text-green-800 dark:text-green-300'>
                        <code>{tool.result}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
