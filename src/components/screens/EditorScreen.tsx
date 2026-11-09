import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Check,
  Split,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  Trash2,
  Plus,
  Sliders,
  Crop as CropIcon,
  Palette,
  Sparkles,
  Type as TypeIcon,
  Layers as LayersIcon,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Sun,
  Contrast as ContrastIcon,
  Droplets,
  Thermometer,
  Gauge,
  Focus,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Pencil,
  ChevronDown,
} from 'lucide-react';
import { ProjectItem, PhotoAdjustments, FilterPreset, LayerItem, ToolCategory } from '../../types/editor';
import { FILTER_PRESETS } from '../../constants/presets';
import { getCssFilterString } from '../../utils/imageProcessing';

interface EditorScreenProps {
  project: ProjectItem;
  onUpdateProject: (updater: (prev: ProjectItem) => ProjectItem) => void;
  onBack: () => void;
  onNavigateToExport: () => void;
  onNavigateToAi: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const EditorScreen: React.FC<EditorScreenProps> = ({
  project,
  onUpdateProject,
  onBack,
  onNavigateToExport,
  onNavigateToAi,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('ajustes');
  const [isComparing, setIsComparing] = useState(false);
  const [showLayersSidebar, setShowLayersSidebar] = useState(true);
  const [selectedLayerId, setSelectedLayerId] = useState<string>('layer-star');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(project.title);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [newTextValue, setNewTextValue] = useState('PIXELAB');
  const [selectedColor, setSelectedColor] = useState('#8B5CF6');

  // Sliders helper
  const updateAdjustment = (key: keyof PhotoAdjustments, value: number) => {
    onUpdateProject((prev) => ({
      ...prev,
      adjustments: {
        ...prev.adjustments,
        [key]: value,
      },
    }));
  };

  // Filter selector
  const applyFilter = (filterId: FilterPreset) => {
    const preset = FILTER_PRESETS.find((f) => f.id === filterId);
    if (!preset) return;

    onUpdateProject((prev) => ({
      ...prev,
      filter: filterId,
      adjustments: {
        ...prev.adjustments,
        ...preset.adjustments,
      },
    }));
  };

  // Transform actions
  const handleRotate = () => {
    onUpdateProject((prev) => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360,
    }));
  };

  const handleFlipH = () => {
    onUpdateProject((prev) => ({
      ...prev,
      flipH: !prev.flipH,
    }));
  };

  const handleFlipV = () => {
    onUpdateProject((prev) => ({
      ...prev,
      flipV: !prev.flipV,
    }));
  };

