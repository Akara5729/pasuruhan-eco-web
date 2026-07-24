import React from 'react';
import BottomNav from './BottomNav';
import type { Tab } from '../../App';

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: Tab;
  onChangeTab: (tab: Tab) => void;
}

export default function AppLayout({ children, activeTab, onChangeTab }: AppLayoutProps) {
  return (
    <div className="flex flex-col h-screen max-h-[100dvh] w-full max-w-md mx-auto bg-eco-bg overflow-hidden relative sm:shadow-2xl sm:border sm:border-gray-200 sm:rounded-[2.5rem] sm:my-8 sm:h-[850px]">
      <main className="flex-1 overflow-hidden relative pb-20">
        {children}
      </main>
      <BottomNav activeTab={activeTab} onChange={onChangeTab} />
    </div>
  );
}
