import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { markdownComponents } from '@/constants/markdownComponents';

interface CollapsibleReasoningProps {
  thinking: string;
  expanded?: boolean;
}

export const CollapsibleReasoning: React.FC<CollapsibleReasoningProps> = ({
  thinking,
  expanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  return (
    <div className='mb-3'>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700'
      >
        {isExpanded ? (
          <ChevronDownIcon className='w-4 h-4' />
        ) : (
          <ChevronRightIcon className='w-4 h-4' />
        )}
        Reasoning
      </button>
      {isExpanded && (
        <div className='mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100'>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={markdownComponents}
          >
            {thinking}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};
