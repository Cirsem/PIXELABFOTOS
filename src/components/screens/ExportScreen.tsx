import React, { useState } from 'react';
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  Share2,
  FileImage,
  Sparkles,
  Layers,
  RotateCw,
  RefreshCw,
} from 'lucide-react';
import { ProjectItem } from '../../types/editor';
import { renderCompositionToCanvas } from '../../utils/imageProcessing';

interface ExportScreenProps {
  project: ProjectItem;
  onBack: () => void;
  onGoHome: () => void;
}

export const ExportScreen: React.FC<ExportScreenProps> = ({ project, onBack, onGoHome }) => {
  const [format, setFormat] = useState<'image/jpeg' | 'image/png'>('image/jpeg');
  const [scale, setScale] = useState<number>(1); // 1 = 1x, 2 = 2x HD, 4 = 4K
  const [quality, setQuality] = useState<number>(0.92);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [fileSizeEstimate, setFileSizeEstimate] = useState('2.4 MB');

  // Calculate estimated dimensions
  const baseW = project.dimensions?.width || 1080;
  const baseH = project.dimensions?.height || 1350;
  const currentW = Math.round(baseW * scale);
  const currentH = Math.round(baseH * scale);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const { dataUrl, blob } = await renderCompositionToCanvas({
        imageSrc: project.imageSrc,
        adjustments: project.adjustments,
        rotation: project.rotation,
        flipH: project.flipH,
        flipV: project.flipV,
        layers: project.layers,
        targetScale: scale,
        format,
        quality,
      });

      setExportedUrl(dataUrl);

      // Trigger actual file download
      const filename = `${project.title.toLowerCase().replace(/\s+/g, '_')}_pixelab_${Date.now()}.${
        format === 'image/png' ? 'png' : 'jpg'
      }`;

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const mbSize = (blob.size / (1024 * 1024)).toFixed(2);
      setFileSizeEstimate(`${mbSize} MB`);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error al exportar:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && exportedUrl) {
      try {
        await navigator.share({
          title: `PIXELAB - ${project.title}`,
          text: 'Edición fotográfica creada con PIXELAB AI Photo Editor',
          url: window.location.href,
        });
      } catch (e) {
        console.log('Share canceled or not supported');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#121215] select-none text-white">
      {/* Top Bar */}
      <header className="px-4 py-2.5 flex items-center justify-between border-b border-white/5 shrink-0 bg-[#161420]">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-95 transition-all text-neutral-300"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-sm font-bold text-white tracking-wide">Exportar Imagen</h1>
        <div className="w-8" />
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
        {/* Preview Container */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center shadow-2xl">
          <img
            src={exportedUrl || project.imageSrc}
            alt="Export preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono text-neutral-300 border border-white/10">
            {currentW} × {currentH} px
          </div>
          <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full bg-[#8B5CF6]/80 text-[10px] font-bold text-white shadow">
            {format === 'image/png' ? 'PNG Sin Pérdida' : 'JPEG'}
          </div>
        </div>

        {/* Export Options Form */}
        <div className="space-y-3.5 bg-[#1A1A22] p-4 rounded-2xl border border-white/5">
          {/* Formato */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 mb-2 block">
              Formato de Archivo
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFormat('image/jpeg')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  format === 'image/jpeg'
                    ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-[#A78BFA]'
                    : 'bg-[#252530] border-transparent text-neutral-400 hover:text-white'
                }`}
                type="button"
              >
                JPEG (Foto Estándar)
              </button>
              <button
                onClick={() => setFormat('image/png')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  format === 'image/png'
                    ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-[#A78BFA]'
                    : 'bg-[#252530] border-transparent text-neutral-400 hover:text-white'
                }`}
                type="button"
              >
                PNG (Máxima Fidelidad)
              </button>
            </div>
          </div>

          {/* Resolución */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 mb-2 block">
              Resolución & Escala
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { s: 1, label: '1x Normal', desc: '1080p' },
                { s: 2, label: '2x HD', desc: '2160p' },
                { s: 4, label: '4K Ultra', desc: '4320p' },
              ].map((opt) => (
                <button
                  key={opt.s}
                  onClick={() => setScale(opt.s)}
                  className={`py-2 px-2 rounded-xl text-center border transition-all cursor-pointer ${
                    scale === opt.s
                      ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-[#A78BFA]'
                      : 'bg-[#252530] border-transparent text-neutral-400 hover:text-white'
                  }`}
                  type="button"
                >
                  <span className="block text-xs font-bold">{opt.label}</span>
                  <span className="text-[9px] text-neutral-400">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Calidad (for JPEG) */}
          {format === 'image/jpeg' && (
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-neutral-300">Calidad de compresión</span>
                <span className="font-mono text-[#A78BFA]">{Math.round(quality * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.0"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full accent-[#8B5CF6] cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Primary Export Button */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full py-3.5 rounded-full bg-[#8B5CF6] hover:bg-[#7C3AED] active:scale-[0.98] transition-all font-semibold text-white text-sm shadow-xl glow-purple flex items-center justify-center space-x-2 cursor-pointer"
          type="button"
        >
          {isExporting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Procesando imagen con Canvas 4K...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 stroke-[2.4]" />
              <span>Guardar en Dispositivo</span>
            </>
          )}
        </button>
      </div>

      {/* Success Modal / Toast */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1A1824] rounded-3xl p-6 border border-[#8B5CF6]/40 shadow-2xl flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">¡Fotografía Guardada!</h3>
              <p className="text-xs text-neutral-300 mt-1">
                La imagen procesada se descargó exitosamente con resolución de {currentW} × {currentH} px ({fileSizeEstimate}).
              </p>
            </div>

            <div className="w-full grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleShare}
                className="py-2.5 px-3 rounded-xl bg-[#252530] hover:bg-[#30303D] text-xs font-semibold text-white flex items-center justify-center space-x-1.5 cursor-pointer"
                type="button"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Compartir</span>
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onGoHome();
                }}
                className="py-2.5 px-3 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-xs font-bold text-white shadow cursor-pointer"
                type="button"
              >
                Volver a Inicio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
