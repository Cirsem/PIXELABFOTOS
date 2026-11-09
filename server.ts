import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Creative Assistant Endpoint
app.post('/api/ai/creative-assistant', async (req: Request, res: Response) => {
  try {
    const { prompt, currentSettings } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'El mensaje o instrucción es requerido.' });
    }

    if (!ai) {
      // Smart offline fallback preset generator when API key is not yet set
      const p = prompt.toLowerCase();
      let preset = {
        brightness: 12,
        contrast: 15,
        saturation: 25,
        temperature: 10,
        exposure: 5,
        filter: 'cyber_purple',
        vignette: 20,
        blur: 0,
      };

      if (p.includes('vintage') || p.includes('retro') || p.includes('antiguo')) {
        preset = { brightness: 5, contrast: -10, saturation: -20, temperature: 25, exposure: -5, filter: 'vintage', vignette: 35, blur: 0 };
      } else if (p.includes('dramatico') || p.includes('dramático') || p.includes('cine') || p.includes('nocturno')) {
        preset = { brightness: -10, contrast: 30, saturation: -15, temperature: -15, exposure: -10, filter: 'cinematic', vignette: 40, blur: 0 };
      } else if (p.includes('blanco y negro') || p.includes('b&w') || p.includes('monocromo')) {
        preset = { brightness: 5, contrast: 25, saturation: -100, temperature: 0, exposure: 0, filter: 'monochrome', vignette: 25, blur: 0 };
      } else if (p.includes('atardecer') || p.includes('sunset') || p.includes('morado') || p.includes('purple')) {
        preset = { brightness: 15, contrast: 18, saturation: 35, temperature: 15, exposure: 8, filter: 'cyber_purple', vignette: 15, blur: 0 };
      } else if (p.includes('calido') || p.includes('cálido') || p.includes('sol')) {
        preset = { brightness: 10, contrast: 10, saturation: 20, temperature: 30, exposure: 5, filter: 'warm_glow', vignette: 10, blur: 0 };
      }

      return res.json({
        recommendation: `Para lograr "${prompt}", optimicé el balance cromático ajustando la calidez, la saturación y el contraste para dar un acabado profesional e impactante.`,
        preset,
        tips: [
          'Añade una viñeta sutil para centrar la atención en el sujeto principal.',
          'Puedes superponer capas de texto o stickers con tipografía minimalista.',
          'Usa el botón "Comparar" para revisar la diferencia con el original.',
        ],
      });
    }

    const systemInstruction = `Eres el Asistente Creativo Inteligente de PIXELAB, una app móvil profesional de edición de fotos con IA inspirada en Photoshop y CapCut.
Analiza la solicitud del usuario y recomienda valores óptimos de ajuste fotográfico en formato JSON.
Los rangos numéricos son:
- brightness: -50 a 50
- contrast: -50 a 50
- saturation: -50 a 50
- temperature: -50 a 50
- exposure: -50 a 50
- vignette: 0 a 100
- filter: uno de ['none', 'cyber_purple', 'sunset_glow', 'cinematic', 'vintage', 'monochrome', 'vibrant', 'vaporwave', 'emerald']

Responde ÚNICAMENTE en formato JSON con la siguiente estructura:
{
  "recommendation": "Explicación breve y profesional en español de las mejoras sugeridas",
  "preset": {
    "brightness": number,
    "contrast": number,
    "saturation": number,
    "temperature": number,
    "exposure": number,
    "vignette": number,
    "filter": string
  },
  "tips": ["Consejo 1", "Consejo 2"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Solicitud del usuario: "${prompt}". Ajustes actuales: ${JSON.stringify(currentSettings || {})}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in creative assistant:', error);
    return res.status(500).json({
      error: 'Error procesando la recomendación de IA',
      details: error.message,
    });
  }
});

// Start server with Vite middleware in dev or static files in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PIXELAB Server running on port ${PORT}`);
  });
}

startServer();
