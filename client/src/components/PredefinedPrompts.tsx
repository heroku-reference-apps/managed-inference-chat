import React from 'react';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import type { PredefinedPrompt } from '@/types/chat';

interface PredefinedPromptsProps {
  prompts: PredefinedPrompt[];
  onPromptSelect: (prompt: PredefinedPrompt) => void;
  disabled?: boolean;
}

export const PredefinedPrompts: React.FC<PredefinedPromptsProps> = ({
  prompts,
  onPromptSelect,
  disabled = false,
}) => {
  return (
    <div className='w-full max-w-4xl mx-auto px-4'>
      <div className='text-center mb-8'>
        <h2 className='text-2xl font-semibold text-gray-800 mb-2'>
          Chat with Heroku Managed Inference
        </h2>
        <p className='text-gray-500'>Here are some examples to get started with chat mode</p>
      </div>

      <div className='space-y-4'>
        {prompts.map(prompt => (
          <button
            key={prompt.id}
            onClick={() => onPromptSelect(prompt)}
            disabled={disabled}
            className='w-full p-4 text-left rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <div className='flex items-center gap-3'>
              <ChatBubbleLeftIcon className='h-5 w-5 text-gray-400 flex-shrink-0' />
              <span className='text-gray-700 font-medium'>{prompt.title}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
