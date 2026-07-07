/**
 * LA SÚPER VIBORITA GLOTONA! 🍎🐍
 * Código JavaScript para el motor de juego infantil por niveles.
 */

// --- MOTOR DE AUDIO (Web Audio API) ---
class AudioEngine {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        // Resumir el contexto si estaba suspendido (política del navegador)
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playEat() {
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        // Deslizamiento rápido de frecuencia hacia arriba (efecto caricatura)
        osc.frequency.exponentialRampToValueAtTime(850, now + 0.12);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    playClick() {
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(250, now + 0.06);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.06);
    }

    playLevelUp() {
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        // Escala musical alegre ascendente (Do, Mi, Sol, Do)
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; 
        notes.forEach((freq, idx) => {
            const noteTime = now + idx * 0.08;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, noteTime);
            
            gain.gain.setValueAtTime(0.12, noteTime);
            gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(noteTime);
            osc.stop(noteTime + 0.25);
        });
    }

    playGameOver() {
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        // Caída dramática de tono
        osc.frequency.linearRampToValueAtTime(70, now + 0.7);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.7);
    }

    playVictory() {
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        // Melodía festiva rápida
        const notes = [
            { f: 523.25, d: 0.12 }, // Do
            { f: 523.25, d: 0.12 }, 
            { f: 523.25, d: 0.12 }, 
            { f: 659.25, d: 0.2 },  // Mi
            { f: 523.25, d: 0.12 },
            { f: 659.25, d: 0.2 }, 
            { f: 783.99, d: 0.4 }   // Sol (brillante)
        ];

        let delay = 0;
        notes.forEach((note) => {
            const noteTime = now + delay;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(note.f, noteTime);

            gain.gain.setValueAtTime(0.15, noteTime);
            gain.gain.exponentialRampToValueAtTime(0.01, noteTime + note.d);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(noteTime);
            osc.stop(noteTime + note.d);
            
            delay += note.d * 0.85;
        });
    }
}

// --- SISTEMA DE PARTÍCULAS (Brillos/Confeti) ---
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        // Velocidades aleatorias en ángulo completo
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 1; // Un ligero impulso inicial hacia arriba
        
        this.radius = Math.random() * 4 + 3;
        this.color = color;
        this.alpha = 1;
        this.decay = Math.random() * 0.03 + 0.02; // Desvanecimiento rápido
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.08; // Gravedad suave
        this.alpha -= this.decay;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        
        // Dibujado con brillo radial blanco simulado
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#ffffff';
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// --- BASE DE DATOS DE NIVELES ---
const LEVELS = [
    {
        name: "Pradera Feliz 🏡",
        speed: 160, // Velocidad en ms (más alto = más lento)
        goal: 10,
        obstacles: [],
        colorTheme: { bg1: '#e2f0d9', bg2: '#d2e7c4' }
    },
    {
        name: "Bosque de Setas 🍄",
        speed: 135,
        goal: 15,
        // Setas / Hongos colocados estratégicamente en las esquinas
        obstacles: [
            {x: 5, y: 4}, {x: 5, y: 5}, {x: 6, y: 4},
            {x: 24, y: 4}, {x: 24, y: 5}, {x: 23, y: 4},
            {x: 5, y: 15}, {x: 5, y: 14}, {x: 6, y: 15},
            {x: 24, y: 15}, {x: 24, y: 14}, {x: 23, y: 15}
        ],
        colorTheme: { bg1: '#d8ebd3', bg2: '#c9e0c3' }
    },
    {
        name: "Laberinto Mágico 🔮",
        speed: 110,
        goal: 20,
        // Paredes interiores en el centro creando pasillos estrechos
        obstacles: [
            {x: 10, y: 9}, {x: 11, y: 9}, {x: 12, y: 9}, {x: 13, y: 9}, {x: 14, y: 9}, {x: 15, y: 9}, {x: 16, y: 9}, {x: 17, y: 9}, {x: 18, y: 9}, {x: 19, y: 9},
            {x: 14, y: 5}, {x: 14, y: 6}, {x: 14, y: 7}, {x: 14, y: 8},
            {x: 15, y: 10}, {x: 15, y: 11}, {x: 15, y: 12}, {x: 15, y: 13}
        ],
        colorTheme: { bg1: '#dfd5eb', bg2: '#d1c4e2' }
    },
    {
        name: "Río de Piedras 🪵",
        speed: 95,
        goal: 25,
        // Bloques y piedras dispersas
        obstacles: [
            {x: 5, y: 3}, {x: 6, y: 3}, {x: 7, y: 3},
            {x: 22, y: 3}, {x: 23, y: 3}, {x: 24, y: 3},
            {x: 5, y: 16}, {x: 6, y: 16}, {x: 7, y: 16},
            {x: 22, y: 16}, {x: 23, y: 16}, {x: 24, y: 16},
            {x: 14, y: 3}, {x: 15, y: 3}, {x: 14, y: 16}, {x: 15, y: 16},
            {x: 10, y: 10}, {x: 19, y: 10}
        ],
        colorTheme: { bg1: '#d5e2eb', bg2: '#c4d3e0' }
    },
    {
        name: "El Templo del Dragón 🐲",
        speed: 80,
        goal: 30,
        // Gran laberinto desafiante para el nivel final
        obstacles: [
            {x: 3, y: 3}, {x: 3, y: 4}, {x: 3, y: 5}, {x: 3, y: 6},
            {x: 26, y: 3}, {x: 26, y: 4}, {x: 26, y: 5}, {x: 26, y: 6},
            {x: 3, y: 13}, {x: 3, y: 14}, {x: 3, y: 15}, {x: 3, y: 16},
            {x: 26, y: 13}, {x: 26, y: 14}, {x: 26, y: 15}, {x: 26, y: 16},
            {x: 10, y: 5}, {x: 11, y: 5}, {x: 12, y: 5}, {x: 13, y: 5}, {x: 14, y: 5}, {x: 15, y: 5}, {x: 16, y: 5}, {x: 17, y: 5}, {x: 18, y: 5}, {x: 19, y: 5},
            {x: 10, y: 14}, {x: 11, y: 14}, {x: 12, y: 14}, {x: 13, y: 14}, {x: 14, y: 14}, {x: 15, y: 14}, {x: 16, y: 14}, {x: 17, y: 14}, {x: 18, y: 14}, {x: 19, y: 14}
        ],
        colorTheme: { bg1: '#ebdcd3', bg2: '#e0ccc3' }
    }
];

