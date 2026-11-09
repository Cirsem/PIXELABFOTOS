import React from 'react';
import { Home, FolderOpen, Sliders, Sparkles, Download } from 'lucide-react';
import { ScreenId } from '../types/editor';

interface BottomNavBarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentScreen, onNavigate }) => {
  const tabs = [
    { id: 'home' as ScreenId, label: 'Inicio', icon: Home },
    { id: 'gallery' as ScreenId, label: 'Proyectos', icon: FolderOpen },
    { id: 'editor' as ScreenId, label: 'Editor', icon: Sliders },
    { id: 'ai' as ScreenId, label: 'Pixelab AI', icon: Sparkles, isAi: true },
    { id: 'export' as ScreenId, label: 'Exportar', icon: Download },
  ];

  return (
    <nav
      className="w-full bg-[#16161B]/95 backdrop-blur-md border-t border-[#25252D] px-3 py-1.5 flex items-center justify-around z-30 select-none shrink-0"
      data-purpose="bottom-navigation"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentScreen === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`flex flex-col items-center group cursor-pointer transition-all py-1 px-2 rounded-xl ${
              isActive
                ? 'text-[#A78BFA]'
                : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
            }`}
            type="button"
          >
            <div
              className={`px-3.5 py-1 rounded-full flex items-center justify-center transition-all ${
                isActive
                  ? tab.isAi
                    ? 'bg-[#8B5CF6]/30 text-[#A78BFA] shadow-[0_0_12px_rgba(139,92,246,0.5)]'
                    : 'bg-[#8B5CF6]/20 text-[#A78BFA]'
                  : 'text-[#9CA3AF]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
            </div>
            <span
              className={`text-[10px] tracking-tight mt-0.5 ${
                isActive ? 'font-semibold text-[#A78BFA]' : 'font-medium text-[#9CA3AF]'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
