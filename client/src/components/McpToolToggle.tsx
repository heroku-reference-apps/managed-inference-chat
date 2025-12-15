import React, { useState } from 'react';
import clsx from 'clsx';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { McpIcon } from '@/components/icons/McpIcon';
import type { MCPTool } from '@/types/chat';

const MAX_CALLS_OPTIONS = [1, 3, 5, 10];
const DEFAULT_MAX_CALLS = 3;

interface McpToolToggleProps {
  tool: MCPTool;
  isSelected: boolean;
  maxCalls: number;
  onToggle: () => void;
  onMaxCallsChange: (maxCalls: number) => void;
  disabled: boolean;
}

export const McpToolToggle: React.FC<McpToolToggleProps> = ({
  tool,
  isSelected,
  maxCalls,
  onToggle,
  onMaxCallsChange,
  disabled,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showMaxCallsDropdown, setShowMaxCallsDropdown] = useState(false);
  const [showDropdownTooltip, setShowDropdownTooltip] = useState(false);

  return (
    <div className='relative inline-flex items-center gap-0.5'>
      <button
        type='button'
        onClick={onToggle}
        disabled={disabled}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={clsx(
          'flex items-center gap-1.5 px-2 py-1 text-xs font-medium transition-colors',
          'border hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-heroku-purple-30',
          isSelected
            ? 'border-heroku-purple-30 bg-heroku-purple-95 text-heroku-purple-30'
            : 'border-gray-300 text-gray-700',
          isSelected ? 'rounded-l-md border-r-0' : 'rounded-md',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <McpIcon className='h-3.5 w-3.5' />
        {tool.name}
      </button>

      {/* Settings button - only shown when selected */}
      {isSelected && !showMaxCallsDropdown && (
        <button
          type='button'
          onClick={() => setShowMaxCallsDropdown(true)}
          disabled={disabled}
          className={clsx(
            'px-1.5 py-1 rounded-r-md border focus:outline-none focus:ring-2 focus:ring-heroku-purple-30',
            'border-heroku-purple-30 bg-heroku-purple-95 text-heroku-purple-30 hover:bg-heroku-purple-90',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          title='Configure max calls'
        >
          <Cog6ToothIcon className='h-3.5 w-3.5' />
        </button>
      )}

      {/* Max calls selector - shown after clicking settings */}
      {isSelected && showMaxCallsDropdown && (
        <div
          className='relative'
          onMouseEnter={() => setShowDropdownTooltip(true)}
          onMouseLeave={() => setShowDropdownTooltip(false)}
        >
          <select
            value={maxCalls}
            onChange={e => onMaxCallsChange(Number(e.target.value))}
            disabled={disabled}
            className={clsx(
              'text-xs py-1 pl-1 pr-5 rounded-r-md border focus:outline-none focus:ring-2 focus:ring-heroku-purple-30',
              'border-heroku-purple-30 bg-heroku-purple-95 text-heroku-purple-30',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {MAX_CALLS_OPTIONS.map(n => (
              <option key={n} value={n}>
                {n}x
              </option>
            ))}
          </select>
          {/* Dropdown tooltip */}
          {showDropdownTooltip && (
            <div
              className={clsx(
                'absolute z-20 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg',
                'whitespace-nowrap bottom-full left-1/2 -translate-x-1/2 mb-1'
              )}
            >
              Max tool calls per request
              <div
                className={clsx(
                  'absolute top-full left-1/2 -translate-x-1/2',
                  'border-4 border-transparent border-t-gray-800'
                )}
              />
            </div>
          )}
        </div>
      )}

      {/* Tooltip showing server namespace */}
      {showTooltip && (
        <div
          className={clsx(
            'absolute z-10 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg',
            'whitespace-nowrap bottom-full left-1/2 -translate-x-1/2 mb-1'
          )}
        >
          <div className='font-medium'>Exposed by: {tool.serverNamespace}</div>
          {tool.description && (
            <div className='text-gray-300 mt-0.5 max-w-48 whitespace-normal'>
              {tool.description}
            </div>
          )}
          {/* Tooltip arrow */}
          <div
            className={clsx(
              'absolute top-full left-1/2 -translate-x-1/2',
              'border-4 border-transparent border-t-gray-800'
            )}
          />
        </div>
      )}
    </div>
  );
};

export { DEFAULT_MAX_CALLS, MAX_CALLS_OPTIONS };