// Tipos de frutas disponibles con su color y probabilidad
const FRUITS = [
    { type: 'apple', color: '#ff4d4d' },
    { type: 'banana', color: '#ffd32a' },
    { type: 'orange', color: '#ff9f43' },
    { type: 'grape', color: '#a29bfe' },
    { type: 'cherry', color: '#ff4757' }
];

// --- VARIABLES DEL ESTADO DE JUEGO ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gridCellSize = 20; // 600 / 20 = 30 columnas, 400 / 20 = 20 filas
const gridCols = canvas.width / gridCellSize;
const gridRows = canvas.height / gridCellSize;

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = null;
let score = 0;
let levelIndex = 0;
let highScore = 0;
let gameState = 'start'; // 'start', 'playing', 'paused', 'levelup', 'gameover', 'victory'
let particles = [];
let lastStepTime = 0;

// Instanciar motor de sonido
const audio = new AudioEngine();

// --- CARGAR RÉCORD ---
if (localStorage.getItem("snake_kids_highscore")) {
    highScore = parseInt(localStorage.getItem("snake_kids_highscore"), 10);
    document.getElementById("highscore-val").innerText = highScore;
}

// --- CONFIGURACIÓN DE PANTALLAS (OVERLAYS) ---
function showOverlay(screenId) {
    // Esconder todos los overlays
    document.querySelectorAll('.overlay').forEach(el => el.classList.remove('active'));
    // Mostrar el correcto
    const activeScreen = document.getElementById(screenId);
    if (activeScreen) activeScreen.classList.add('active');
}

