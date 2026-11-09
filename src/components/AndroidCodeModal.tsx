import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Code2,
  FileCode,
  FolderCode,
  FileText,
  Search,
} from 'lucide-react';
import { ANDROID_PROJECT_FILES, AndroidFile, generateAndDownloadAndroidZip } from '../utils/androidProjectGenerator';

interface AndroidCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidCodeModal: React.FC<AndroidCodeModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<AndroidFile>(ANDROID_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const filteredFiles = ANDROID_PROJECT_FILES.filter(
    (f) =>
      f.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      await generateAndDownloadAndroidZip();
    } catch (e) {
      console.error('Error generating zip:', e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[88vh] bg-[#141419] rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <header className="px-5 py-3 border-b border-white/10 flex items-center justify-between bg-[#1A1A22] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#A78BFA] via-[#8B5CF6] to-[#6D28D9] flex items-center justify-center shadow-md">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Código Fuente Nativo para Android Studio
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  KOTLIN & JETPACK COMPOSE
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Arquitectura MVVM, Room Database, Material 3 Dark Palette y Navigation Compose
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="px-3.5 py-1.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold shadow-lg glow-purple flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95"
              type="button"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Generando ZIP...' : 'Descargar Proyecto .ZIP'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Body Split */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Explorer Sidebar */}
          <aside className="w-72 border-r border-white/5 bg-[#121217] flex flex-col shrink-0">
            {/* Search */}
            <div className="p-3 border-b border-white/5">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-2.5 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar archivo Kotlin, Gradle..."
                  className="w-full bg-[#1C1C24] pl-8 pr-2 py-1.5 rounded-lg text-xs text-white border border-white/10 outline-none focus:border-[#8B5CF6]"
                />
              </div>
            </div>

            {/* File List */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
              {filteredFiles.map((file) => {
                const isSelected = selectedFile.path === file.path;

                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center space-x-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#8B5CF6]/20 text-white font-semibold border border-[#8B5CF6]/40'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                    type="button"
                  >
                    {file.category === 'kotlin' && (
                      <FileCode className="w-3.5 h-3.5 text-[#A78BFA] shrink-0" />
                    )}
                    {file.category === 'config' && (
                      <FolderCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                    {file.category === 'docs' && (
                      <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    )}
                    {file.category === 'res' && (
                      <FileCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                    <span className="truncate">{file.path}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Code Viewer Panel */}
          <main className="flex-1 flex flex-col bg-[#0E0E12] overflow-hidden">
            {/* File Info Bar */}
            <div className="px-4 py-2 border-b border-white/5 bg-[#17171F] flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-semibold text-[#A78BFA]">
                  {selectedFile.path}
                </span>
                <p className="text-[10px] text-neutral-400">{selectedFile.description}</p>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#252532] hover:bg-[#303042] text-xs font-medium text-neutral-200 transition-all cursor-pointer"
                type="button"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Código</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-neutral-300 bg-[#0B0B0E]">
              <pre className="whitespace-pre">{selectedFile.content}</pre>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
