import * as THREE from 'three';
import { Character } from './Character.js';

/**
 * Representa un Sube y Baja 3D articulado de estilo synth-pop / instalación de arte digital.
 */
export class Seesaw {
  /**
   * @param {Object} config
   * @param {number} config.id - ID del sube y baja (0 a 3)
   * @param {THREE.Vector3} config.position - Posición base en el playground
   * @param {number} config.rotationY - Ángulo de orientación horizontal del sube y baja
   * @param {import('../core/Oscillator.js').Oscillator} config.oscA - Oscilador del lado A (izq)
   * @param {import('../core/Oscillator.js').Oscillator} config.oscB - Oscilador del lado B (der)
   */
  constructor({ id, position, rotationY = 0, oscA, oscB }) {
    this.id = id;
    this.group = new THREE.Group();
    this.group.position.copy(position);
    this.group.rotation.y = rotationY;

    this.armLength = 1.65;
    this.maxTiltAngle = Math.PI / 11; // ~16 grados de inclinación máxima

    // Crear Personajes estilizados
    this.characterA = new Character({ oscillator: oscA, color: oscA.color });
    this.characterB = new Character({ oscillator: oscB, color: oscB.color });

    this._buildSeesawMesh();
  }

  /**
   * Construye el modelo 3D estilizado del sube y baja synth-pop
   */
  _buildSeesawMesh() {
    // Materiales metálicos oscuros y tiras neón
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x121722,
      roughness: 0.3,
      metalness: 0.8
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0x3a4254,
      roughness: 0.15,
      metalness: 0.95
    });

    const seatMat = new THREE.MeshStandardMaterial({
      color: 0x090c12,
      roughness: 0.4,
      metalness: 0.6
    });

    // Tira neón del sube y baja (combina colores de sus dos osciladores)
    const neonMatA = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.characterA.oscillator.color),
      emissive: new THREE.Color(this.characterA.oscillator.color),
      emissiveIntensity: 0.8,
      roughness: 0.1
    });

    const neonMatB = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.characterB.oscillator.color),
      emissive: new THREE.Color(this.characterB.oscillator.color),
      emissiveIntensity: 0.8,
      roughness: 0.1
    });

    // 1. Base piramidal / pedestal geométrico central
    const baseGeo = new THREE.CylinderGeometry(0.35, 0.6, 0.9, 6);
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.45;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    this.group.add(baseMesh);

    // Pivote central cilíndrico de cromo
    const axleGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.65, 16);
    axleGeo.rotateZ(Math.PI / 2);
    const axleMesh = new THREE.Mesh(axleGeo, chromeMat);
    axleMesh.position.y = 0.9;
    this.group.add(axleMesh);

    // 2. Grupo basculante (Tabla móvil)
    this.plankGroup = new THREE.Group();
    this.plankGroup.position.y = 0.9;
    this.group.add(this.plankGroup);

    // Tabla principal metálica
    const plankGeo = new THREE.BoxGeometry(this.armLength * 2 + 0.4, 0.08, 0.42);
    const plankMesh = new THREE.Mesh(plankGeo, chromeMat);
    plankMesh.castShadow = true;
    plankMesh.receiveShadow = true;
    this.plankGroup.add(plankMesh);

    // Tiras luminiscentes neón a los lados de la tabla
    const stripGeoA = new THREE.BoxGeometry(this.armLength + 0.1, 0.03, 0.04);
    const stripA = new THREE.Mesh(stripGeoA, neonMatA);
    stripA.position.set(-this.armLength / 2, -0.04, 0.22);

    const stripGeoB = new THREE.BoxGeometry(this.armLength + 0.1, 0.03, 0.04);
    const stripB = new THREE.Mesh(stripGeoB, neonMatB);
    stripB.position.set(this.armLength / 2, -0.04, 0.22);

    this.plankGroup.add(stripA, stripB);

    // Asientos de diseño
    const seatGeo = new THREE.BoxGeometry(0.42, 0.06, 0.42);
    const seatA = new THREE.Mesh(seatGeo, seatMat);
    seatA.position.set(-this.armLength, 0.07, 0);

    const seatB = new THREE.Mesh(seatGeo, seatMat);
    seatB.position.set(this.armLength, 0.07, 0);

    this.plankGroup.add(seatA, seatB);

    // Manubrios verticales neón
    const handleGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.32, 12);
    const handleA = new THREE.Mesh(handleGeo, neonMatA);
    handleA.position.set(-this.armLength + 0.25, 0.2, 0);
    const handleB = new THREE.Mesh(handleGeo, neonMatB);
    handleB.position.set(this.armLength - 0.25, 0.2, 0);
    this.plankGroup.add(handleA, handleB);

    // 3. Montar los personajes en sus respectivos asientos
    this.characterA.group.position.set(-this.armLength, 0.1, 0);
    this.characterB.group.position.set(this.armLength, 0.1, 0);
    this.characterB.group.rotation.y = Math.PI;

    this.plankGroup.add(this.characterA.group, this.characterB.group);
  }

  /**
   * Actualiza la inclinación de la tabla y los personajes según las fases de Kuramoto
   */
  update() {
    const thetaA = this.characterA.oscillator.theta;
    const thetaB = this.characterB.oscillator.theta;

    // Actualizar micro-animaciones y salto reactivo individual de los personajes
    this.characterA.update(thetaA);
    this.characterB.update(thetaB);

    const sinA = Math.sin(thetaA);
    const sinB = Math.sin(thetaB);

    // Ángulo basculante de la tabla
    const tilt = ((sinB - sinA) / 2) * this.maxTiltAngle;
    this.plankGroup.rotation.z = THREE.MathUtils.lerp(this.plankGroup.rotation.z, tilt, 0.2);
  }
}
