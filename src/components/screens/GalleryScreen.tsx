import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, ArrowLeft, Plus, Clock } from 'lucide-react';
import { ProjectItem } from '../../types/editor';
import { SAMPLE_IMAGES } from '../../constants/presets';

interface GalleryScreenProps {
  projects: ProjectItem[];
  onSelectImage: (src: string, title?: string) => void;
  onOpenProject: (project: ProjectItem) => void;
  onDeleteProject: (id: string) => void;
  onBack: () => void;
}

export const GalleryScreen: React.FC<GalleryScreenProps> = ({
  projects,
  onSelectImage,
  onOpenProject,
  onDeleteProject,
  onBack,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'device' | 'samples' | 'projects'>('device');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          onSelectImage(result, file.name.replace(/\.[^/.]+$/, ''));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          onSelectImage(result, file.name.replace(/\.[^/.]+$/, ''));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#121215] select-none">
      {/* Top Bar */}
      <header className="px-4 py-2 flex items-center justify-between border-b border-white/5 shrink-0">
        <div className="flex items-center space-x-2">
          <button
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-95 transition-all text-neutral-300"
            type="button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-white">Galería & Proyectos</h1>
            <p className="text-[11px] text-neutral-400">Selecciona o importa una fotografía</p>
          </div>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
          type="button"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Importar</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </header>

      {/* Tabs */}
      <div className="flex items-center border-b border-white/5 px-4 pt-2 shrink-0 bg-[#17171C]">
        <button
          onClick={() => setActiveTab('device')}
          className={`pb-2.5 px-3 text-xs font-semibold transition-all relative cursor-pointer ${
            activeTab === 'device' ? 'text-[#A78BFA]' : 'text-neutral-400 hover:text-white'
          }`}
          type="button"
        >
          Dispositivo & Carga
          {activeTab === 'device' && (
            <div className="absolute bottom-0 inset-x-2 h-0.5 bg-[#8B5CF6] rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('samples')}
          className={`pb-2.5 px-3 text-xs font-semibold transition-all relative cursor-pointer ${
            activeTab === 'samples' ? 'text-[#A78BFA]' : 'text-neutral-400 hover:text-white'
          }`}
          type="button"
        >
          Biblioteca HD
          {activeTab === 'samples' && (
            <div className="absolute bottom-0 inset-x-2 h-0.5 bg-[#8B5CF6] rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-2.5 px-3 text-xs font-semibold transition-all relative cursor-pointer ${
            activeTab === 'projects' ? 'text-[#A78BFA]' : 'text-neutral-400 hover:text-white'
          }`}
          type="button"
        >
          Proyectos ({projects.length})
          {activeTab === 'projects' && (
            <div className="absolute bottom-0 inset-x-2 h-0.5 bg-[#8B5CF6] rounded-full" />
          )}
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
        {activeTab === 'device' && (
          <div className="space-y-4">
            {/* Drop / Pick Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 scale-[0.99]'
                  : 'border-[#32323D] bg-[#1A1A22] hover:border-[#8B5CF6]/60 hover:bg-[#1E1E28]'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center mb-3 text-[#A78BFA] shadow-lg">
                <UploadCloud className="w-8 h-8 stroke-[1.8]" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">
                Toca para abrir Android Photo Picker
              </h3>
              <p className="text-xs text-neutral-400 max-w-xs">
                O arrastra cualquier imagen (JPG, PNG, WebP) para comenzar a editar
              </p>
            </div>

            {/* Quick launch presets */}
            <div>
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2.5">
                Fotos de muestra recomendadas
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                {SAMPLE_IMAGES.slice(0, 4).map((sample) => (
                  <div
                    key={sample.id}
                    onClick={() => onSelectImage(sample.url, sample.title)}
                    className="group relative aspect-video rounded-xl overflow-hidden bg-[#1E1E24] border border-white/5 cursor-pointer shadow hover:border-[#8B5CF6] transition-all"
                  >
                    <img
                      src={sample.url}
                      alt={sample.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                      <span className="text-[11px] font-semibold text-white drop-shadow">
                        {sample.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'samples' && (
          <div className="space-y-3">
            <p className="text-xs text-neutral-400">
              Colección curada de fotografías de alta resolución listas para poner a prueba los filtros y herramientas de IA de PIXELAB.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {SAMPLE_IMAGES.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => onSelectImage(sample.url, sample.title)}
                  className="group relative rounded-2xl overflow-hidden bg-[#1E1E24] border border-white/5 cursor-pointer shadow-lg hover:border-[#8B5CF6] transition-all flex flex-col"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden relative">
                    <img
                      src={sample.url}
                      alt={sample.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-medium text-white border border-white/10">
                      {sample.category}
                    </div>
                  </div>
                  <div className="p-2.5 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-white truncate max-w-[120px]">
                        {sample.title}
                      </h4>
                      <span className="text-[10px] text-neutral-400">
                        {sample.dimensions.width}x{sample.dimensions.height}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#A78BFA] group-hover:underline">
                      Editar
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-3">
            {projects.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center text-neutral-400">
                <ImageIcon className="w-12 h-12 stroke-[1.4] mb-2 opacity-50" />
                <p className="text-sm">No tienes proyectos guardados aún.</p>
                <button
                  onClick={() => setActiveTab('device')}
                  className="mt-3 text-xs text-[#A78BFA] font-semibold hover:underline"
                  type="button"
                >
                  Comenzar una nueva edición
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-2.5 rounded-2xl bg-[#1A1A22] border border-white/5 hover:border-[#8B5CF6]/40 flex items-center justify-between transition-all group"
                  >
                    <div
                      onClick={() => onOpenProject(proj)}
                      className="flex items-center space-x-3 cursor-pointer flex-1"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
                        <img
                          src={proj.thumbnail || proj.imageSrc}
                          alt={proj.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate">
                          {proj.title}
                        </h4>
                        <div className="flex items-center space-x-2 text-[10px] text-neutral-400 mt-0.5">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{proj.lastModified}</span>
                          </span>
                          <span>•</span>
                          <span>Filtro: {proj.filter}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onDeleteProject(proj.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Eliminar proyecto"
                        type="button"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
