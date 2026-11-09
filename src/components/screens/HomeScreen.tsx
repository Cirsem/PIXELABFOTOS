import React from 'react';
import { Settings, Plus, Crop, Sliders, Scissors, Droplets, ChevronRight, Sparkles } from 'lucide-react';
import { ProjectItem, ScreenId } from '../../types/editor';

interface HomeScreenProps {
  recentProjects: ProjectItem[];
  onOpenProject: (project: ProjectItem) => void;
  onNewEdit: () => void;
  onNavigate: (screen: ScreenId) => void;
  onQuickTool: (tool: 'crop' | 'filter' | 'bg_removal' | 'retouch') => void;
  onOpenSettings: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  recentProjects,
  onOpenProject,
  onNewEdit,
  onNavigate,
  onQuickTool,
  onOpenSettings,
}) => {
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4 flex flex-col space-y-5 select-none">
      {/* App Header */}
      <section className="pt-2 flex items-center justify-between" data-purpose="header">
        {/* Logo Pixelab */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#A78BFA] via-[#8B5CF6] to-[#6D28D9] flex items-center justify-center p-1.5 shadow-md shadow-[#8B5CF6]/30">
            <svg className="w-full h-full fill-white" viewBox="0 0 24 24">
              <path d="M6 3h6v6H6V3zm6 6h6v6h-6V9zM6 15h6v6H6v-6z"></path>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-wider text-white">PIXELAB</span>
        </div>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          aria-label="Ajustes"
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          type="button"
        >
          <Settings className="w-5 h-5 text-gray-300 stroke-[1.8]" />
        </button>
      </section>

      {/* Hero Creativity Banner */}
      <section
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C182B] via-[#161421] to-[#121215] border border-[#2E2845] p-5 pt-7 pb-6 flex flex-col justify-between min-h-[190px] shadow-xl"
        data-purpose="hero-banner"
      >
        {/* Decorative elements */}
        <div className="absolute -right-8 -top-6 w-44 h-44 bg-[#8B5CF6]/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-32 opacity-25 pointer-events-none">
          <svg className="fill-[#A78BFA] w-full h-full" viewBox="0 0 100 100">
            <polygon points="50,0 63,35 100,50 63,65 50,100 37,65 0,50 37,35"></polygon>
          </svg>
        </div>

        {/* Hero headline with sparkles */}
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white max-w-[220px]">
              Dale vida <br />
              a tus <span className="text-[#A78BFA] italic font-bold">ideas</span>
            </h1>
            <div className="flex flex-col space-y-1 pt-1 pr-3 text-[#A78BFA] opacity-90 select-none">
              <span className="text-xl leading-none">✧</span>
              <span className="text-sm leading-none pl-3">✦</span>
            </div>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-[230px]">
            Editor fotográfico con inteligencia artificial y capas avanzadas.
          </p>
        </div>

        {/* CTA '+ Nueva edición' */}
        <button
          onClick={onNewEdit}
          className="relative z-10 mt-5 w-full py-3.5 px-6 rounded-full bg-[#8B5CF6] hover:bg-[#7C3AED] active:scale-[0.98] transition-all duration-150 flex items-center justify-center space-x-2 font-semibold text-white shadow-lg glow-purple cursor-pointer"
          data-purpose="cta-new-edit"
          type="button"
        >
          <Plus className="w-5 h-5 stroke-[2.4]" />
          <span className="text-sm tracking-wide">Nueva edición</span>
        </button>
      </section>

      {/* Recent Projects Section */}
      <section className="space-y-3" data-purpose="recent-projects">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-wide">Proyectos recientes</h2>
          <button
            onClick={() => onNavigate('gallery')}
            className="text-xs font-medium text-[#9CA3AF] hover:text-[#A78BFA] transition-colors flex items-center space-x-1 cursor-pointer"
            type="button"
          >
            <span>Ver todos</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Projects thumbnails */}
        <div className="grid grid-cols-3 gap-3">
          {recentProjects.slice(0, 3).map((proj) => (
            <div
              key={proj.id}
              onClick={() => onOpenProject(proj)}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-[#1E1E24] border border-white/5 cursor-pointer shadow-md hover:border-[#8B5CF6]/50 transition-all active:scale-95"
            >
              <img
                src={proj.thumbnail || proj.imageSrc}
                alt={proj.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-2">
                <span className="text-[11px] font-medium text-white truncate drop-shadow">
                  {proj.title}
                </span>
                <span className="text-[9px] text-neutral-400">{proj.lastModified}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Tools Section */}
      <section className="space-y-3" data-purpose="quick-tools">
        <h2 className="text-base font-bold text-white tracking-wide">Herramientas rápidas</h2>
        <div className="grid grid-cols-4 gap-2.5">
          {/* Recortar */}
          <button
            onClick={() => onQuickTool('crop')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1E1E24] hover:bg-[#26262F] active:scale-95 transition-all border border-white/5 group cursor-pointer"
            type="button"
          >
            <div className="w-9 h-9 flex items-center justify-center text-gray-200 group-hover:text-[#A78BFA] transition-colors">
              <Crop className="w-5 h-5 stroke-[1.9]" />
            </div>
            <span className="text-[11px] font-medium text-gray-300 mt-1">Recortar</span>
          </button>

          {/* Filtros */}
          <button
            onClick={() => onQuickTool('filter')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1E1E24] hover:bg-[#26262F] active:scale-95 transition-all border border-white/5 group cursor-pointer"
            type="button"
          >
            <div className="w-9 h-9 flex items-center justify-center text-gray-200 group-hover:text-[#A78BFA] transition-colors">
              <Sliders className="w-5 h-5 stroke-[1.9]" />
            </div>
            <span className="text-[11px] font-medium text-gray-300 mt-1">Filtros</span>
          </button>

          {/* Eliminar fondo */}
          <button
            onClick={() => onQuickTool('bg_removal')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1E1E24] hover:bg-[#26262F] active:scale-95 transition-all border border-white/5 group cursor-pointer"
            type="button"
          >
            <div className="w-9 h-9 flex items-center justify-center text-gray-200 group-hover:text-[#A78BFA] transition-colors">
              <Scissors className="w-5 h-5 stroke-[1.9]" />
            </div>
            <span className="text-[10px] leading-tight font-medium text-gray-300 mt-1 text-center">
              Eliminar fondo
            </span>
          </button>

          {/* Retoque */}
          <button
            onClick={() => onQuickTool('retouch')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1E1E24] hover:bg-[#26262F] active:scale-95 transition-all border border-white/5 group cursor-pointer"
            type="button"
          >
            <div className="w-9 h-9 flex items-center justify-center text-gray-200 group-hover:text-[#A78BFA] transition-colors">
              <Droplets className="w-5 h-5 stroke-[1.9]" />
            </div>
            <span className="text-[11px] font-medium text-gray-300 mt-1">Retoque</span>
          </button>
        </div>
      </section>

      {/* AI Spotlight Card */}
      <section
        onClick={() => onNavigate('ai')}
        className="p-3.5 rounded-2xl bg-gradient-to-r from-[#1F1934] to-[#171424] border border-[#8B5CF6]/30 flex items-center justify-between cursor-pointer hover:border-[#8B5CF6] transition-all group"
      >
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center text-[#A78BFA] group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              PIXELAB AI Studio
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#8B5CF6] text-white">NUEVO</span>
            </span>
            <p className="text-[11px] text-neutral-400">
              Elimina objetos, cambia fondos y recibe consejos creativos con IA.
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
      </section>
    </div>
  );
};
