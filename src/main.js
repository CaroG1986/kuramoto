import * as THREE from 'three';
import { KuramotoSystem } from './core/KuramotoSystem.js';
import { AudioManager } from './audio/AudioManager.js';
import { Playground } from './Scene/Playground.js';
import { InteractionManager } from './interaction/InteractionManager.js';
import { ControlPanel } from './ui/ControlPanel.js';
import './styles.css';

/**
 * Punto de entrada principal para la experiencia performativa Kuramoto Playground.
 */
function init() {
  const mount = document.querySelector('#app');
  if (!mount) return;

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