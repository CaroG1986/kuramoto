import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * Gestor de interacciones 3D (Raycasting para selección de personajes y OrbitControls).
 */
export class InteractionManager {
  /**
   * @param {THREE.Camera} camera
   * @param {THREE.WebGLRenderer} renderer
   * @param {import('../scene/Playground.js').Playground} playground
   * @param {Function} onSelectCharacterCallback
   */
  constructor(camera, renderer, playground, onSelectCharacterCallback) {
    this.camera = camera;
    this.renderer = renderer;
    this.playground = playground;
    this.onSelectCharacter = onSelectCharacterCallback;

    this.selectedCharacter = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // 1. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.05; // Impedir pasar por debajo del suelo
    this.controls.minDistance = 3;
    this.controls.maxDistance = 22;
    this.controls.target.set(0, 0.8, 0);

    // Posición por defecto de la cámara
    this.defaultCameraPos = new THREE.Vector3(0, 7.5, 12.5);
    this.defaultTargetPos = new THREE.Vector3(0, 0.8, 0);

    // Bind de eventos
    this.renderer.domElement.addEventListener('pointerdown', this._onPointerDown.bind(this));
  }

  _onPointerDown(event) {
    // Calcular coordenadas NDC (-1 a +1)
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Recolectar meshes de los personajes para intersección
    const charMeshes = [];
    this.playground.characters.forEach((char) => {
      char.group.traverse((child) => {
        if (child.isMesh && child.userData && child.userData.character) {
          charMeshes.push(child);
        }
      });
    });

    const intersects = this.raycaster.intersectObjects(charMeshes, false);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const clickedChar = hitMesh.userData.character;
      this.selectCharacter(clickedChar);
    }
  }

  /**
   * Selecciona un personaje y notifica a la UI.
   * @param {import('../scene/Character.js').Character | null} character
   */
  selectCharacter(character) {
    // Deseleccionar el anterior
    if (this.selectedCharacter) {
      this.selectedCharacter.setSelected(false);
      this.selectedCharacter.oscillator.selected = false;
    }

    if (character && character !== this.selectedCharacter) {
      this.selectedCharacter = character;
      this.selectedCharacter.setSelected(true);
      this.selectedCharacter.oscillator.selected = true;

      if (this.onSelectCharacter) {
        this.onSelectCharacter(this.selectedCharacter.oscillator);
      }
    } else {
      this.selectedCharacter = null;
      if (this.onSelectCharacter) {
        this.onSelectCharacter(null);
      }
    }
  }

  /**
   * Resetea la cámara a la vista inicial del patio.
   */
  resetCamera() {
    this.camera.position.copy(this.defaultCameraPos);
    this.controls.target.copy(this.defaultTargetPos);
    this.controls.update();
  }

  /**
   * Actualiza los OrbitControls en cada cuadro.
   */
  update() {
    this.controls.update();
  }
}
