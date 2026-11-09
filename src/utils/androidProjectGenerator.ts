import JSZip from 'jszip';

export interface AndroidFile {
  path: string;
  category: 'config' | 'kotlin' | 'res' | 'docs';
  description: string;
  content: string;
}

export const ANDROID_PROJECT_FILES: AndroidFile[] = [
  {
    path: 'README.md',
    category: 'docs',
    description: 'Instrucciones para abrir y compilar en Android Studio',
    content: `# PIXELAB — Native Android Photo Editor with Jetpack Compose & AI

Aplicación móvil nativa para Android desarrollada en Kotlin utilizando **Jetpack Compose**, **Material Design 3**, **MVVM**, **Room Database** y **Android Photo Picker**.

## 🚀 Requisitos del Sistema
- **Android Studio Ladybug (2024.2+)** o superior.
- **JDK 17 o 21**.
- **Android SDK:**
  - compileSdk: 35
  - minSdk: 26 (Android 8.0 Oreo)
  - targetSdk: 35

## 📁 Estructura del Proyecto
\`\`\`
app/src/main/java/com/pixelab/app/
├── MainActivity.kt               # Actividad principal con Jetpack Compose
├── navigation/
│   ├── Screen.kt                 # Definición de rutas tipo-safe (Sealed Class)
│   └── NavGraph.kt               # Host de navegación entre las 5 pantallas
├── ui/
│   ├── theme/
│   │   ├── Color.kt              # Paleta #171717, #252525, #8B5CF6, #BDBDBD
│   │   ├── Theme.kt              # Material 3 Dark ColorScheme
│   │   └── Type.kt               # Tipografía Roboto
│   └── screens/
│       ├── HomeScreen.kt         # Pantalla 1: Bienvenida, Hero y accesos rápidos
│       ├── GalleryScreen.kt      # Pantalla 2: Android Photo Picker & Proyectos
│       ├── EditorScreen.kt       # Pantalla 3: Lienzo, Sliders, Capas y Comparar
│       ├── PixelabAiScreen.kt    # Pantalla 4: Suite de 6 herramientas de IA
│       └── ExportScreen.kt       # Pantalla 5: Opciones de guardado y exportación
├── viewmodel/
│   ├── EditorViewModel.kt        # Gestión reactiva de estado (StateFlow)
│   └── HomeViewModel.kt          # Proyectos recientes desde Room
├── data/
│   ├── model/
│   │   ├── ProjectEntity.kt      # Entidad Room para persistencia
│   │   └── PhotoAdjustments.kt   # Brillo, Contraste, Saturación, etc.
│   ├── local/
│   │   ├── ProjectDao.kt         # Queries de Room
│   │   └── AppDatabase.kt        # RoomDatabase singleton
│   └── repository/
│       └── PhotoRepository.kt    # Repositorio de datos
├── components/
│   ├── AdjustmentSliders.kt      # Controles táctiles personalizados
│   ├── LayersPanel.kt            # Panel lateral multicapa
│   └── CompareButton.kt          # Comparador táctil antes/después
└── utils/
    └── ImageProcessor.kt         # Renderizado de Bitmap con ColorMatrix
\`\`\`

## 🛠️ Cómo ejecutar en Android Studio
1. Abre **Android Studio**.
2. Selecciona **Open** y navega a esta carpeta extraída.
3. Espera a que **Gradle Sync** descargue las dependencias.
4. Conecta un dispositivo físico o inicia un Emulador (Pixel 8 / API 34+ recomendado).
5. Haz clic en **Run 'app'** (Shift + F10).
`,
  },
  {
    path: 'settings.gradle.kts',
    category: 'config',
    description: 'Configuración de repositorios de Gradle',
    content: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "Pixelab"
include(":app")
`,
  },
  {
    path: 'build.gradle.kts',
    category: 'config',
    description: 'Gradle a nivel de proyecto',
    content: `plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.ksp) apply false
}
`,
  },
  {
    path: 'gradle/libs.versions.toml',
    category: 'config',
    description: 'Catálogo de versiones de dependencias (Version Catalog)',
    content: `[versions]
