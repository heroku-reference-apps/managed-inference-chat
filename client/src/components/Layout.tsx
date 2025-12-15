import React from 'react';
import { Outlet } from 'react-router-dom';
import logo from '@/assets/mia-logo.png';
import { ThemeSwitcher } from './ThemeSwitcher';

const Layout: React.FC = () => {
  return (
    <div className='min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 transition-colors duration-300'>
      <header className='text-heroku-purple-30 dark:text-heroku-purple-70 h-12 fixed top-0 left-0 right-0 z-10 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-slate-700'>
        <div className='h-full flex items-center justify-between px-4'>
          <div className='flex items-center'>
            <img src={logo} alt='Heroku MIA' className='h-8 w-8 mr-2' />
            <h1 className='text-lg font-semibold'>Heroku Managed Inference and Agents</h1>
          </div>
          <ThemeSwitcher />
        </div>
      </header>

      <main className='flex-1 pt-12'>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
