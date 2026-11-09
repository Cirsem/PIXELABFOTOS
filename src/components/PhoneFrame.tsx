import React, { useState, useEffect } from 'react';
import { Wifi, Signal, Battery, Smartphone, Maximize2, Code2, Download } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
  onOpenAndroidCode: () => void;
  onQuickDownloadZip: () => void;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  onOpenAndroidCode,
  onQuickDownloadZip,
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [timeString, setTimeString] = useState('9:30');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      setTimeString(`${h}:${m}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col items-center justify-center p-0 md:p-4 select-none relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-[#8B5CF6]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-[#6D28D9]/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Desktop Utility Control Bar */}
      <header className="w-full max-w-5xl px-4 py-2.5 mb-2 hidden md:flex items-center justify-between text-xs text-neutral-400 z-40 bg-[#16161C]/80 backdrop-blur-md rounded-2xl border border-white/5 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#A78BFA] via-[#8B5CF6] to-[#6D28D9] flex items-center justify-center shadow-md shadow-[#8B5CF6]/30">
            <span className="text-white text-xs font-bold">PX</span>
          </div>
          <div>
            <span className="font-semibold text-white tracking-wide">PIXELAB</span>
            <span className="text-neutral-500 ml-2">Android Studio Edition (Kotlin + Jetpack Compose)</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Quick ZIP Download */}
          <button
            onClick={onQuickDownloadZip}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 text-[#A78BFA] border border-[#8B5CF6]/30 transition-all font-medium active:scale-95 cursor-pointer"
            title="Descargar código fuente nativo de Android Studio (.zip)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Proyecto .ZIP</span>
          </button>

          {/* Android Code Explorer Button */}
          <button
            onClick={onOpenAndroidCode}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#1F1F26] hover:bg-[#282832] text-neutral-200 border border-white/10 transition-all font-medium active:scale-95 cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Ver Código Kotlin & Room</span>
          </button>

          {/* Frame Toggle */}
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#1F1F26] hover:bg-[#282832] text-neutral-300 border border-white/10 transition-all active:scale-95 cursor-pointer"
            title={isFullScreen ? 'Ver en Marco Móvil Android' : 'Ver en Pantalla Completa'}
          >
            {isFullScreen ? (
              <>
                <Smartphone className="w-3.5 h-3.5 text-neutral-300" />
                <span>Vista Móvil</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-neutral-300" />
                <span>Pantalla Completa</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Phone Frame Device Container */}
      <main
        className={`w-full transition-all duration-300 bg-[#121215] flex flex-col relative overflow-hidden ${
          isFullScreen
            ? 'max-w-4xl h-[92vh] rounded-3xl border border-white/10 shadow-2xl'
            : 'max-w-[412px] h-[100dvh] md:h-[892px] md:rounded-[44px] shadow-2xl border md:border-[6px] border-[#2A2A33] ring-1 ring-white/10'
        }`}
      >
        {/* Android Status Bar */}
        <div className="w-full px-6 pt-3 pb-1 flex justify-between items-center text-xs tracking-tight font-medium text-white/90 z-40 select-none shrink-0">
          <span className="text-[13px] font-semibold">{timeString}</span>

          {/* Camera Notch / Hole-punch simulator */}
          <div className="w-3.5 h-3.5 bg-black rounded-full border border-white/10 mx-auto hidden md:block opacity-60"></div>

          <div className="flex items-center space-x-2 text-white/90">
            <Wifi className="w-3.5 h-3.5" />
            <Signal className="w-3.5 h-3.5" />
            <div className="flex items-center space-x-1">
              <span className="text-[10px] font-mono opacity-80">98%</span>
              <Battery className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </div>

        {/* Android Gesture Navigation Bar Indicator */}
        <div className="w-full flex justify-center pb-2 pt-1 bg-[#16161B] z-40 shrink-0">
          <div className="w-32 h-1 bg-white/40 rounded-full"></div>
        </div>
      </main>
    </div>
  );
};