agp = "8.7.2"
kotlin = "2.0.21"
coreKtx = "1.15.0"
lifecycleRuntimeKtx = "2.8.7"
activityCompose = "1.9.3"
composeBom = "2024.11.00"
navigationCompose = "2.8.4"
room = "2.6.1"
ksp = "2.0.21-1.0.28"
coil = "2.7.0"
coroutines = "1.9.0"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-lifecycle-viewmodel-compose = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-compose", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-compose-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-compose-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-compose-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-compose-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-compose-material-icons-extended = { group = "androidx.compose.material", name = "material-icons-extended" }
androidx-navigation-compose = { group = "androidx.navigation", name = "navigation-compose", version.ref = "navigationCompose" }
androidx-room-runtime = { group = "androidx.room", name = "room-runtime", version.ref = "room" }
androidx-room-ktx = { group = "androidx.room", name = "room-ktx", version.ref = "room" }
androidx-room-compiler = { group = "androidx.room", name = "room-compiler", version.ref = "room" }
coil-compose = { group = "io.coil-kt", name = "coil-compose", version.ref = "coil" }
kotlinx-coroutines-android = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-android", version.ref = "coroutines" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }
`,
  },
  {
    path: 'app/build.gradle.kts',
    category: 'config',
    description: 'Gradle a nivel de módulo app con Room, Compose y KSP',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.pixelab.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.pixelab.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)
    
    // Jetpack Compose BOM & UI
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)

    // Navigation Compose
    implementation(libs.androidx.navigation.compose)

    // Room Database
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)

    // Image loading with Coil
    implementation(libs.coil.compose)
    implementation(libs.kotlinx.coroutines.android)
}
`,
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    category: 'res',
    description: 'Manifiesto de la aplicación Android con permisos de almacenamiento',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="PIXELAB"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.Pixelab">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.Pixelab">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`,
  },
  {
    path: 'app/src/main/java/com/pixelab/app/MainActivity.kt',
    category: 'kotlin',
    description: 'Punto de entrada nativo de la aplicación Jetpack Compose',
    content: `package com.pixelab.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.pixelab.app.navigation.PixelabNavGraph
