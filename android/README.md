# PIXELAB — PROYECTO NATIVO ANDROID STUDIO

Editor fotográfico móvil profesional que combina herramientas de edición avanzadas con inteligencia artificial.

## 🛠️ Tecnologías y Arquitectura
- **Lenguaje:** Kotlin 2.0+
- **Interfaz Gráfica:** Jetpack Compose + Material Design 3
- **Arquitectura:** MVVM (Model-View-ViewModel) con StateFlow y Corrutinas
- **Navegación:** Navigation Compose
- **Base de Datos:** Room Database con KSP
- **Gestión de Imágenes:** Android Photo Picker y ColorMatrix en Bitmap

## 📁 Estructura
- \`app/src/main/java/com/pixelab/app/\`
  - \`MainActivity.kt\`
  - \`ui/theme/\`: Colores (#171717, #252525, #8B5CF6, #BDBDBD), tipografía Roboto
  - \`ui/screens/\`:
    - \`HomeScreen.kt\` (Pantalla 1: Inicio)
    - \`GalleryScreen.kt\` (Pantalla 2: Galería / Photo Picker)
    - \`EditorScreen.kt\` (Pantalla 3: Editor Fotográfico)
    - \`PixelabAiScreen.kt\` (Pantalla 4: Pixelab AI)
    - \`ExportScreen.kt\` (Pantalla 5: Exportar)
  - \`viewmodel/\`: \`EditorViewModel.kt\`, \`HomeViewModel.kt\`
  - \`data/\`: \`AppDatabase.kt\`, \`ProjectDao.kt\`, \`ProjectEntity.kt\`
  - \`utils/\`: \`ImageProcessor.kt\`

## 🚀 Cómo abrir en Android Studio
1. Abre Android Studio.
2. Selecciona "Open" y elige la carpeta \`/android\`.
3. Sincroniza Gradle y ejecuta la app en un emulador o dispositivo físico.
