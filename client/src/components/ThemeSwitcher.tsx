import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';

export const ThemeSwitcher: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type='button'
      onClick={toggleTheme}
      className='p-2 rounded-lg transition-colors duration-200 hover:bg-heroku-purple-20/20 dark:hover:bg-heroku-purple-80/20 focus:outline-none focus:ring-2 focus:ring-heroku-purple-30 dark:focus:ring-heroku-purple-60'
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <MoonIcon className='h-5 w-5 text-heroku-purple-20' />
      ) : (
        <SunIcon className='h-5 w-5 text-heroku-purple-80' />
      )}
    </button>
  );
};