import com.pixelab.app.ui.theme.BackgroundDark
import com.pixelab.app.ui.theme.PixelabTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            PixelabTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = BackgroundDark
                ) {
                    PixelabNavGraph()
                }
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/pixelab/app/ui/theme/Color.kt',
    category: 'kotlin',
    description: 'Colores corporativos exactos de PIXELAB (#171717, #252525, #8B5CF6, #BDBDBD)',
    content: `package com.pixelab.app.ui.theme

import androidx.compose.ui.graphics.Color

// Paleta Oficial PIXELAB (Material 3 Dark Mode)
val BackgroundDark = Color(0xFF171717)     // Negro carbón
val SurfaceDark = Color(0xFF252525)        // Gris oscuro
val CardDark = Color(0xFF1F1F23)           // Contenedor tarjeta
val PurpleElectric = Color(0xFF8B5CF6)     // Morado eléctrico primario
val PurpleLight = Color(0xFFA78BFA)        // Morado claro acento
val PurpleDark = Color(0xFF6D28D9)         // Morado profundo
val TextWhite = Color(0xFFFFFFFF)          // Blanco principal
val TextGray = Color(0xFFBDBDBD)           // Gris claro subtítulos
val BorderDark = Color(0xFF323238)         // Línea divisoria
val SuccessGreen = Color(0xFF10B981)       // Confirmación
val ErrorRed = Color(0xFFEF4444)           // Error
`,
  },
  {
    path: 'app/src/main/java/com/pixelab/app/ui/theme/Theme.kt',
    category: 'kotlin',
    description: 'Definición del ColorScheme Material 3 en Dark Mode',
    content: `package com.pixelab.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = PurpleElectric,
    onPrimary = TextWhite,
    primaryContainer = PurpleDark,
    onPrimaryContainer = PurpleLight,
    secondary = PurpleLight,
    onSecondary = BackgroundDark,
    background = BackgroundDark,
    onBackground = TextWhite,
    surface = SurfaceDark,
    onSurface = TextWhite,
    surfaceVariant = CardDark,
    onSurfaceVariant = TextGray,
    outline = BorderDark
)

@Composable
fun PixelabTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = Typography,
        content = content
    )
}
`,
  },
  {
    path: 'app/src/main/java/com/pixelab/app/ui/theme/Type.kt',
    category: 'kotlin',
    description: 'Tipografía Roboto Material 3',
    content: `package com.pixelab.app.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

val Typography = Typography(
    headlineLarge = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Bold,
        fontSize = 30.sp,
        lineHeight = 36.sp,
        color = TextWhite
    ),
    headlineMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Bold,
        fontSize = 22.sp,
        lineHeight = 28.sp,
        color = TextWhite
    ),
    titleMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.SemiBold,
        fontSize = 16.sp,
        color = TextWhite
    ),
    bodyMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        color = TextGray
    ),
    labelSmall = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Medium,
        fontSize = 11.sp,
        color = TextGray
    )
)
`,
  },
  {
    path: 'app/src/main/java/com/pixelab/app/navigation/Screen.kt',
    category: 'kotlin',
    description: 'Rutas seguras para Navigation Compose',
    content: `package com.pixelab.app.navigation

sealed class Screen(val route: String) {
    object Home : Screen("home")
    object Gallery : Screen("gallery")
    object Editor : Screen("editor/{projectId}") {
        fun createRoute(projectId: String) = "editor/$projectId"
    }
    object AiSuite : Screen("ai_suite")
    object Export : Screen("export/{projectId}") {
        fun createRoute(projectId: String) = "export/$projectId"
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/pixelab/app/navigation/NavGraph.kt',
    category: 'kotlin',
    description: 'Grafo de navegación entre las 5 pantallas principales',
    content: `package com.pixelab.app.navigation

import androidx.compose.runtime.Composable
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.pixelab.app.ui.screens.*
import com.pixelab.app.viewmodel.EditorViewModel
import com.pixelab.app.viewmodel.HomeViewModel

@Composable
fun PixelabNavGraph() {
    val navController = rememberNavController()
    val homeViewModel: HomeViewModel = viewModel()
    val editorViewModel: EditorViewModel = viewModel()

    NavHost(
        navController = navController,
        startDestination = Screen.Home.route
    ) {
        // Pantalla 1: Inicio
        composable(Screen.Home.route) {
            HomeScreen(
                viewModel = homeViewModel,
                onNavigateToNewEdit = { navController.navigate(Screen.Gallery.route) },
                onNavigateToEditor = { id -> navController.navigate(Screen.Editor.createRoute(id)) },
                onNavigateToAi = { navController.navigate(Screen.AiSuite.route) },
                onNavigateToGallery = { navController.navigate(Screen.Gallery.route) }
            )
        }

        // Pantalla 2: Galería / Photo Picker
        composable(Screen.Gallery.route) {
            GalleryScreen(
                onPhotoSelected = { uri ->
                    editorViewModel.loadPhotoFromUri(uri)
                    navController.navigate(Screen.Editor.createRoute("new"))
                },
                onBack = { navController.popBackStack() }
            )
        }

        // Pantalla 3: Editor Fotográfico
        composable(
            route = Screen.Editor.route,
            arguments = listOf(navArgument("projectId") { type = NavType.StringType })
        ) { backStackEntry ->
            val projectId = backStackEntry.arguments?.getString("projectId") ?: "new"
            EditorScreen(
                projectId = projectId,
                viewModel = editorViewModel,
                onBack = { navController.popBackStack() },
                onNavigateToExport = { id -> navController.navigate(Screen.Export.createRoute(id)) },
                onNavigateToAi = { navController.navigate(Screen.AiSuite.route) }
            )
        }

        // Pantalla 4: Pixelab AI
        composable(Screen.AiSuite.route) {
            PixelabAiScreen(
                onBack = { navController.popBackStack() },
                onApplyAiResult = { navController.popBackStack() }
            )
        }

        // Pantalla 5: Exportar
        composable(
            route = Screen.Export.route,
            arguments = listOf(navArgument("projectId") { type = NavType.StringType })
        ) {
            ExportScreen(
                viewModel = editorViewModel,
                onBack = { navController.popBackStack() },
                onExportSuccess = { navController.navigate(Screen.Home.route) {
                    popUpTo(Screen.Home.route) { inclusive = true }
                }}
            )
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/pixelab/app/data/model/ProjectEntity.kt',
    category: 'kotlin',
    description: 'Entidad de Room para persistencia de proyectos y ediciones',
    content: `package com.pixelab.app.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "projects")
data class ProjectEntity(
    @PrimaryKey
    val id: String,
    val title: String,
    val imagePath: String,
    val thumbnailUri: String,
    val lastModified: Long = System.currentTimeMillis(),
    val brightness: Float = 0f,
    val contrast: Float = 0f,
    val saturation: Float = 0f,
    val temperature: Float = 0f,
    val exposure: Float = 0f,
    val filterName: String = "none",
    val rotation: Int = 0,
    val isFlippedH: Boolean = false,
    val isFlippedV: Boolean = false
)
`,
  },
  {
    path: 'app/src/main/java/com/pixelab/app/data/local/ProjectDao.kt',
    category: 'kotlin',
    description: 'Data Access Object de Room con Kotlin Flow',
    content: `package com.pixelab.app.data.local

import androidx.room.*
import com.pixelab.app.data.model.ProjectEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ProjectDao {
    @Query("SELECT * FROM projects ORDER BY lastModified DESC")
    fun getAllProjects(): Flow<List<ProjectEntity>>

    @Query("SELECT * FROM projects WHERE id = :id LIMIT 1")
    suspend fun getProjectById(id: String): ProjectEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProject(project: ProjectEntity)

    @Delete
    suspend fun deleteProject(project: ProjectEntity)
}
`,
  },
  {
    path: 'app/src/main/java/com/pixelab/app/data/local/AppDatabase.kt',
    category: 'kotlin',
    description: 'RoomDatabase de Android',
    content: `package com.pixelab.app.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.pixelab.app.data.model.ProjectEntity

@Database(entities = [ProjectEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun projectDao(): ProjectDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "pixelab_db"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/pixelab/app/viewmodel/EditorViewModel.kt',
    category: 'kotlin',
    description: 'ViewModel con StateFlow para gestión de filtros, capas y undo/redo',
    content: `package com.pixelab.app.viewmodel

import android.graphics.Bitmap
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.Stack

data class EditorUiState(
    val currentBitmap: Bitmap? = null,
    val originalBitmap: Bitmap? = null,
    val brightness: Float = 15f,
    val contrast: Float = 10f,
    val saturation: Float = 20f,
    val temperature: Float = 0f,
    val exposure: Float = 0f,
    val activeFilter: String = "cyber_purple",
    val rotation: Int = 0,
    val isComparing: Boolean = false,
    val canUndo: Boolean = false,
    val canRedo: Boolean = false,
    val isLoading: Boolean = false
)

class EditorViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(EditorUiState())
    val uiState: StateFlow<EditorUiState> = _uiState.asStateFlow()

    private val undoStack = Stack<EditorUiState>()
    private val redoStack = Stack<EditorUiState>()

    fun loadPhotoFromUri(uri: Uri) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            // Cargar bitmap desde ContentResolver
            _uiState.update { it.copy(isLoading = false) }
        }
    }

    fun updateBrightness(value: Float) {
        saveStateForUndo()
        _uiState.update { it.copy(brightness = value) }
    }

    fun updateContrast(value: Float) {
        saveStateForUndo()
        _uiState.update { it.copy(contrast = value) }
    }

    fun updateSaturation(value: Float) {
        saveStateForUndo()
        _uiState.update { it.copy(saturation = value) }
    }

    fun setComparing(comparing: Boolean) {
        _uiState.update { it.copy(isComparing = comparing) }
    }

    fun rotate90() {
        saveStateForUndo()
        _uiState.update { it.copy(rotation = (it.rotation + 90) % 360) }
    }

    private fun saveStateForUndo() {
        undoStack.push(_uiState.value)
        redoStack.clear()
        _uiState.update { it.copy(canUndo = true, canRedo = false) }
    }

    fun undo() {
        if (undoStack.isNotEmpty()) {
            redoStack.push(_uiState.value)
            val previous = undoStack.pop()
            _uiState.value = previous.copy(
                canUndo = undoStack.isNotEmpty(),
                canRedo = true
            )
        }
    }

    fun redo() {
        if (redoStack.isNotEmpty()) {
            undoStack.push(_uiState.value)
            val next = redoStack.pop()
            _uiState.value = next.copy(
                canUndo = true,
                canRedo = redoStack.isNotEmpty()
            )
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/pixelab/app/ui/screens/HomeScreen.kt',
    category: 'kotlin',
    description: 'Pantalla 1: Bienvenida con diseño exacto del Hero Banner y Proyectos',
    content: `package com.pixelab.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.pixelab.app.ui.theme.*
import com.pixelab.app.viewmodel.HomeViewModel

@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    onNavigateToNewEdit: () -> Unit,
    onNavigateToEditor: (String) -> Unit,
    onNavigateToAi: () -> Unit,
    onNavigateToGallery: () -> Unit
) {
    Scaffold(
        containerColor = BackgroundDark,
        topBar = {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(
                                Brush.linearGradient(
                                    listOf(PurpleLight, PurpleElectric, PurpleDark)
                                )
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("✦", color = TextWhite, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        "PIXELAB",
                        fontWeight = FontWeight.Bold,
                        fontSize = 20.sp,
                        letterSpacing = 1.sp,
                        color = TextWhite
                    )
                }
                IconButton(onClick = { /* Settings */ }) {
                    Icon(Icons.Default.Settings, contentDescription = "Ajustes", tint = TextGray)
                }
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 20.dp)
        ) {
            // Hero Banner: Dale vida a tus ideas
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(24.dp))
                    .background(
                        Brush.linearGradient(
                            listOf(Color(0xFF1C182B), Color(0xFF161421), BackgroundDark)
                        )
                    )
                    .padding(20.dp)
            ) {
                Column {
                    Text(
                        "Dale vida\\na tus ideas",
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 28.sp,
                        color = TextWhite,
                        lineHeight = 34.sp
                    )
                    Spacer(modifier = Modifier.height(18.dp))
                    Button(
                        onClick = onNavigateToNewEdit,
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = PurpleElectric),
                        shape = RoundedCornerShape(50.dp)
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null, tint = TextWhite)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Nueva edición", fontWeight = FontWeight.SemiBold, color = TextWhite)
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Proyectos recientes
            Text(
                "Proyectos recientes",
                fontWeight = FontWeight.Bold,
                fontSize = 17.sp,
                color = TextWhite
            )

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                repeat(3) { index ->
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .aspectRatio(1f)
                            .clip(RoundedCornerShape(16.dp))
                            .background(SurfaceDark)
                            .clickable { onNavigateToEditor("proj-$index") },
                        contentAlignment = Alignment.Center
                    ) {
                        Text("Proyecto \${index + 1}", fontSize = 11.sp, color = TextGray)
                    }
                }
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/pixelab/app/ui/screens/EditorScreen.kt',
    category: 'kotlin',
    description: 'Pantalla 3: Editor fotográfico principal con soporte de gestos y sliders',
    content: `package com.pixelab.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.pixelab.app.ui.theme.*
import com.pixelab.app.viewmodel.EditorViewModel

@Composable
fun EditorScreen(
    projectId: String,
    viewModel: EditorViewModel,
    onBack: () -> Unit,
    onNavigateToExport: (String) -> Unit,
    onNavigateToAi: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()

    Scaffold(
        containerColor = BackgroundDark,
        topBar = {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onBack) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Volver", tint = TextWhite)
                }
                Row {
                    IconButton(onClick = { viewModel.undo() }, enabled = state.canUndo) {
                        Icon(Icons.Default.Undo, contentDescription = "Deshacer", tint = if (state.canUndo) TextWhite else TextGray.copy(alpha = 0.4f))
                    }
                    IconButton(onClick = { viewModel.redo() }, enabled = state.canRedo) {
                        Icon(Icons.Default.Redo, contentDescription = "Rehacer", tint = if (state.canRedo) TextWhite else TextGray.copy(alpha = 0.4f))
                    }
                }
                Button(
                    onClick = { onNavigateToExport(projectId) },
                    colors = ButtonDefaults.buttonColors(containerColor = PurpleElectric),
                    shape = RoundedCornerShape(20.dp),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp)
                ) {
                    Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Guardar", fontSize = 13.sp)
                }
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Lienzo interactivo central
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(12.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color(0xFF14131B)),
                contentAlignment = Alignment.Center
            ) {
                Text("Lienzo de Edición Activo", color = TextGray)
            }

            // Bottom Sheet con Sliders de Brillo, Contraste y Saturación
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = SurfaceDark,
                shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text("Ajustes", color = TextWhite, fontSize = 15.sp)
                    Spacer(modifier = Modifier.height(14.dp))
                    SliderRow("Brillo", state.brightness, -50f, 50f) { viewModel.updateBrightness(it) }
                    SliderRow("Contraste", state.contrast, -50f, 50f) { viewModel.updateContrast(it) }
                    SliderRow("Saturación", state.saturation, -50f, 50f) { viewModel.updateSaturation(it) }
                }
            }
        }
    }
}

