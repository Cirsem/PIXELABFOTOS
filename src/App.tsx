import React, { useState, useEffect } from 'react';
import { ScreenId, ProjectItem, PhotoAdjustments } from './types/editor';
import { INITIAL_PROJECTS, DEFAULT_ADJUSTMENTS } from './constants/presets';
import { PhoneFrame } from './components/PhoneFrame';
import { BottomNavBar } from './components/BottomNavBar';
import { HomeScreen } from './components/screens/HomeScreen';
import { GalleryScreen } from './components/screens/GalleryScreen';
import { EditorScreen } from './components/screens/EditorScreen';
import { AiSuiteScreen } from './components/screens/AiSuiteScreen';
import { ExportScreen } from './components/screens/ExportScreen';
import { AndroidCodeModal } from './components/AndroidCodeModal';
import { generateAndDownloadAndroidZip } from './utils/androidProjectGenerator';
import { X, Sparkles, Smartphone, Code2, Info, Moon } from 'lucide-react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [projects, setProjects] = useState<ProjectItem[]>(() => {
    try {
      const saved = localStorage.getItem('pixelab_projects');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PROJECTS;
  });

  const [activeProject, setActiveProject] = useState<ProjectItem>(projects[0]);

  // Undo / Redo History Stacks
  const [undoStack, setUndoStack] = useState<ProjectItem[]>([]);
  const [redoStack, setRedoStack] = useState<ProjectItem[]>([]);

  // Modals
  const [isAndroidCodeOpen, setIsAndroidCodeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync projects with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pixelab_projects', JSON.stringify(projects));
    } catch (e) {
      console.error(e);
    }
  }, [projects]);

  // Update active project with undo history
  const handleUpdateProject = (updater: (prev: ProjectItem) => ProjectItem) => {
    setActiveProject((prev) => {
      // Push previous state to undo stack
      setUndoStack((u) => [...u.slice(-15), prev]);
      setRedoStack([]); // clear redo on new edit

      const updated = updater(prev);

      // Also update in projects list
      setProjects((all) =>
        all.map((p) => (p.id === updated.id ? { ...updated, lastModified: 'Hace un momento' } : p))
      );

      return updated;
    });
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((u) => u.slice(0, -1));
    setRedoStack((r) => [...r, activeProject]);
    setActiveProject(prev);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((r) => r.slice(0, -1));
    setUndoStack((u) => [...u, activeProject]);
    setActiveProject(next);
  };

  // Open existing project
  const handleOpenProject = (project: ProjectItem) => {
    setActiveProject(project);
    setUndoStack([]);
    setRedoStack([]);
    setCurrentScreen('editor');
  };

  // Create new project from image source
  const handleSelectNewImage = (src: string, title?: string) => {
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: title || 'Nueva Edición',
      thumbnail: src,
      imageSrc: src,
      lastModified: 'Ahora',
      dimensions: { width: 1080, height: 1350 },
      adjustments: { ...DEFAULT_ADJUSTMENTS },
      filter: 'none',
      layers: [],
      rotation: 0,
      flipH: false,
      flipV: false,
    };

    setProjects((prev) => [newProj, ...prev]);
    setActiveProject(newProj);
    setUndoStack([]);
    setRedoStack([]);
    setCurrentScreen('editor');
  };

  // Delete project
  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (activeProject.id === id) {
      const remaining = projects.filter((p) => p.id !== id);
      if (remaining.length > 0) {
        setActiveProject(remaining[0]);
      }
    }
  };

  // Quick tools launcher
  const handleQuickTool = (tool: 'crop' | 'filter' | 'bg_removal' | 'retouch') => {
    if (tool === 'crop' || tool === 'filter') {
      setCurrentScreen('editor');
    } else {
      setCurrentScreen('ai');
    }
  };

  // Apply AI image change
  const handleApplyAiImageChange = (newImageSrc: string, description: string) => {
    handleUpdateProject((prev) => ({
      ...prev,
      imageSrc: newImageSrc,
      thumbnail: newImageSrc,
    }));
  };

  // Apply AI adjustments
  const handleApplyAiAdjustments = (adjustments: Partial<PhotoAdjustments>, description: string) => {
    handleUpdateProject((prev) => ({
      ...prev,
      adjustments: {
        ...prev.adjustments,
        ...adjustments,
      },
    }));
  };

  return (
    <PhoneFrame
      onOpenAndroidCode={() => setIsAndroidCodeOpen(true)}
      onQuickDownloadZip={() => generateAndDownloadAndroidZip()}
    >
      {/* Dynamic Screen Viewport */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {currentScreen === 'home' && (
          <HomeScreen
            recentProjects={projects}
            onOpenProject={handleOpenProject}
            onNewEdit={() => setCurrentScreen('gallery')}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onQuickTool={handleQuickTool}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {currentScreen === 'gallery' && (
          <GalleryScreen
            projects={projects}
            onSelectImage={handleSelectNewImage}
            onOpenProject={handleOpenProject}
            onDeleteProject={handleDeleteProject}
            onBack={() => setCurrentScreen('home')}
          />
        )}

        {currentScreen === 'editor' && (
          <EditorScreen
            project={activeProject}
            onUpdateProject={handleUpdateProject}
            onBack={() => setCurrentScreen('home')}
            onNavigateToExport={() => setCurrentScreen('export')}
            onNavigateToAi={() => setCurrentScreen('ai')}
            canUndo={undoStack.length > 0}
            canRedo={redoStack.length > 0}
            onUndo={handleUndo}
            onRedo={handleRedo}
          />
        )}

        {currentScreen === 'ai' && (
          <AiSuiteScreen
            project={activeProject}
            onApplyImageChange={handleApplyAiImageChange}
            onApplyAdjustments={handleApplyAiAdjustments}
            onBack={() => setCurrentScreen('home')}
            onNavigateToEditor={() => setCurrentScreen('editor')}
          />
        )}

        {currentScreen === 'export' && (
          <ExportScreen
            project={activeProject}
            onBack={() => setCurrentScreen('editor')}
            onGoHome={() => setCurrentScreen('home')}
          />
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <BottomNavBar
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
      />

      {/* Android Code & ZIP Downloader Modal */}
      <AndroidCodeModal
        isOpen={isAndroidCodeOpen}
        onClose={() => setIsAndroidCodeOpen(false)}
      />

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1A1824] rounded-3xl p-5 border border-white/10 shadow-2xl flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#A78BFA] via-[#8B5CF6] to-[#6D28D9] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">PX</span>
                </div>
                <h3 className="text-sm font-bold text-white">Acerca de PIXELAB</h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 text-neutral-400"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-neutral-300">
              <div className="p-3 rounded-xl bg-[#222030] border border-white/5 space-y-1">
                <span className="font-semibold text-white block">Arquitectura del Sistema</span>
                <p className="text-neutral-400 text-[11px]">
                  Kotlin 2.0 • Jetpack Compose • Material Design 3 Dark Mode (#171717, #252525, #8B5CF6) • Room Database • Navigation Compose.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#222030] border border-white/5 space-y-1">
                <span className="font-semibold text-white block">Inteligencia Artificial</span>
                <p className="text-neutral-400 text-[11px]">
                  Conectado con Gemini 3.8 Flash para el Asistente Creativo, Inpainting inteligente para eliminación de objetos y segmentación de fondos.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col space-y-2">
              <button
                onClick={() => {
                  setIsSettingsOpen(false);
                  setIsAndroidCodeOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold shadow flex items-center justify-center space-x-1.5 cursor-pointer"
                type="button"
              >
                <Code2 className="w-4 h-4" />
                <span>Explorar Código Android Studio</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </PhoneFrame>
  );
}