  // Layer management
  const toggleLayerVisibility = (layerId: string) => {
    onUpdateProject((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l)),
    }));
  };

  const toggleLayerLock = (layerId: string) => {
    onUpdateProject((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => (l.id === layerId ? { ...l, locked: !l.locked } : l)),
    }));
  };

  const duplicateLayer = (layerId: string) => {
    const l = project.layers.find((layer) => layer.id === layerId);
    if (!l) return;
    const newL: LayerItem = {
      ...l,
      id: `layer-${Date.now()}`,
      name: `${l.name} (Copia)`,
      x: l.x + 5,
      y: l.y + 5,
    };
    onUpdateProject((prev) => ({
      ...prev,
      layers: [newL, ...prev.layers],
    }));
    setSelectedLayerId(newL.id);
  };

  const deleteLayer = (layerId: string) => {
    onUpdateProject((prev) => ({
      ...prev,
      layers: prev.layers.filter((l) => l.id !== layerId),
    }));
  };

  const addTextLayer = () => {
    if (!newTextValue.trim()) return;
    const newLayer: LayerItem = {
      id: `layer-text-${Date.now()}`,
      name: `Texto: ${newTextValue.slice(0, 10)}`,
      type: 'text',
      visible: true,
      locked: false,
      opacity: 100,
      x: 50,
      y: 40,
      scale: 1,
      rotation: 0,
      content: newTextValue,
      color: selectedColor,
      fontSize: 28,
      fontFamily: 'Plus Jakarta Sans, sans-serif',
    };
    onUpdateProject((prev) => ({
      ...prev,
      layers: [newLayer, ...prev.layers],
    }));
    setSelectedLayerId(newLayer.id);
  };

  const addStarLayer = () => {
    const newLayer: LayerItem = {
      id: `layer-star-${Date.now()}`,
      name: 'Estrella Neón',
      type: 'shape',
      visible: true,
      locked: false,
      opacity: 100,
      x: 30,
      y: 25,
      scale: 1,
      rotation: 0,
      color: selectedColor,
      content: 'star',
    };
    onUpdateProject((prev) => ({
      ...prev,
      layers: [newLayer, ...prev.layers],
    }));
    setSelectedLayerId(newLayer.id);
  };

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim()) {
      onUpdateProject((prev) => ({ ...prev, title: titleInput.trim() }));
    }
  };

  // Selected layer for bounding box
  const activeLayer = project.layers.find((l) => l.id === selectedLayerId);

  // Active filter style
  const filterStyle = isComparing
    ? 'brightness(1) contrast(1) saturate(1)'
    : getCssFilterString(project.adjustments);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#121118] select-none text-white">
      {/* Top Navigation Bar */}
      <nav
        className="w-full px-3 py-1.5 flex items-center justify-between z-20 border-b border-white/5 shrink-0 bg-[#161420]"
        data-purpose="top-action-bar"
      >
        <button
          onClick={onBack}
          aria-label="Volver"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-95 transition-all text-white/90 cursor-pointer"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Project Title with inline rename */}
        <div className="flex items-center space-x-1.5">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
              autoFocus
              className="bg-[#242132] px-2 py-0.5 rounded text-xs font-semibold text-white border border-[#8B5CF6] outline-none max-w-[130px]"
            />
          ) : (
            <div
              onClick={() => setIsEditingTitle(true)}
              className="flex items-center space-x-1 cursor-pointer group"
            >
              <span className="text-xs font-semibold tracking-wide text-neutral-100 group-hover:text-white max-w-[140px] truncate">
                {project.title}
              </span>
              <Pencil className="w-3 h-3 text-neutral-400 group-hover:text-[#A78BFA] transition-colors" />
            </div>
          )}
        </div>

        {/* Undo, Redo, Guardar */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="Deshacer"
            className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${
              canUndo
                ? 'hover:bg-white/10 active:scale-95 text-white cursor-pointer'
                : 'text-white/20 cursor-not-allowed'
            }`}
            type="button"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            aria-label="Rehacer"
            className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${
              canRedo
                ? 'hover:bg-white/10 active:scale-95 text-white cursor-pointer'
                : 'text-white/20 cursor-not-allowed'
            }`}
            type="button"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          {/* AI Suite Shortcut button */}
          <button
            onClick={onNavigateToAi}
            className="flex items-center space-x-1 bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 text-[#A78BFA] px-2.5 py-1 rounded-full text-xs font-semibold transition-all border border-[#8B5CF6]/30 cursor-pointer mr-1"
            title="Abrir herramientas de Inteligencia Artificial"
            type="button"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">IA</span>
          </button>

          {/* Guardar */}
          <button
            onClick={onNavigateToExport}
            aria-label="Guardar proyecto"
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] active:scale-95 text-white px-3 py-1 rounded-full flex items-center space-x-1 shadow-md shadow-purple-600/30 transition-all font-medium text-xs cursor-pointer"
            type="button"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Guardar</span>
          </button>
        </div>
      </nav>

      {/* Main Workspace: Split between Canvas and Layers Sidebar */}
      <section className="flex-1 flex px-2.5 pt-1 pb-1.5 gap-2 overflow-hidden relative">
        {/* Canvas Area Container */}
        <div className="flex-1 flex flex-col relative rounded-2xl overflow-hidden bg-[#181622] border border-white/5 shadow-inner">
          <div
            className="relative flex-1 overflow-hidden flex items-center justify-center select-none bg-[#0D0B12]"
            style={{
              transform: `scale(${zoomLevel})`,
              transition: 'transform 0.15s ease-out',
            }}
          >
            {/* The Image Canvas with Filters & Transformations */}
            <div
              className="relative w-full h-full flex items-center justify-center overflow-hidden transition-all duration-150"
              style={{
                filter: filterStyle,
                transform: `rotate(${project.rotation}deg) scaleX(${project.flipH ? -1 : 1}) scaleY(${
                  project.flipV ? -1 : 1
                })`,
              }}
            >
              {/* Background Base Image */}
              <img
                src={project.imageSrc}
                alt={project.title}
                className="w-full h-full object-cover select-none pointer-events-none"
              />

              {/* Special Collage Layers Graphic (David Vaporwave preset from Image 3/4) */}
              {project.layers.some((l) => l.content === 'statue_david') && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Textured radial background */}
                  <div
                    className="absolute inset-0 opacity-80 mix-blend-overlay"
                    style={{
                      backgroundImage: 'radial-gradient(rgba(255,255,255,0.18) 1px, transparent 0)',
                      backgroundSize: '8px 8px',
                    }}
                  />
                  {/* Big angular star burst */}
                  <div className="absolute -top-4 right-1 text-[#6D28D9] opacity-75 rotate-12">
                    <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 100 100">
                      <polygon points="50,0 63,35 100,50 63,65 50,100 37,65 0,50 37,35" />
                    </svg>
                  </div>
                  {/* B&W Skyscrapers */}
                  <div className="absolute -bottom-6 -left-8 -right-8 h-44 flex items-end">
                    <svg
                      className="w-full h-full object-cover filter contrast-150 grayscale"
                      fill="none"
                      viewBox="0 0 300 180"
                    >
                      <polygon fill="#2D2D2D" points="10,180 50,50 90,80 85,180" stroke="#555" strokeWidth="1" />
                      <polygon fill="#1B1B1B" points="75,180 120,20 185,45 175,180" stroke="#777" strokeWidth="1.5" />
                      <polygon fill="#222222" points="170,180 210,30 260,70 250,180" stroke="#444" strokeWidth="1" />
                    </svg>
                  </div>
                  {/* Classical Statue Bust */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-64 drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)]">
                    <svg className="w-full h-full" viewBox="0 0 200 260">
                      <path
                        d="M60,250 C40,230 45,180 55,150 C50,130 52,100 62,80 C70,60 85,40 105,40 C130,40 148,65 148,95 C148,110 142,125 140,140 C145,160 152,190 158,250 Z"
                        fill="#e2e0ea"
                      />
                      <path d="M90,75 C95,65 110,65 118,78 C115,82 108,82 90,75 Z" fill="#8c889f" />
                      <path d="M102,80 L106,115 L95,118 Z" fill="#aba7bc" />
                      <path d="M96,126 C105,123 115,125 118,128 C110,133 99,131 96,126 Z" fill="#7d7890" />
                      <path
                        d="M65,75 C60,50 80,30 110,32 C140,32 155,55 150,75 C140,55 125,48 105,48 C85,48 70,60 65,75 Z"
                        fill="#c3bfd5"
                      />
                    </svg>
                    {/* Purple eye tape */}
                    <div className="absolute top-[82px] left-[18px] w-36 h-6 bg-[#8B5CF6] -rotate-6 shadow-md shadow-purple-900/60 flex items-center justify-center">
                      <div className="w-full h-[1px] bg-white/40" />
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Overlay Layers */}
              {project.layers.map((layer) => {
                if (!layer.visible) return null;
                const isSelected = selectedLayerId === layer.id;

                return (
                  <div
                    key={layer.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLayerId(layer.id);
                    }}
                    className={`absolute cursor-move transition-all ${
                      isSelected
                        ? 'ring-2 ring-dashed ring-[#A78BFA] bg-purple-500/10 p-1 rounded'
                        : ''
                    }`}
                    style={{
                      left: `${layer.x}%`,
                      top: `${layer.y}%`,
                      transform: `translate(-50%, -50%) rotate(${layer.rotation || 0}deg) scale(${
                        layer.scale || 1
                      })`,
                      opacity: (layer.opacity ?? 100) / 100,
                    }}
                  >
                    {/* Corner Handles on Selected Layer */}
                    {isSelected && (
                      <>
                        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-[#8B5CF6] rounded-sm shadow" />
                        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-[#8B5CF6] rounded-sm shadow" />
                        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-[#8B5CF6] rounded-sm shadow" />
                        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-[#8B5CF6] rounded-sm shadow" />
                      </>
                    )}

                    {layer.type === 'shape' && layer.content === 'star' && (
                      <svg
                        className="w-12 h-12 text-white drop-shadow-[0_2px_8px_rgba(139,92,246,0.8)]"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        viewBox="0 0 24 24"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    )}

                    {layer.type === 'text' && (
                      <div
                        style={{
                          color: layer.color || '#FFFFFF',
                          fontSize: `${layer.fontSize || 24}px`,
                          fontFamily: layer.fontFamily,
                          textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                        }}
                        className="font-bold whitespace-nowrap"
                      >
                        {layer.content}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Vignette Overlay */}
            {project.adjustments.vignette > 0 && !isComparing && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: `inset 0 0 ${project.adjustments.vignette * 1.5}px rgba(0,0,0,${
                    (project.adjustments.vignette / 100) * 0.85
                  })`,
                }}
              />
            )}

            {/* Quick Canvas Viewport Navigation Controls */}
            <div
              className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-[#1F1D2B]/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center space-x-2.5 border border-white/10 shadow-xl z-20"
              data-purpose="quick-canvas-nav"
            >
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                className="text-white/70 hover:text-white active:scale-90 transition-all p-0.5 cursor-pointer"
                title="Acercar"
                type="button"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono text-neutral-400">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                className="text-white/70 hover:text-white active:scale-90 transition-all p-0.5 cursor-pointer"
                title="Alejar"
                type="button"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="text-white/70 hover:text-white active:scale-90 transition-all p-0.5 cursor-pointer"
                title="Ajustar a pantalla"
                type="button"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Floating 'Comparar' Button */}
            <button
              onMouseDown={() => setIsComparing(true)}
              onMouseUp={() => setIsComparing(false)}
              onTouchStart={() => setIsComparing(true)}
              onTouchEnd={() => setIsComparing(false)}
              className={`absolute bottom-2.5 right-3 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 flex items-center space-x-1 text-xs font-semibold shadow-lg active:scale-95 transition-all cursor-pointer z-20 ${
                isComparing
                  ? 'bg-[#8B5CF6] text-white shadow-purple-600/50'
                  : 'bg-[#1F1F26]/90 text-neutral-200 hover:bg-[#252530]'
              }`}
              type="button"
              title="Mantén presionado para ver la imagen original"
            >
              <Split className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>{isComparing ? 'Original' : 'Comparar'}</span>
            </button>
          </div>
        </div>

        {/* Layers Sidebar (as shown in Image 3 & 4) */}
        {showLayersSidebar && (
          <aside
            className="w-[104px] bg-[#1A1824] rounded-2xl p-2 flex flex-col justify-between border border-white/5 shadow-inner shrink-0"
            data-purpose="layers-sidebar"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-1 pb-1.5 border-b border-white/5">
              <span className="text-[11px] font-bold text-gray-200 tracking-wide">Capas</span>
              <button
                onClick={addStarLayer}
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 active:scale-95 text-[#A78BFA] cursor-pointer"
                title="Nueva capa"
                type="button"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Layers Vertical Stack */}
            <div className="flex-1 my-1.5 flex flex-col space-y-1.5 overflow-y-auto no-scrollbar">
              {project.layers.map((layer) => {
                const isSelected = selectedLayerId === layer.id;

                return (
                  <div
                    key={layer.id}
                    onClick={() => setSelectedLayerId(layer.id)}
                    className={`group relative rounded-xl p-1 flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#242132] border-2 border-[#8B5CF6]'
                        : 'bg-[#201D2D] hover:bg-[#262335] border border-transparent'
                    }`}
                  >
                    {/* Layer Thumbnail */}
                    <div className="w-8 h-8 rounded-lg bg-[#191724] border border-white/10 flex items-center justify-center overflow-hidden">
                      {layer.type === 'shape' && (
                        <div className="w-3.5 h-3.5 bg-[#8B5CF6] rounded-xs shadow-inner" />
                      )}
                      {layer.type === 'text' && (
                        <TypeIcon className="w-4 h-4 text-[#A78BFA]" />
                      )}
                      {layer.type === 'image' && (
                        <Palette className="w-4 h-4 text-gray-400" />
                      )}
                    </div>

                    {/* Visibility or Lock Toggles */}
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLayerVisibility(layer.id);
                        }}
                        className="text-gray-400 hover:text-white p-0.5 cursor-pointer"
                        type="button"
                        title={layer.visible ? 'Ocultar capa' : 'Mostrar capa'}
                      >
                        {layer.visible ? (
                          <Eye className="w-3 h-3 text-gray-300" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-red-400" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLayerLock(layer.id);
                        }}
                        className="text-gray-400 hover:text-[#A78BFA] p-0.5 cursor-pointer"
                        type="button"
                        title={layer.locked ? 'Desbloquear' : 'Bloquear'}
                      >
                        {layer.locked ? (
                          <Lock className="w-3 h-3 text-[#A78BFA]" />
                        ) : (
                          <Unlock className="w-3 h-3 text-gray-500 opacity-60" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions Footer */}
            <div className="pt-1.5 border-t border-white/5 flex items-center justify-around text-gray-400">
              <button
                onClick={() => selectedLayerId && duplicateLayer(selectedLayerId)}
                className="p-1 hover:text-white hover:bg-white/5 rounded transition-all cursor-pointer"
                title="Duplicar capa"
                type="button"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => selectedLayerId && deleteLayer(selectedLayerId)}
                className="p-1 hover:text-red-400 hover:bg-white/5 rounded transition-all cursor-pointer"
                title="Eliminar capa"
                type="button"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </aside>
        )}
      </section>

      {/* Tool Categories Dock (Material 3 style) */}
      <section
        className="px-2 py-1.5 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar border-t border-white/5 bg-[#121215] shrink-0"
        data-purpose="tools-selector"
      >
        {[
          { id: 'ajustes' as ToolCategory, label: 'Ajustes', icon: Sliders },
          { id: 'recortar' as ToolCategory, label: 'Recortar', icon: CropIcon },
          { id: 'filtros' as ToolCategory, label: 'Filtros', icon: Palette },
          { id: 'retoque' as ToolCategory, label: 'Retoque', icon: Droplets },
          { id: 'texto' as ToolCategory, label: 'Texto', icon: TypeIcon },
          { id: 'capas' as ToolCategory, label: 'Capas', icon: LayersIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveCategory(tab.id);
                if (tab.id === 'capas') {
                  setShowLayersSidebar(!showLayersSidebar);
                }
              }}
              className={`flex flex-col items-center gap-0.5 min-w-[52px] py-1 transition-all cursor-pointer ${
                isActive ? 'text-[#8B5CF6]' : 'text-neutral-400 hover:text-white'
              }`}
              type="button"
            >
              <div
                className={`w-9 h-7 rounded-xl flex items-center justify-center transition-all ${
                  isActive ? 'bg-[#8B5CF6]/20' : 'hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </section>

      {/* Adjustment Bottom Sheet / Panel Controls */}
      <section
        className="bg-[#1F1F23] rounded-t-3xl p-4 pb-5 border-t border-white/10 shadow-2xl flex flex-col gap-3 z-20 shrink-0 max-h-[260px] overflow-y-auto no-scrollbar"
        data-purpose="adjustment-panel"
      >
        {/* Panel 1: Ajustes Fotonuméricos (Brillo, Contraste, Saturación, etc.) */}
        {activeCategory === 'ajustes' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-xs font-semibold tracking-wide text-neutral-100 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span>Ajustes Fotográficos Profesionales</span>
              </h3>
              <button
                onClick={() =>
                  onUpdateProject((prev) => ({
                    ...prev,
                    adjustments: {
                      brightness: 0,
                      contrast: 0,
                      saturation: 0,
                      temperature: 0,
                      exposure: 0,
                      vignette: 0,
                      blur: 0,
                      sharpen: 0,
                      tint: 0,
                    },
                  }))
                }
                className="text-[10px] font-semibold text-[#A78BFA] hover:underline cursor-pointer"
                type="button"
              >
                Restablecer
              </button>
            </div>

            {/* Brillo */}
            <div className="flex items-center gap-2 text-xs">
              <Sun className="w-4 h-4 text-neutral-400 shrink-0" />
              <span className="w-16 text-neutral-300">Brillo</span>
              <input
                type="range"
                min="-50"
                max="50"
                value={project.adjustments.brightness}
                onChange={(e) => updateAdjustment('brightness', parseInt(e.target.value, 10))}
                className="flex-1 accent-[#8B5CF6] cursor-pointer"
              />
              <span className="w-8 text-right font-mono text-neutral-300">
                {project.adjustments.brightness > 0 ? '+' : ''}
                {project.adjustments.brightness}
              </span>
            </div>

            {/* Contraste */}
            <div className="flex items-center gap-2 text-xs">
              <ContrastIcon className="w-4 h-4 text-neutral-400 shrink-0" />
              <span className="w-16 text-neutral-300">Contraste</span>
              <input
                type="range"
                min="-50"
                max="50"
                value={project.adjustments.contrast}
                onChange={(e) => updateAdjustment('contrast', parseInt(e.target.value, 10))}
                className="flex-1 accent-[#8B5CF6] cursor-pointer"
              />
              <span className="w-8 text-right font-mono text-neutral-300">
                {project.adjustments.contrast > 0 ? '+' : ''}
                {project.adjustments.contrast}
              </span>
            </div>

            {/* Saturación */}
            <div className="flex items-center gap-2 text-xs">
              <Droplets className="w-4 h-4 text-neutral-400 shrink-0" />
              <span className="w-16 text-neutral-300">Saturación</span>
              <input
                type="range"
                min="-50"
                max="50"
                value={project.adjustments.saturation}
                onChange={(e) => updateAdjustment('saturation', parseInt(e.target.value, 10))}
                className="flex-1 accent-[#8B5CF6] cursor-pointer"
              />
              <span className="w-8 text-right font-mono text-neutral-300">
                {project.adjustments.saturation > 0 ? '+' : ''}
                {project.adjustments.saturation}
              </span>
            </div>

            {/* Temperatura */}
            <div className="flex items-center gap-2 text-xs">
              <Thermometer className="w-4 h-4 text-neutral-400 shrink-0" />
              <span className="w-16 text-neutral-300">Calidez</span>
              <input
                type="range"
                min="-50"
                max="50"
                value={project.adjustments.temperature}
                onChange={(e) => updateAdjustment('temperature', parseInt(e.target.value, 10))}
                className="flex-1 accent-[#8B5CF6] cursor-pointer"
              />
              <span className="w-8 text-right font-mono text-neutral-300">
                {project.adjustments.temperature > 0 ? '+' : ''}
                {project.adjustments.temperature}
              </span>
            </div>

            {/* Viñeta */}
            <div className="flex items-center gap-2 text-xs">
              <Focus className="w-4 h-4 text-neutral-400 shrink-0" />
              <span className="w-16 text-neutral-300">Viñeta</span>
              <input
                type="range"
                min="0"
                max="100"
                value={project.adjustments.vignette}
                onChange={(e) => updateAdjustment('vignette', parseInt(e.target.value, 10))}
                className="flex-1 accent-[#8B5CF6] cursor-pointer"
              />
              <span className="w-8 text-right font-mono text-neutral-300">
                {project.adjustments.vignette}%
              </span>
            </div>
          </div>
        )}

        {/* Panel 2: Recortar y Rotar */}
        {activeCategory === 'recortar' && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-neutral-200">Transformar & Geometría</h3>
            <div className="flex items-center justify-around gap-2">
              <button
                onClick={handleRotate}
                className="flex-1 py-2 rounded-xl bg-[#26262F] hover:bg-[#2F2F3B] flex flex-col items-center justify-center text-xs font-medium cursor-pointer active:scale-95 transition-all"
                type="button"
              >
                <RotateCw className="w-4 h-4 text-[#A78BFA] mb-1" />
                <span>Girar 90°</span>
              </button>
              <button
                onClick={handleFlipH}
                className="flex-1 py-2 rounded-xl bg-[#26262F] hover:bg-[#2F2F3B] flex flex-col items-center justify-center text-xs font-medium cursor-pointer active:scale-95 transition-all"
                type="button"
              >
                <FlipHorizontal className="w-4 h-4 text-[#A78BFA] mb-1" />
                <span>Voltear H</span>
              </button>
              <button
                onClick={handleFlipV}
                className="flex-1 py-2 rounded-xl bg-[#26262F] hover:bg-[#2F2F3B] flex flex-col items-center justify-center text-xs font-medium cursor-pointer active:scale-95 transition-all"
                type="button"
              >
                <FlipVertical className="w-4 h-4 text-[#A78BFA] mb-1" />
                <span>Voltear V</span>
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span>Proporciones: Libre, 1:1 Cuadrado, 4:5 Instagram, 9:16 Story</span>
            </div>
          </div>
        )}

        {/* Panel 3: Filtros */}
        {activeCategory === 'filtros' && (
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-neutral-200">Filtros Fotográficos</h3>
            <div className="flex items-center space-x-2.5 overflow-x-auto no-scrollbar py-1">
              {FILTER_PRESETS.map((filter) => {
                const isSelected = project.filter === filter.id;

                return (
                  <button
                    key={filter.id}
                    onClick={() => applyFilter(filter.id)}
                    className={`flex flex-col items-center shrink-0 cursor-pointer transition-all ${
                      isSelected ? 'scale-105' : 'opacity-70 hover:opacity-100'
                    }`}
                    type="button"
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center shadow-md ${
                        isSelected ? 'border-[#8B5CF6] ring-2 ring-[#8B5CF6]/50' : 'border-white/10'
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${filter.thumbnailColor}, #171717)`,
                      }}
                    >
                      {isSelected && <Check className="w-5 h-5 text-white drop-shadow" />}
                    </div>
                    <span
                      className={`text-[10px] mt-1 font-medium truncate max-w-[60px] ${
                        isSelected ? 'text-[#A78BFA] font-bold' : 'text-neutral-300'
                      }`}
                    >
                      {filter.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Panel 4: Retoque */}
        {activeCategory === 'retoque' && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-neutral-200">Retoque & Acabado</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() =>
                  onUpdateProject((prev) => ({
                    ...prev,
                    adjustments: { ...prev.adjustments, brightness: prev.adjustments.brightness + 8, saturation: prev.adjustments.saturation + 10 },
                  }))
                }
                className="p-2.5 rounded-xl bg-[#26262F] hover:bg-[#30303D] text-left text-xs active:scale-95 transition-all"
                type="button"
              >
                <span className="font-semibold text-white block">Glow & Resplandor</span>
                <span className="text-[10px] text-neutral-400">Ilumina el rostro y texturas</span>
              </button>
              <button
                onClick={() =>
                  onUpdateProject((prev) => ({
                    ...prev,
                    adjustments: { ...prev.adjustments, contrast: prev.adjustments.contrast + 15 },
                  }))
                }
                className="p-2.5 rounded-xl bg-[#26262F] hover:bg-[#30303D] text-left text-xs active:scale-95 transition-all"
                type="button"
              >
                <span className="font-semibold text-white block">Nitidez HD</span>
                <span className="text-[10px] text-neutral-400">Resalta bordes y detalles</span>
              </button>
            </div>
          </div>
        )}

        {/* Panel 5: Texto y Stickers */}
        {activeCategory === 'texto' && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-neutral-200">Añadir Texto Creativo</h3>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newTextValue}
                onChange={(e) => setNewTextValue(e.target.value)}
                placeholder="Escribe tu texto..."
                className="flex-1 bg-[#26262F] px-3 py-2 rounded-xl text-xs text-white border border-white/10 outline-none focus:border-[#8B5CF6]"
              />
              <button
                onClick={addTextLayer}
                className="px-3.5 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold shadow active:scale-95 transition-all cursor-pointer"
                type="button"
              >
                Insertar
              </button>
            </div>
            {/* Color swatches */}
            <div className="flex items-center space-x-2 pt-1">
              {['#FFFFFF', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4', '#000000'].map(
                (c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                      selectedColor === c ? 'border-white scale-110 shadow-md' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                    type="button"
                  />
                )
              )}
            </div>
          </div>
        )}

        {/* Panel 6: Capas overview */}
        {activeCategory === 'capas' && (
          <div className="flex items-center justify-between text-xs text-neutral-300">
            <span>
              Gestiona el apilamiento de capas en el panel lateral derecho (visibilidad, candado, duplicación).
            </span>
            <button
              onClick={() => setShowLayersSidebar(!showLayersSidebar)}
              className="text-[#A78BFA] font-semibold underline cursor-pointer"
              type="button"
            >
              {showLayersSidebar ? 'Ocultar panel' : 'Mostrar panel'}
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