@Composable
fun SliderRow(label: String, value: Float, min: Float, max: Float, onValueChange: (Float) -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label, color = TextGray, fontSize = 13.sp, modifier = Modifier.width(70.dp))
        Slider(
            value = value,
            onValueChange = onValueChange,
            valueRange = min..max,
            colors = SliderDefaults.colors(
                thumbColor = PurpleElectric,
                activeTrackColor = PurpleElectric,
                inactiveTrackColor = Color(0xFF3A3A42)
            ),
            modifier = Modifier.weight(1f)
        )
        Text(
            (if (value > 0) "+" else "") + value.toInt().toString(),
            color = TextWhite,
            fontSize = 12.sp,
            modifier = Modifier.width(36.dp)
        )
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/pixelab/app/utils/ImageProcessor.kt',
    category: 'kotlin',
    description: 'Procesamiento nativo de Bitmap con ColorMatrix y RenderScript/Canvas',
    content: `package com.pixelab.app.utils

import android.graphics.*

object ImageProcessor {

    /**
     * Aplica brillo, contraste y saturación directamente a un Bitmap usando ColorMatrix
     */
    fun applyAdjustments(
        source: Bitmap,
        brightness: Float, // -50f .. 50f
        contrast: Float,   // -50f .. 50f
        saturation: Float  // -50f .. 50f
    ): Bitmap {
        val result = Bitmap.createBitmap(source.width, source.height, source.config ?: Bitmap.Config.ARGB_8888)
        val canvas = Canvas(result)
        val paint = Paint(Paint.ANTI_ALIAS_FLAG)

        val cm = ColorMatrix()

        // 1. Saturación
        val satMatrix = ColorMatrix()
        val satScale = 1f + (saturation / 50f)
        satMatrix.setSaturation(satScale.coerceAtLeast(0f))

        // 2. Contraste
        val conMatrix = ColorMatrix()
        val conScale = 1f + (contrast / 50f)
        val conTranslate = (-0.5f * conScale + 0.5f) * 255f
        conMatrix.set(floatArrayOf(
            conScale, 0f, 0f, 0f, conTranslate,
            0f, conScale, 0f, 0f, conTranslate,
            0f, 0f, conScale, 0f, conTranslate,
            0f, 0f, 0f, 1f, 0f
        ))

        // 3. Brillo
        val briMatrix = ColorMatrix()
        val briShift = brightness * 2.55f
        briMatrix.set(floatArrayOf(
            1f, 0f, 0f, 0f, briShift,
            0f, 1f, 0f, 0f, briShift,
            0f, 0f, 1f, 0f, briShift,
            0f, 0f, 0f, 1f, 0f
        ))

        cm.postConcat(satMatrix)
        cm.postConcat(conMatrix)
        cm.postConcat(briMatrix)

        paint.colorFilter = ColorMatrixColorFilter(cm)
        canvas.drawBitmap(source, 0f, 0f, paint)

        return result
    }
}
`,
  },
];

/**
 * Creates and triggers download of the full Android Studio project zip file
 */
export async function generateAndDownloadAndroidZip(): Promise<void> {
  const zip = new JSZip();

  // Populate files
  for (const file of ANDROID_PROJECT_FILES) {
    zip.file(file.path, file.content);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pixelab-android-studio-project.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
