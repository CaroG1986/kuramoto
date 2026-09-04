import * as THREE from 'three';
import { KuramotoSystem } from './core/KuramotoSystem.js';
import { AudioManager } from './audio/AudioManager.js';
import { Playground } from './scene/Playground.js';
import { InteractionManager } from './interaction/InteractionManager.js';
import { ControlPanel } from './ui/ControlPanel.js';
import './styles.css';

/**
 * Punto de entrada principal para la experiencia performativa Kuramoto Playground.
 */
function init() {
  const mount = document.querySelector('#app');

  // 1. Escena Three.js
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07090e);
  scene.fog = new THREE.FogExp2(0x07090e, 0.025);

  // 2. Cámara
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 7.5, 12.5);

  const params = createParameters();

  const axes = new THREE.AxesHelper(1.5);
  scene.add(axes);

  // 3. Renderizador WebGL
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  mount.appendChild(renderer.domElement);

  // 4. Instanciar Núcleo del Sistema de Kuramoto
  const kuramotoSystem = new KuramotoSystem();

  // 5. Instanciar Gestor de Audio (Web Audio API)
  const audioManager = new AudioManager();

  // 6. Instanciar Escenario 3D (Patio, 4 Sube y Bajas, 8 Muñequitos, Estelas)
  const playground = new Playground(scene, kuramotoSystem);

  // 7. Instanciar Gestor de Interacción (Raycasting 3D & OrbitControls)
  let controlPanel;
  const interactionManager = new InteractionManager(
    camera,
    renderer,
    playground,
    (selectedOscillator) => {
      controlPanel.setSelectedOscillator(selectedOscillator);

  const simulation = createSimulation({ renderer, scene, params, count: PARTICLE_COUNT });

  addEventListener('pointermove', (event) => {
    pointerNdc.x = (event.clientX / innerWidth) * 2 - 1;
    pointerNdc.y = -(event.clientY / innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointerNdc, camera);
    if (raycaster.ray.intersectPlane(interactionPlane, hit)) {
      params.attractor.value.copy(hit);
      // attractorHelper.position.copy(hit); <-- Comentar esta línea también

    }
  );

  // 8. Instanciar Panel de Control UI
  controlPanel = new ControlPanel({
    kuramoto: kuramotoSystem,
    audio: audioManager,
    onStartExperience: () => {
      audioManager.init();
    },
    onResetCamera: () => {
      interactionManager.resetCamera();

  let paused = false;
  let mode = 'LAB';
  let panel;
  let savedRadialStrength = params.radialStrength.value;
  let savedRadialEnabled = params.radialEnabled.value;

  const applyPreset = (id) => {
    params.windEnabled.value = 0;
    params.radialEnabled.value = 0;
    params.vortexEnabled.value = 0;
    params.dragEnabled.value = 0;
    params.wind.value.set(0, 0, 0);
    params.initialSpeed.value = 0;

    if (id === 'inertia') {
      params.initialSpeed.value = 0.8;
    } else if (id === 'wind') {
      params.windEnabled.value = 1;
      params.wind.value.set(1.5, 0, 0);
    } else if (id === 'attract') {
      params.radialEnabled.value = 1;
      params.radialStrength.value = 3.0;
    } else if (id === 'repel') {
      params.radialEnabled.value = 1;
      params.radialStrength.value = -3.0;
    } else if (id === 'vortex') {
      params.radialEnabled.value = 1;
      params.radialStrength.value = 1.0;
      params.vortexEnabled.value = 1;
      params.vortexStrength.value = 3.0;
      params.dragEnabled.value = 1;
      params.dragCoefficient.value = 0.08;
    }
    simulation.reset();
    panel?.refresh();
  };

  // PALETAS DE DEGRADADOS DE COLOR ---------------------------------------
  const COLOR_PALETTES = [
    { name: 'Cian · Ámbar', slow: '#46a6ff', fast: '#ffb35a' },
    { name: 'Cyberpunk Neón', slow: '#8a2be2', fast: '#00ffff' },
    { name: 'Fuego / Magma', slow: '#ff1e00', fast: '#ffee44' },
    { name: 'Aurora Esmeralda', slow: '#004d40', fast: '#00ff88' },
    { name: 'Atardecer Violeta', slow: '#311b92', fast: '#ff4081' },
    { name: 'Glaciar Eléctrico', slow: '#001f3f', fast: '#7fdbff' }
  ];

  let currentPaletteIndex = 0;
  const targetSlowColor = new THREE.Color(COLOR_PALETTES[0].slow);
  const targetFastColor = new THREE.Color(COLOR_PALETTES[0].fast);

  const nextColorPalette = () => {
    currentPaletteIndex = (currentPaletteIndex + 1) % COLOR_PALETTES.length;
    const p = COLOR_PALETTES[currentPaletteIndex];
    targetSlowColor.set(p.slow);
    targetFastColor.set(p.fast);
    return p.name;
  };

  const getCurrentPaletteName = () => COLOR_PALETTES[currentPaletteIndex].name;

  const setMode = (next) => {
    mode = next;
    const lab = mode === 'LAB';
    panel.setVisible(lab);
    axes.visible = lab;
    document.body.style.cursor = lab ? 'default' : 'none';
    hud.innerHTML = lab
      ? '<strong>LAB</strong> · Flechas: Viento X/Y · 1/2: Viento Z · 3/4: Vel Máx · 5/6: Rayos · 7/8: Vórtice · W: Viento on/off · V: Vórtice on/off · L: Rayos on/off · T: Ramas on/off · C: Color'
      : '<strong>PERFORMANCE</strong> · Flechas: Viento X/Y · 1-8: Sliders · W: Viento · V: Vórtice · L: Rayos · T: Ramas · C: Color · A/S/D: Fuerzas';
  };

  panel = createLabPanel({
    params,
    onReset: () => simulation.reset(),
    onPreset: applyPreset,
    onModeChange: () => setMode(mode === 'LAB' ? 'PERFORMANCE' : 'LAB'),
    onPauseChange: () => paused = !paused,
    onNextColorPalette: () => {
      const name = nextColorPalette();
      return name;
    },
    getCurrentPaletteName
  });

  const hud = document.createElement('div');
  hud.className = 'hud';
  document.body.append(hud);
  setMode('LAB');

  // BASELINE LIVE INSTRUMENT MAPPING -------------------------------------
  savedRadialStrength = params.radialStrength.value;
  savedRadialEnabled = params.radialEnabled.value;

  // Configuración de la máquina de estados en JS
  const BOUNDARY_STATES = {
    OFF: 0.0,
    HARD: 1.0,
    SOFT: 2.0
  };

  let currentBoundaryState = BOUNDARY_STATES.HARD;

  function toggleBoundaryState() {
    if (currentBoundaryState === BOUNDARY_STATES.HARD) {
      currentBoundaryState = BOUNDARY_STATES.OFF;
      console.log('Límite: DESACTIVADO (Partículas libres)');
    } else if (currentBoundaryState === BOUNDARY_STATES.OFF) {
      currentBoundaryState = BOUNDARY_STATES.SOFT;
      console.log('Límite: CAMPO DE FUERZA SUAVE');
    } else {
      currentBoundaryState = BOUNDARY_STATES.HARD;
      console.log('Límite: PARED SÓLIDA');
    }

    params.boundaryMode.value = currentBoundaryState;
  }

  // Event listener para teclado
  addEventListener('keydown', (event) => {
    // =========================================================================
    // CONTROL DE SLIDERS POR TECLADO (PERMITE MANTENER PRESIONADO)
    // =========================================================================
    // Flechas Izquierda/Derecha: Viento en X [-4 a 4]
    if (event.code === 'ArrowLeft') {
      event.preventDefault();
      params.wind.value.x = Math.max(-4.0, Number((params.wind.value.x - 0.1).toFixed(2)));
      panel?.refresh();
    }
    if (event.code === 'ArrowRight') {
      event.preventDefault();
      params.wind.value.x = Math.min(4.0, Number((params.wind.value.x + 0.1).toFixed(2)));
      panel?.refresh();
    }

    // Flechas Arriba/Abajo: Viento en Y [-4 a 4]
    if (event.code === 'ArrowUp') {
      event.preventDefault();
      params.wind.value.y = Math.min(4.0, Number((params.wind.value.y + 0.1).toFixed(2)));
      panel?.refresh();
    }
    if (event.code === 'ArrowDown') {
      event.preventDefault();
      params.wind.value.y = Math.max(-4.0, Number((params.wind.value.y - 0.1).toFixed(2)));
      panel?.refresh();
    }

    // Teclas 1 y 2: Viento en Z [-50 a 50] (1 disminuye, 2 aumenta)
    if (event.code === 'Digit1') {
      event.preventDefault();
      params.windZ.value = Math.max(-50.0, Number((params.windZ.value - 1.0).toFixed(1)));
      panel?.refresh();
    }
    if (event.code === 'Digit2') {
      event.preventDefault();
      params.windZ.value = Math.min(50.0, Number((params.windZ.value + 1.0).toFixed(1)));
      panel?.refresh();
    }

    // Teclas 3 y 4: Velocidad Máxima (maxSpeed) [0.2 a 12]
    if (event.code === 'Digit3') {
      event.preventDefault();
      params.maxSpeed.value = Math.max(0.2, Number((params.maxSpeed.value - 0.2).toFixed(1)));
      panel?.refresh();
    }
    if (event.code === 'Digit4') {
      event.preventDefault();
      params.maxSpeed.value = Math.min(12.0, Number((params.maxSpeed.value + 0.2).toFixed(1)));
      panel?.refresh();
    }

    // Teclas 5 y 6: Fuerza de Rayos (lightningStrength) [10 a 150]
    if (event.code === 'Digit5') {
      event.preventDefault();
      params.lightningStrength.value = Math.max(10.0, Number((params.lightningStrength.value - 2.0).toFixed(1)));
      panel?.refresh();
    }
    if (event.code === 'Digit6') {
      event.preventDefault();
      params.lightningStrength.value = Math.min(150.0, Number((params.lightningStrength.value + 2.0).toFixed(1)));
      panel?.refresh();
    }

    // Teclas 7 y 8: Fuerza del Vórtice (vortexStrength) [-8 a 8]
    if (event.code === 'Digit7') {
      event.preventDefault();
      params.vortexStrength.value = Math.max(-8.0, Number((params.vortexStrength.value - 0.2).toFixed(2)));
      panel?.refresh();
    }
    if (event.code === 'Digit8') {
      event.preventDefault();
      params.vortexStrength.value = Math.min(8.0, Number((params.vortexStrength.value + 0.2).toFixed(2)));
      panel?.refresh();
    }

    // A partir de aquí no permitir repetición continua innecesaria para toggles
    if (event.repeat) return;

    if (event.code === 'KeyP') setMode(mode === 'LAB' ? 'PERFORMANCE' : 'LAB');
    if (event.code === 'KeyR') simulation.reset();

    // Transición de degradado de color con la tecla C
    if (event.code === 'KeyC') {
      nextColorPalette();
      panel?.refresh();
    }

    // Activar/Desactivar Influencia del Viento con la tecla W (Toggle)
    if (event.code === 'KeyW') {
      params.windEnabled.value = params.windEnabled.value > 0 ? 0.0 : 1.0;
      panel?.refresh();
    }

    // Activar/Desactivar Estado de Rayos con la tecla L (Toggle)
    if (event.code === 'KeyL') {
      params.lightningEnabled.value = params.lightningEnabled.value > 0 ? 0.0 : 1.0;
      panel?.refresh();
    }

    // Activar/Desactivar Vórtice con la tecla V (Toggle)
    if (event.code === 'KeyV') {
      params.vortexEnabled.value = params.vortexEnabled.value > 0 ? 0.0 : 1.0;
      panel?.refresh();
    }

    // Activar/Desactivar Estado de Ramas / L-System con la tecla T (Tree/Bifurcación)
    if (event.code === 'KeyT') {
      params.lsystemEnabled.value = params.lsystemEnabled.value > 0 ? 0.0 : 1.0;
      panel?.refresh();
    }

    // Cambiar estado de límites (B)
    if (event.code === 'KeyB') {
      toggleBoundaryState();
    }

    // ATRACCIÓN HACIA EL MOUSE (Mantener 'A' o 'Space')
    if (event.code === 'KeyA' || event.code === 'Space') {
      event.preventDefault();
      params.radialEnabled.value = 1.0;
      params.radialStrength.value = 25.0; // Positivo
    }

    // REPULSIÓN HACIA EL MOUSE (Mantener 'S')
    if (event.code === 'KeyS') {
      event.preventDefault();
      params.radialEnabled.value = 1.0;
      params.radialStrength.value = -25.0; // Negativo
    }

    // DISPERSIÓN ENTRE SÍ / EXPANSIÓN (Mantener 'D')
    if (event.code === 'KeyD') {
      event.preventDefault();
      params.dispersionEnabled.value = 1.0;

    }
  });

  // 9. Loop de Animación Unificado
  const clock = new THREE.Clock();

  function animate() {
    const dt = Math.min(clock.getDelta(), 0.1); // Limitar dt para estabilidad numérica

    // 1. Actualizar estado del sistema de Kuramoto (dTheta/dt y R)
    kuramotoSystem.update(dt);
    const orderR = kuramotoSystem.orderParameterR;

    // 2. Procesar triggers de sonido por cada oscilador activo
    kuramotoSystem.oscillators.forEach((osc) => {
      if (osc.checkPeakTrigger()) {
        audioManager.triggerNote(osc, orderR);
      }
    });
    audioManager.updateSystemAudioState(orderR);

    // 3. Actualizar sube y bajas 3D y estelas según las fases de Kuramoto
    playground.update(orderR);

    // 4. Actualizar controles de cámara e interfaz
    interactionManager.update();
    controlPanel.update();

    // 5. Renderizar escena Three.js
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(animate);

  // 10. Manejador de redimensionamiento de ventana
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// Ejecutar inicialización al cargar el DOM
window.addEventListener('DOMContentLoaded', init);