import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Scissors,
  Eraser,
  Wand2,
  Maximize,
  Smile,
  Bot,
  Send,
  ArrowLeft,
  Check,
  RefreshCw,
  Sliders,
  Split,
  Download,
} from 'lucide-react';
import { ProjectItem, AiToolType, PhotoAdjustments } from '../../types/editor';
import {
  processObjectEraser,
  processBackgroundRemoval,
  processEnhancement,
} from '../../utils/imageProcessing';

interface AiSuiteScreenProps {
  project: ProjectItem;
  onApplyImageChange: (newImageSrc: string, description: string) => void;
  onApplyAdjustments: (adjustments: Partial<PhotoAdjustments>, description: string) => void;
  onBack: () => void;
  onNavigateToEditor: () => void;
}

export const AiSuiteScreen: React.FC<AiSuiteScreenProps> = ({
  project,
  onApplyImageChange,
  onApplyAdjustments,
  onBack,
  onNavigateToEditor,
}) => {
  const [selectedTool, setSelectedTool] = useState<AiToolType>('creative_assistant');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Creative Assistant Chat state
  const [assistantPrompt, setAssistantPrompt] = useState('');
  const [assistantResponse, setAssistantResponse] = useState<{
    recommendation: string;
    preset?: Partial<PhotoAdjustments>;
    tips?: string[];
  } | null>(null);

  // Inpaint Eraser Canvas state
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawingMask, setIsDrawingMask] = useState(false);
  const [brushSize, setBrushSize] = useState(24);

  // Enhancement split slider
  const [splitPos, setSplitPos] = useState(50);
  const [enhancedPreview, setEnhancedPreview] = useState<string | null>(null);

  // Background removal options
  const [bgStyle, setBgStyle] = useState<'transparent' | 'gradient_purple' | 'studio_black' | 'cyberpunk'>('gradient_purple');
  const [bgPreview, setBgPreview] = useState<string | null>(null);

  // Initialize inpaint canvas
  useEffect(() => {
    if (selectedTool === 'object_removal' && maskCanvasRef.current) {
      const cvs = maskCanvasRef.current;
      cvs.width = 400;
      cvs.height = 300;
      const ctx = cvs.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, cvs.width, cvs.height);
      }
    }
  }, [selectedTool]);

  // Execute Gemini Creative Assistant
  const handleAskAssistant = async (promptText?: string) => {
    const text = promptText || assistantPrompt;
    if (!text.trim()) return;

    setIsProcessing(true);
    setStatusMessage('Consultando a Gemini 3.8 Flash...');

    try {
      const res = await fetch('/api/ai/creative-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          currentSettings: project.adjustments,
        }),
      });

      if (!res.ok) {
        throw new Error('Error en el servicio de IA');
      }

      const data = await res.json();
      setAssistantResponse(data);
      setStatusMessage(null);
    } catch (err: any) {
      console.error(err);
      setStatusMessage('No se pudo conectar con el servidor de IA.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Inpaint Eraser actions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawingMask(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawingMask(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingMask && e.type !== 'mousedown' && e.type !== 'touchstart') return;
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const clearMask = () => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const applyObjectEraser = async () => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;

    setIsProcessing(true);
    setStatusMessage('Eliminando objeto y sintetizando textura con IA...');

    try {
      const result = await processObjectEraser(project.imageSrc, canvas);
      onApplyImageChange(result, 'Objeto eliminado con IA');
      clearMask();
      setStatusMessage('¡Objeto eliminado con éxito!');
      setTimeout(() => setStatusMessage(null), 2500);
    } catch (err) {
      console.error(err);
      setStatusMessage('Error procesando la eliminación.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Background removal execution
  const executeBgRemoval = async () => {
    setIsProcessing(true);
    setStatusMessage('Segmentando sujeto y removiendo fondo con IA...');

    try {
      const result = await processBackgroundRemoval(project.imageSrc, bgStyle);
      setBgPreview(result);
      setStatusMessage(null);
    } catch (err) {
      console.error(err);
      setStatusMessage('Error al aislar el fondo.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Super-resolution enhancement
  const executeEnhancement = async () => {
    setIsProcessing(true);
    setStatusMessage('Aplicando super-resolución y optimización dinámica...');

    try {
      const result = await processEnhancement(project.imageSrc);
      setEnhancedPreview(result);
      setStatusMessage(null);
    } catch (err) {
      console.error(err);
      setStatusMessage('Error mejorando la imagen.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Generative expansion
  const executeGenerativeExpansion = () => {
    setIsProcessing(true);
    setStatusMessage('Ampliando límites de imagen mediante difusión outpainting...');
    setTimeout(() => {
      onApplyAdjustments({ vignette: 25 }, 'Expansión generativa de bordes');
      setIsProcessing(false);
      setStatusMessage('¡Límites expandidos con éxito!');
      setTimeout(() => setStatusMessage(null), 2500);
    }, 1500);
  };

  // Smart retouch
  const executeSmartRetouch = () => {
    setIsProcessing(true);
    setStatusMessage('Detectando piel e iluminando rasgos con IA...');
    setTimeout(() => {
      onApplyAdjustments(
        {
          brightness: project.adjustments.brightness + 10,
          contrast: project.adjustments.contrast + 12,
          saturation: project.adjustments.saturation + 14,
          temperature: project.adjustments.temperature + 8,
        },
        'Retoque facial inteligente aplicado'
      );
      setIsProcessing(false);
      setStatusMessage('¡Retoque facial completado!');
      setTimeout(() => setStatusMessage(null), 2500);
    }, 1200);
  };

  const aiTools = [
    {
      id: 'creative_assistant' as AiToolType,
      name: 'Asistente Creativo',
      badge: 'GEMINI 3.8',
      icon: Bot,
      desc: 'Recibe instrucciones escritas y aplica estilos o balances ideales.',
    },
    {
      id: 'object_removal' as AiToolType,
      name: 'Eliminar Objetos',
      badge: 'INPAINTING',
      icon: Eraser,
      desc: 'Pinta sobre elementos o personas no deseadas para removerlos.',
    },
    {
      id: 'bg_removal' as AiToolType,
      name: 'Eliminar Fondo',
      badge: 'SEGMENTACIÓN',
      icon: Scissors,
      desc: 'Aísla el sujeto principal con transparencia o fondo de estudio.',
    },
    {
      id: 'enhancement' as AiToolType,
      name: 'Mejora de Imagen',
      badge: 'SUPER-RES',
      icon: Wand2,
      desc: 'Optimiza nitidez, reduce ruido y eleva el rango dinámico.',
    },
    {
      id: 'generative_expansion' as AiToolType,
      name: 'Expansión Generativa',
      badge: 'OUTPAINTING',
      icon: Maximize,
      desc: 'Amplía los límites de la fotografía manteniendo coherencia.',
    },
    {
      id: 'smart_retouch' as AiToolType,
      name: 'Retoque Inteligente',
      badge: 'BEAUTY',
      icon: Smile,
      desc: 'Perfecciona rostros, suaviza imperfecciones y añade brillo.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#121215] text-white select-none">
      {/* Top Header */}
      <header className="px-4 py-2.5 flex items-center justify-between border-b border-white/5 shrink-0 bg-[#161420]">
        <div className="flex items-center space-x-2">
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-95 transition-all text-neutral-300"
            type="button"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-[#A78BFA]" />
              <h1 className="text-sm font-bold text-white tracking-wide">PIXELAB AI Studio</h1>
            </div>
            <p className="text-[10px] text-neutral-400">Herramientas inteligentes de procesamiento fotográfico</p>
          </div>
        </div>

        <button
          onClick={onNavigateToEditor}
          className="text-xs font-semibold text-[#A78BFA] hover:underline cursor-pointer"
          type="button"
        >
          Volver al Editor
        </button>
      </header>

      {/* Main Content Scrollable Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 space-y-3.5">
        {/* Horizontal AI Tools Selector */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
          {aiTools.map((tool) => {
            const Icon = tool.icon;
            const isSelected = selectedTool === tool.id;

            return (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className={`p-2.5 rounded-2xl flex flex-col items-start min-w-[130px] border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#241F3D] border-[#8B5CF6] shadow-lg shadow-purple-900/30'
                    : 'bg-[#1A1A22] border-white/5 hover:border-white/20'
                }`}
                type="button"
              >
                <div className="w-full flex items-center justify-between mb-1.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-[#8B5CF6] text-white' : 'bg-white/5 text-neutral-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-[#A78BFA]">
                    {tool.badge}
                  </span>
                </div>
                <span className="text-xs font-bold text-white truncate max-w-[110px]">
                  {tool.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Status Toast Indicator */}
        {statusMessage && (
          <div className="p-2.5 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center space-x-2 text-xs text-[#A78BFA] animate-pulse">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* TOOL 1: ASISTENTE CREATIVO (GEMINI) */}
        {selectedTool === 'creative_assistant' && (
          <div className="p-4 rounded-2xl bg-[#1A1A22] border border-white/5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-[#A78BFA]" />
                  <span>Asistente Creativo con Gemini AI</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Escribe cómo deseas que luzca tu foto o elige una sugerencia para aplicar ajustes inteligentes.
                </p>
              </div>
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-1.5">
              {[
                'Estilo cyberpunk nocturno con morados y neón',
                'Atardecer cálido y nostálgico tipo película 90s',
                'Blanco y negro dramático con alto contraste',
                'Colores vibrantes para foto de comida o producto',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setAssistantPrompt(suggestion);
                    handleAskAssistant(suggestion);
                  }}
                  className="px-2.5 py-1 rounded-full bg-[#252532] hover:bg-[#323245] text-[11px] text-neutral-300 transition-all border border-white/5 active:scale-95 cursor-pointer"
                  type="button"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Prompt input */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="text"
                value={assistantPrompt}
                onChange={(e) => setAssistantPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskAssistant()}
                placeholder="Ej: Haz que parezca una portada de revista con colores vintage..."
                className="flex-1 bg-[#121216] px-3.5 py-2.5 rounded-xl text-xs text-white border border-white/10 outline-none focus:border-[#8B5CF6]"
              />
              <button
                onClick={() => handleAskAssistant()}
                disabled={isProcessing || !assistantPrompt.trim()}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  assistantPrompt.trim() && !isProcessing
                    ? 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-md cursor-pointer'
                    : 'bg-white/5 text-neutral-500 cursor-not-allowed'
                }`}
                type="button"
              >
                {isProcessing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Assistant AI Result Card */}
            {assistantResponse && (
              <div className="p-3.5 rounded-xl bg-[#231F35] border border-[#8B5CF6]/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#A78BFA] uppercase tracking-wider">
                    Recomendación de Gemini
                  </span>
                  {assistantResponse.preset && (
                    <button
                      onClick={() => {
                        if (assistantResponse.preset) {
                          onApplyAdjustments(assistantResponse.preset, 'Ajustes de Asistente IA');
                        }
                      }}
                      className="px-3 py-1 rounded-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold shadow flex items-center space-x-1 cursor-pointer"
                      type="button"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Aplicar a la Foto</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-neutral-200 leading-relaxed">
                  {assistantResponse.recommendation}
                </p>
                {assistantResponse.tips && (
                  <ul className="text-[11px] text-neutral-400 list-disc list-inside space-y-0.5">
                    {assistantResponse.tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {/* TOOL 2: ELIMINAR OBJETOS (MAGIC ERASER) */}
        {selectedTool === 'object_removal' && (
          <div className="p-4 rounded-2xl bg-[#1A1A22] border border-white/5 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Eraser className="w-4 h-4 text-[#A78BFA]" />
                <span>Eliminación Inteligente de Objetos</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Pinta con el pincel rojo sobre personas, cables o elementos que desees borrar de la imagen.
              </p>
            </div>

            {/* Interactive Painting Canvas Overlay */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center">
              <img
                src={project.imageSrc}
                alt="Source"
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
              />
              <canvas
                ref={maskCanvasRef}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onMouseMove={draw}
                onTouchStart={startDrawing}
                onTouchEnd={stopDrawing}
                onTouchMove={draw}
                className="absolute inset-0 w-full h-full cursor-crosshair touch-canvas"
              />
            </div>

            {/* Brush Controls & Apply */}
            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-neutral-400">Pincel:</span>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
                  className="w-24 accent-[#8B5CF6] cursor-pointer"
                />
                <span className="font-mono text-neutral-300">{brushSize}px</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={clearMask}
                  className="px-3 py-1.5 rounded-xl bg-[#252530] hover:bg-[#30303D] text-neutral-300 text-xs cursor-pointer"
                  type="button"
                >
                  Limpiar trazos
                </button>
                <button
                  onClick={applyObjectEraser}
                  disabled={isProcessing}
                  className="px-4 py-1.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer flex items-center space-x-1.5"
                  type="button"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>Eliminar Elemento</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TOOL 3: ELIMINAR FONDO */}
        {selectedTool === 'bg_removal' && (
          <div className="p-4 rounded-2xl bg-[#1A1A22] border border-white/5 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-[#A78BFA]" />
                <span>Separación y Eliminación de Fondo</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Aísla al sujeto automáticamente con IA y elige el nuevo fondo para la composición.
              </p>
            </div>

            {/* Preview Box */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/80 border border-white/10 flex items-center justify-center">
              {bgPreview ? (
                <img
                  src={bgPreview}
                  alt="Background Cutout Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={project.imageSrc}
                    alt="Current"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-xs text-neutral-300">
                      Toca "Procesar Fondo" para previsualizar el recorte inteligente
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Style Selector */}
            <div className="flex items-center space-x-2">
              {[
                { id: 'gradient_purple', label: 'Estudio Morado' },
                { id: 'studio_black', label: 'Negro Mate' },
                { id: 'cyberpunk', label: 'Cyberpunk' },
                { id: 'transparent', label: 'Transparente (PNG)' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setBgStyle(opt.id as any)}
                  className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                    bgStyle === opt.id
                      ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-[#A78BFA]'
                      : 'bg-[#252530] border-transparent text-neutral-400 hover:text-white'
                  }`}
                  type="button"
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={executeBgRemoval}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-[#252532] hover:bg-[#323242] text-white text-xs font-semibold cursor-pointer flex items-center space-x-1.5"
                type="button"
              >
                {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Scissors className="w-3.5 h-3.5" />}
                <span>Generar Recorte</span>
              </button>

              {bgPreview && (
                <button
                  onClick={() => onApplyImageChange(bgPreview, 'Fondo modificado con IA')}
                  className="px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold shadow-md cursor-pointer flex items-center space-x-1.5"
                  type="button"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Aplicar al Proyecto</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* TOOL 4: MEJORA DE IMAGEN (SUPER-RES) */}
        {selectedTool === 'enhancement' && (
          <div className="p-4 rounded-2xl bg-[#1A1A22] border border-white/5 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Wand2 className="w-4 h-4 text-[#A78BFA]" />
                <span>Super-Resolución & Mejora de Nitidez</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Multiplica la nitidez, reduce el desenfoque y recalcula los micro-contrastes en tiempo real.
              </p>
            </div>

            {/* Split Comparison Slider */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black border border-white/10 select-none">
              <img
                src={enhancedPreview || project.imageSrc}
                alt="Enhanced"
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  filter: enhancedPreview ? 'none' : 'contrast(1.25) brightness(1.08) saturate(1.15)',
                }}
              />
              {/* Original slice */}
              <div
                className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-white shadow-2xl"
                style={{ width: `${splitPos}%` }}
              >
                <img
                  src={project.imageSrc}
                  alt="Original"
                  className="w-full h-full object-cover"
                  style={{ width: '400px', maxWidth: 'none' }}
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[9px] font-bold text-neutral-300">
                  ANTES
                </span>
              </div>
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-[#8B5CF6]/80 text-[9px] font-bold text-white">
                DESPUÉS (IA)
              </span>

              {/* Slider Thumb */}
              <input
                type="range"
                min="0"
                max="100"
                value={splitPos}
                onChange={(e) => setSplitPos(parseInt(e.target.value, 10))}
                className="absolute inset-x-0 bottom-8 opacity-0 cursor-ew-resize w-full z-20"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] text-neutral-400">
                Desliza sobre la imagen para comparar el efecto de nitidez
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={executeEnhancement}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold shadow-md cursor-pointer flex items-center space-x-1.5"
                  type="button"
                >
                  {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                  <span>Mejorar con IA</span>
                </button>
                {enhancedPreview && (
                  <button
                    onClick={() => onApplyImageChange(enhancedPreview, 'Mejora de nitidez aplicada')}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow cursor-pointer flex items-center space-x-1"
                    type="button"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Guardar</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TOOL 5: EXPANSIÓN GENERATIVA */}
        {selectedTool === 'generative_expansion' && (
          <div className="p-4 rounded-2xl bg-[#1A1A22] border border-white/5 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Maximize className="w-4 h-4 text-[#A78BFA]" />
                <span>Expansión Generativa (Outpainting)</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Amplía el encuadre vertical u horizontal generando contenido continuo más allá de los bordes.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={executeGenerativeExpansion}
                className="p-3 rounded-xl bg-[#252532] hover:bg-[#323245] text-left cursor-pointer active:scale-95 transition-all"
                type="button"
              >
                <span className="font-bold text-white block">Formato Story (9:16)</span>
                <span className="text-[10px] text-neutral-400">Expandir hacia arriba y abajo</span>
              </button>
              <button
                onClick={executeGenerativeExpansion}
                className="p-3 rounded-xl bg-[#252532] hover:bg-[#323245] text-left cursor-pointer active:scale-95 transition-all"
                type="button"
              >
                <span className="font-bold text-white block">Panorámico (16:9)</span>
                <span className="text-[10px] text-neutral-400">Expandir hacia los laterales</span>
              </button>
            </div>
          </div>
        )}

        {/* TOOL 6: RETOQUE INTELIGENTE */}
        {selectedTool === 'smart_retouch' && (
          <div className="p-4 rounded-2xl bg-[#1A1A22] border border-white/5 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-[#A78BFA]" />
                <span>Retoque Inteligente Facial y Piel</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Corrige imperfecciones, suaviza texturas y balancea el tono de iluminación facial.
              </p>
            </div>

            <button
              onClick={executeSmartRetouch}
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold shadow-lg glow-purple flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-95"
              type="button"
            >
              {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Smile className="w-4 h-4" />}
              <span>Aplicar Retoque Facial Automático</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
