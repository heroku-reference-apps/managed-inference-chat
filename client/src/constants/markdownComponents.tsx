import React from 'react';
import type { Components } from 'react-markdown';
import { CodeBlock } from '@/components/CodeBlock';

export const markdownComponents: Components = {
  code: CodeBlock,
  p: ({ children, ...props }: React.ComponentPropsWithoutRef<'p'>) => (
    <p className='mb-3 last:mb-0 text-gray-800' {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: React.ComponentPropsWithoutRef<'ul'>) => (
    <ul className='list-disc list-inside mb-3 text-gray-800' {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.ComponentPropsWithoutRef<'ol'>) => (
    <ol className='list-decimal list-inside mb-3 text-gray-800' {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.ComponentPropsWithoutRef<'li'>) => (
    <li className='mb-1 text-gray-800' {...props}>
      {children}
    </li>
  ),
  a: ({ href, children, ...props }: React.ComponentPropsWithoutRef<'a'>) => (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className='text-blue-600 hover:underline'
      {...props}
    >
      {children}
    </a>
  ),
  blockquote: ({ children, ...props }: React.ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote className='border-l-2 border-gray-300 pl-4 italic my-3 text-gray-700' {...props}>
      {children}
    </blockquote>
  ),
  h1: ({ children, ...props }: React.ComponentPropsWithoutRef<'h1'>) => (
    <h1 className='text-xl font-semibold mb-3 text-gray-900' {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: React.ComponentPropsWithoutRef<'h2'>) => (
    <h2 className='text-lg font-semibold mb-2 text-gray-900' {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.ComponentPropsWithoutRef<'h3'>) => (
    <h3 className='text-base font-semibold mb-2 text-gray-900' {...props}>
      {children}
    </h3>
  ),
  table: ({ children, ...props }: React.ComponentPropsWithoutRef<'table'>) => (
    <div className='my-4 overflow-x-auto'>
      <table className='min-w-full border-collapse text-sm' {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: React.ComponentPropsWithoutRef<'thead'>) => (
    <thead className='bg-gray-50' {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }: React.ComponentPropsWithoutRef<'tbody'>) => (
    <tbody className='bg-white divide-y divide-gray-100' {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }: React.ComponentPropsWithoutRef<'tr'>) => (
    <tr className='border-b border-gray-100 last:border-0' {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }: React.ComponentPropsWithoutRef<'th'>) => (
    <th
      className='px-4 py-3 text-left text-gray-700 font-semibold border-b border-gray-200'
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.ComponentPropsWithoutRef<'td'>) => (
    <td className='px-4 py-3 text-gray-800' {...props}>
      {children}
    </td>
  ),
};