// --- DIBUJAR FRUTAS DETALLADAS ---
function drawFruit(ctx, fx, fy, type) {
    const cx = fx + gridCellSize / 2;
    const cy = fy + gridCellSize / 2;
    
    ctx.save();
    // Efecto de rebote usando la función seno y el tiempo actual
    const scale = 1 + Math.sin(Date.now() * 0.01) * 0.08;
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.translate(-cx, -cy);
    
    switch(type) {
        case 'apple':
            // Sombra
            ctx.fillStyle = 'rgba(0,0,0,0.12)';
            ctx.beginPath();
            ctx.arc(cx, cy + 5, 7, 0, Math.PI * 2);
            ctx.fill();
            
            // Cuerpo rojo
            ctx.fillStyle = '#ff4d4d';
            ctx.beginPath();
            ctx.arc(cx - 3, cy + 1, 6, 0, Math.PI * 2);
            ctx.arc(cx + 3, cy + 1, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Tallo
            ctx.strokeStyle = '#8d6e63';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy - 3);
            ctx.quadraticCurveTo(cx - 2, cy - 6, cx - 3, cy - 8);
            ctx.stroke();
            
            // Hoja
            ctx.fillStyle = '#2ed573';
            ctx.beginPath();
            ctx.ellipse(cx + 2, cy - 6, 3, 1.5, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Brillo blanco
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(cx - 3, cy - 2, 2, 0, Math.PI * 2);
            ctx.fill();
            break;
            
        case 'banana':
            ctx.fillStyle = 'rgba(0,0,0,0.12)';
            ctx.beginPath();
            ctx.ellipse(cx, cy + 6, 7, 3, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Plátano amarillo curvo
            ctx.strokeStyle = '#ffd32a';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(cx, cy - 2, 7, Math.PI * 0.25, Math.PI * 0.95);
            ctx.stroke();
            
            // Puntas marrón
            ctx.fillStyle = '#6d4c41';
            ctx.beginPath();
            ctx.arc(cx - 5, cy + 3, 1.5, 0, Math.PI * 2);
            ctx.arc(cx + 6, cy - 3, 1.2, 0, Math.PI * 2);
            ctx.fill();
            break;
            
        case 'orange':
            ctx.fillStyle = 'rgba(0,0,0,0.12)';
            ctx.beginPath();
            ctx.arc(cx, cy + 5, 7, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#ff9f43';
            ctx.beginPath();
            ctx.arc(cx, cy, 7, 0, Math.PI * 2);
            ctx.fill();
            
            // Hoja
            ctx.fillStyle = '#2ed573';
            ctx.beginPath();
            ctx.ellipse(cx + 2, cy - 7, 3, 1.5, -Math.PI / 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Textura poros
            ctx.fillStyle = '#d35400';
            ctx.fillRect(cx - 2, cy + 2, 1, 1);
            ctx.fillRect(cx + 2, cy - 1, 1, 1);
            break;
            
        case 'grape':
            ctx.fillStyle = 'rgba(0,0,0,0.12)';
            ctx.beginPath();
            ctx.ellipse(cx, cy + 6, 6, 2.5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Uvas (3 círculos superpuestos)
            ctx.fillStyle = '#a29bfe';
            ctx.beginPath();
            ctx.arc(cx - 3, cy - 1, 3.5, 0, Math.PI * 2);
            ctx.arc(cx + 3, cy - 1, 3.5, 0, Math.PI * 2);
            ctx.arc(cx, cy + 3, 3.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Tallito
            ctx.strokeStyle = '#2ed573';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx, cy - 1);
            ctx.lineTo(cx, cy - 6);
            ctx.stroke();
            break;
            
        case 'cherry':
            ctx.fillStyle = 'rgba(0,0,0,0.12)';
            ctx.beginPath();
            ctx.ellipse(cx, cy + 6, 7, 2.5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Ramitas verdes
            ctx.strokeStyle = '#2ed573';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx - 3, cy);
            ctx.quadraticCurveTo(cx, cy - 6, cx, cy - 6);
            ctx.moveTo(cx + 3, cy + 1);
            ctx.quadraticCurveTo(cx, cy - 6, cx, cy - 6);
            ctx.stroke();
            
            // Cereza izquierda
            ctx.fillStyle = '#ff4757';
            ctx.beginPath();
            ctx.arc(cx - 3, cy + 2, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(cx - 4, cy + 1, 0.8, 0, Math.PI * 2);
            ctx.fill();
            
            // Cereza derecha
            ctx.fillStyle = '#ff4757';
            ctx.beginPath();
            ctx.arc(cx + 3, cy + 3, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(cx + 2, cy + 2, 0.8, 0, Math.PI * 2);
            ctx.fill();
            break;
    }
    
    ctx.restore();
}

// --- DIBUJAR OBSTÁCULOS TEMÁTICOS ---
function drawObstacle(ctx, ox, oy, levelIdx) {
    const cx = ox + gridCellSize / 2;
    const cy = oy + gridCellSize / 2;
    
    ctx.save();
    
    if (levelIdx === 1) { // Bosque de Setas (Dibujar hongos bonitos)
        // Pie de la seta
        ctx.fillStyle = '#f1f2f6';
        ctx.beginPath();
        ctx.moveTo(cx - 3, cy + 7);
        ctx.quadraticCurveTo(cx - 3, cy, cx - 2, cy - 1);
        ctx.lineTo(cx + 2, cy - 1);
        ctx.quadraticCurveTo(cx + 3, cy, cx + 3, cy + 7);
        ctx.closePath();
        ctx.fill();
        
        // Sombrero rojo
        ctx.fillStyle = '#ff4757';
        ctx.beginPath();
        ctx.arc(cx, cy - 1, 7, Math.PI, 0);
        ctx.quadraticCurveTo(cx + 8, cy + 3, cx, cy + 3);
        ctx.quadraticCurveTo(cx - 8, cy + 3, cx - 8, cy - 1);
        ctx.closePath();
        ctx.fill();
        
        // Lunares blancos
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - 3, cy - 1, 1.2, 0, Math.PI * 2);
        ctx.arc(cx + 3, cy - 2, 1.2, 0, Math.PI * 2);
        ctx.arc(cx, cy + 1, 1, 0, Math.PI * 2);
        ctx.fill();
    } else { // Piedras con musgo de bosque mágico
        // Sombra
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.arc(cx, cy + 4, 8, 0, Math.PI*2);
        ctx.fill();
        
        // Piedra base gris
        ctx.fillStyle = '#7f8c8d';
        ctx.beginPath();
        ctx.moveTo(cx - 7, cy + 7);
        ctx.lineTo(cx - 8, cy + 2);
        ctx.lineTo(cx - 3, cy - 5);
        ctx.lineTo(cx + 4, cy - 6);
        ctx.lineTo(cx + 7, cy - 1);
        ctx.lineTo(cx + 6, cy + 7);
        ctx.closePath();
        ctx.fill();
        
        // Facetas/Detalles de luz
        ctx.fillStyle = '#95a5a6';
        ctx.beginPath();
        ctx.moveTo(cx - 3, cy - 5);
        ctx.lineTo(cx + 1, cy - 5);
        ctx.lineTo(cx + 3, cy - 1);
        ctx.lineTo(cx - 2, cy);
        ctx.closePath();
        ctx.fill();
        
        // Musgo verde divertido en la parte superior
        ctx.fillStyle = '#2ed573';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 5, 4, 1.8, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

// --- CONTROL DEL FLUJO DE JUEGO ---

// Colocar fruta en celda libre
function placeFood() {
    const currentLevel = LEVELS[levelIndex];
    let possiblePositions = [];
    
    // Generar todas las posiciones y filtrar las ocupadas por la serpiente u obstáculos
    for (let x = 1; x < gridCols - 1; x++) {
        for (let y = 1; y < gridRows - 1; y++) {
            // Verificar si choca con la serpiente
            let onSnake = snake.some(segment => segment.x === x && segment.y === y);
            // Verificar si choca con obstáculos
            let onObstacle = currentLevel.obstacles.some(obs => obs.x === x && obs.y === y);
            
            if (!onSnake && !onObstacle) {
                possiblePositions.push({ x, y });
            }
        }
    }
    
    // Si no hay posiciones libres, ganar inmediatamente
    if (possiblePositions.length === 0) {
        checkLevelProgression();
        return;
    }
    
    const randomPos = possiblePositions[Math.floor(Math.random() * possiblePositions.length)];
    const randomFruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
    
    food = {
        x: randomPos.x,
        y: randomPos.y,
        type: randomFruit.type,
        color: randomFruit.color
    };
}

// Inicializar un nivel
function initLevel() {
    const currentLevel = LEVELS[levelIndex];
    
    // Actualizar interfaz
    document.getElementById("level-val").innerText = levelIndex + 1;
    document.getElementById("score-val").innerText = score;
    updateProgressBar();
    
    // Reset de serpiente (empieza en el centro-izquierdo)
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    
    // Dirección inicial (derecha)
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    
    // Colocar primer fruta
    placeFood();
    
    // Limpiar partículas
    particles = [];
}

// Actualizar barra de progreso de frutas
function updateProgressBar() {
    const currentLevel = LEVELS[levelIndex];
    const fruitsEatenInThisLevel = score - getScoreThresholdForPreviousLevels();
    const pct = Math.min(100, (fruitsEatenInThisLevel / currentLevel.goal) * 100);
    
    document.getElementById("progress-fill").style.width = `${pct}%`;
    document.getElementById("progress-text").innerText = `${fruitsEatenInThisLevel} / ${currentLevel.goal}`;
}

// Obtener la cantidad de frutas necesarias para llegar al nivel actual
function getScoreThresholdForPreviousLevels() {
    let count = 0;
    for (let i = 0; i < levelIndex; i++) {
        count += LEVELS[i].goal;
    }
    return count;
}

// Iniciar juego desde el principio
function restartGame() {
    score = 0;
    levelIndex = 0;
    gameState = 'playing';
    showOverlay('');
    initLevel();
    audio.playClick();
}

// Pasar a siguiente nivel
function startNextLevel() {
    levelIndex++;
    if (levelIndex >= LEVELS.length) {
        // Victoria final
        triggerVictory();
        return;
    }
    gameState = 'playing';
    showOverlay('');
    initLevel();
    audio.playClick();
}

// Fin del juego
function triggerGameOver() {
    gameState = 'gameover';
    audio.playGameOver();
    
    // Guardar récord si aplica
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("snake_kids_highscore", highScore);
        document.getElementById("highscore-val").innerText = highScore;
    }
    
    document.getElementById("final-score-val").innerText = score;
    document.getElementById("final-level-val").innerText = levelIndex + 1;
    showOverlay('screen-game-over');
}

// Victoria total
function triggerVictory() {
    gameState = 'victory';
    audio.playVictory();
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("snake_kids_highscore", highScore);
        document.getElementById("highscore-val").innerText = highScore;
    }
    
    document.getElementById("victory-score-val").innerText = score;
    showOverlay('screen-victory');
    
    // Gran explosión de partículas de victoria en el centro de la pantalla
    for (let i = 0; i < 80; i++) {
        const px = canvas.width / 2;
        const py = canvas.height / 2;
        const color = `hsl(${Math.random() * 360}, 100%, 60%)`;
        particles.push(new Particle(px, py, color));
    }
}

// Comprobar avance de niveles
function checkLevelProgression() {
    const currentLevel = LEVELS[levelIndex];
    const fruitsEatenInThisLevel = score - getScoreThresholdForPreviousLevels();
    
    if (fruitsEatenInThisLevel >= currentLevel.goal) {
        // Nivel superado
        gameState = 'levelup';
        audio.playLevelUp();
        
        // Explosión de partículas celebrando
        const headX = snake[0].x * gridCellSize + gridCellSize / 2;
        const headY = snake[0].y * gridCellSize + gridCellSize / 2;
        for (let i = 0; i < 40; i++) {
            const color = `hsl(${Math.random() * 360}, 100%, 65%)`;
            particles.push(new Particle(headX, headY, color));
        }

        if (levelIndex + 1 >= LEVELS.length) {
            triggerVictory();
        } else {
            document.getElementById("level-up-msg").innerText = `¡Increíble! Has limpiado el ${currentLevel.name}.`;
            showOverlay('screen-level-up');
        }
    }
}

// Pausa
function togglePause() {
    if (gameState === 'playing') {
        gameState = 'paused';
        showOverlay('screen-pause');
        audio.playClick();
    } else if (gameState === 'paused') {
        gameState = 'playing';
        showOverlay('');
        audio.playClick();
    }
}

// --- ACTUALIZAR LÓGICA DE FÍSICA Y MOVIMIENTO ---
function updateGame() {
    // Mover la serpiente basándose en la dirección
    direction = nextDirection;
    const nextHead = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };
    
    // 1. Colisión con bordes del mapa
    if (nextHead.x < 0 || nextHead.x >= gridCols || nextHead.y < 0 || nextHead.y >= gridRows) {
        triggerGameOver();
        return;
    }
    
    // 2. Colisión consigo misma
    // Nota: El último segmento de la cola se mueve en este tick, así que no cuenta si no comemos
    let selfCollision = snake.some((segment, idx) => {
        // Si no come, la cola se desplaza, por lo que el último segmento queda libre
        if (idx === snake.length - 1) return false;
        return segment.x === nextHead.x && segment.y === nextHead.y;
    });
    
    if (selfCollision) {
        triggerGameOver();
        return;
    }
    
    // 3. Colisión con obstáculos del nivel
    const currentLevel = LEVELS[levelIndex];
    let obstacleCollision = currentLevel.obstacles.some(obs => obs.x === nextHead.x && obs.y === nextHead.y);
    if (obstacleCollision) {
        triggerGameOver();
        return;
    }
    
    // Mover cabeza al frente de la cola
    snake.unshift(nextHead);
    
    // 4. Comer fruta
    if (nextHead.x === food.x && nextHead.y === food.y) {
        score++;
        audio.playEat();
        
        // Crear destello de confeti de partículas en la posición de la fruta
        const fx = food.x * gridCellSize + gridCellSize / 2;
        const fy = food.y * gridCellSize + gridCellSize / 2;
        for (let i = 0; i < 15; i++) {
            particles.push(new Particle(fx, fy, food.color));
        }
        
        // Colocar nueva fruta
        placeFood();
        updateProgressBar();
        checkLevelProgression();
    } else {
        // Si no come, remueve la cola para simular el desplazamiento
        snake.pop();
    }
}

// --- DIBUJADO DE GRÁFICOS (RENDER) ---
function drawGame() {
    // 1. Limpiar pantalla
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Obtener tema visual del nivel
    const currentLevel = LEVELS[levelIndex] || LEVELS[0];
    const theme = currentLevel.colorTheme;
    
    // 2. Dibujar cuadrícula de césped estilo tablero
    for (let c = 0; c < gridCols; c++) {
        for (let r = 0; r < gridRows; r++) {
            ctx.fillStyle = ((c + r) % 2 === 0) ? theme.bg1 : theme.bg2;
            ctx.fillRect(c * gridCellSize, r * gridCellSize, gridCellSize, gridCellSize);
        }
    }
    
    // 3. Dibujar obstáculos del nivel
    currentLevel.obstacles.forEach(obs => {
        drawObstacle(ctx, obs.x * gridCellSize, obs.y * gridCellSize, levelIndex);
    });
    
    // 4. Dibujar Fruta (si existe)
    if (food && gameState !== 'levelup' && gameState !== 'victory') {
        drawFruit(ctx, food.x * gridCellSize, food.y * gridCellSize, food.type);
    }
    
    // 5. Dibujar la Viborita
    if (snake.length > 0) {
        // A. Dibujar el cuerpo (de atrás hacia adelante, omitiendo la cabeza)
        for (let i = snake.length - 1; i > 0; i--) {
            const segment = snake[i];
            const segX = segment.x * gridCellSize + gridCellSize / 2;
            const segY = segment.y * gridCellSize + gridCellSize / 2;
            
            // Efecto de encogimiento hacia la cola
            const ratio = (snake.length - i) / snake.length;
            const radius = 5.5 + ratio * 4.5; // escala entre 5.5 y 10px
            
            // Colores alternos verde claro y brillante para el patrón
            ctx.fillStyle = (i % 2 === 0) ? '#1dd1a1' : '#10ac84';
            
            ctx.beginPath();
            ctx.arc(segX, segY, radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Detalle de motita brillante en la espalda
            ctx.fillStyle = '#feca57';
            ctx.beginPath();
            ctx.arc(segX, segY, radius * 0.35, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // B. Dibujar la Cabeza de la Oruga
        const head = snake[0];
        const headX = head.x * gridCellSize + gridCellSize / 2;
        const headY = head.y * gridCellSize + gridCellSize / 2;
        
        ctx.save();
        ctx.fillStyle = '#1dd1a1';
        ctx.beginPath();
        ctx.arc(headX, headY, 11, 0, Math.PI * 2);
        ctx.fill();
        
        // Chapitas rosadas en las mejillas
        ctx.fillStyle = 'rgba(255, 107, 107, 0.4)';
        ctx.beginPath();
        ctx.arc(headX - 6, headY + 3, 2.5, 0, Math.PI * 2);
        ctx.arc(headX + 6, headY + 3, 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Calcular dirección de los ojos
        let eye1X, eye1Y, eye2X, eye2Y;
        let pupilDX = 0, pupilDY = 0;
        
        if (direction.x === 1 && direction.y === 0) { // Derecha
            eye1X = headX + 4; eye1Y = headY - 4;
            eye2X = headX + 4; eye2Y = headY + 4;
            pupilDX = 1.2; pupilDY = 0;
        } else if (direction.x === -1 && direction.y === 0) { // Izquierda
            eye1X = headX - 4; eye1Y = headY - 4;
            eye2X = headX - 4; eye2Y = headY + 4;
            pupilDX = -1.2; pupilDY = 0;
        } else if (direction.x === 0 && direction.y === -1) { // Arriba
            eye1X = headX - 4; eye1Y = headY - 4;
            eye2X = headX + 4; eye2Y = headY - 4;
            pupilDX = 0; pupilDY = -1.2;
        } else { // Abajo (o estático)
            eye1X = headX - 4; eye1Y = headY + 4;
            eye2X = headX + 4; eye2Y = headY + 4;
            pupilDX = 0; pupilDY = 1.2;
        }
        
        // Parte blanca del ojo
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eye1X, eye1Y, 4, 0, Math.PI * 2);
        ctx.arc(eye2X, eye2Y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupilas negras mirando en dirección del movimiento
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(eye1X + pupilDX, eye1Y + pupilDY, 2, 0, Math.PI * 2);
        ctx.arc(eye2X + pupilDX, eye2Y + pupilDY, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Brillo blanco en la pupila
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eye1X + pupilDX - 0.6, eye1Y + pupilDY - 0.6, 0.6, 0, Math.PI * 2);
        ctx.arc(eye2X + pupilDX - 0.6, eye2Y + pupilDY - 0.6, 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    // 6. Dibujar y actualizar partículas (estrellitas)
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.alpha <= 0) {
            particles.splice(i, 1);
        }
    }
}

// --- BUCLE PRINCIPAL DE JUEGO (GAME LOOP) ---
function gameLoop(currentTime) {
    window.requestAnimationFrame(gameLoop);
    
    // Renderizado continuo para animaciones (frutas rebotando, partículas cayendo)
    drawGame();
    
    if (gameState !== 'playing') {
        return;
    }
    
    // Control de velocidad por fotogramas según el nivel actual
    const currentLevel = LEVELS[levelIndex];
    const speed = currentLevel.speed;
    const elapsed = currentTime - lastStepTime;
    
    if (elapsed >= speed) {
        lastStepTime = currentTime;
        updateGame();
    }
}

// --- CAPTURA DE ENTRADAS / EVENTOS ---

// Cambiar de dirección controlando giros imposibles
function handleDirectionChange(newX, newY) {
    if (gameState !== 'playing') return;
    
    // Evitar girar 180 grados instantáneamente (para no chocar contra sí mismo)
    if (newX !== 0 && direction.x !== 0) return;
    if (newY !== 0 && direction.y !== 0) return;
    
    nextDirection = { x: newX, y: newY };
}

// Eventos de teclado
window.addEventListener("keydown", (e) => {
    // Prevenir scroll de página al presionar flechas o espacio
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
    }
    
    switch(e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
            handleDirectionChange(0, -1);
            break;
        case 'arrowdown':
        case 's':
            handleDirectionChange(0, 1);
            break;
        case 'arrowleft':
        case 'a':
            handleDirectionChange(-1, 0);
            break;
        case 'arrowright':
        case 'd':
            handleDirectionChange(1, 0);
            break;
        case 'p':
        case ' ': // Espacio para pausa
            togglePause();
            break;
    }
});

// Eventos de botones táctiles en pantalla (móviles)
document.getElementById("ctrl-up").addEventListener("click", () => {
    audio.init();
    handleDirectionChange(0, -1);
});
document.getElementById("ctrl-down").addEventListener("click", () => {
    audio.init();
    handleDirectionChange(0, 1);
});
document.getElementById("ctrl-left").addEventListener("click", () => {
    audio.init();
    handleDirectionChange(-1, 0);
});
document.getElementById("ctrl-right").addEventListener("click", () => {
    audio.init();
    handleDirectionChange(1, 0);
});
document.getElementById("ctrl-pause").addEventListener("click", () => {
    audio.init();
    togglePause();
});

// Botones de las pantallas overlays
document.getElementById("btn-play").addEventListener("click", () => {
    audio.init();
    restartGame();
});

document.getElementById("btn-resume").addEventListener("click", () => {
    audio.init();
    togglePause();
});

document.getElementById("btn-next-level").addEventListener("click", () => {
    audio.init();
    startNextLevel();
});

document.getElementById("btn-restart").addEventListener("click", () => {
    audio.init();
    restartGame();
});

document.getElementById("btn-victory-restart").addEventListener("click", () => {
    audio.init();
    restartGame();
});

// Iniciar bucle de renderizado por primera vez
window.requestAnimationFrame(gameLoop);
showOverlay('screen-start');
