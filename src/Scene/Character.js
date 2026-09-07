import * as THREE from 'three';

/**
 * Nombres y colores distintivos de los 8 círculos del Infierno
 */
export const CIRCLE_NAMES = [
  'Limbo',
  'Lujuria',
  'Gula',
  'Avaricia',
  'Ira',
  'Pereza',
  'Violencia',
  'Traición'
];

export class Character {
  /**
   * @param {Object} config
   * @param {import('../core/Oscillator.js').Oscillator} config.oscillator
   * @param {THREE.Color | string} config.color
   */
  constructor({ oscillator, color }) {
    this.oscillator = oscillator;
    this.baseColor = new THREE.Color(color);
    this.group = new THREE.Group();
    this.selected = false;
    this.circleName = CIRCLE_NAMES[oscillator.id] || `Círculo ${oscillator.id + 1}`;

    this.limbs = {};
    this._buildCharacterMesh();
  }

  _buildCharacterMesh() {
    const oscId = this.oscillator.id % 8;

    this.mainMaterial = new THREE.MeshStandardMaterial({
      color: this.baseColor,
      roughness: 0.25,
      metalness: 0.3,
      emissive: this.baseColor,
      emissiveIntensity: 0.2
    });

    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x141824,
      roughness: 0.3,
      metalness: 0.8
    });

    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x05070c,
      roughness: 0.1,
      metalness: 0.9,
      emissive: this.baseColor,
      emissiveIntensity: 0.8
    });

    // Torso con morfología personalizada por círculo
    let bodyGeo;
    if (oscId === 2) {
      // Gula: Morfología más voluminosa / pesada
      bodyGeo = new THREE.SphereGeometry(0.38, 16, 16);
    } else if (oscId === 4) {
      // Ira: Morfología afilada / dramática
      bodyGeo = new THREE.ConeGeometry(0.32, 0.65, 5);
    } else if (oscId === 5) {
      // Pereza: Morfología encorvada / compacta
      bodyGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.5, 12);
    } else {
      // Torso estándar para los demás círculos
      bodyGeo = new THREE.CylinderGeometry(0.22, 0.26, 0.58, 16);
    }

    const bodyMesh = new THREE.Mesh(bodyGeo, darkMetalMat);
    bodyMesh.position.y = 0.3;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    this.group.add(bodyMesh);

    // Anillo distintivo en el pecho
    const chestRingGeo = new THREE.TorusGeometry(0.26, 0.025, 12, 24);
    chestRingGeo.rotateX(Math.PI / 2);
    const chestRing = new THREE.Mesh(chestRingGeo, this.mainMaterial);
    chestRing.position.y = 0.36;
    this.group.add(chestRing);

    // Cabeza con geometría expresiva según el círculo
    let headGeo;
    switch (oscId) {
      case 0: // Limbo: Esfenoide faceteada / aislada
        headGeo = new THREE.IcosahedronGeometry(0.24, 1);
        break;
      case 1: // Lujuria: Esférica fluida
        headGeo = new THREE.SphereGeometry(0.24, 20, 16);
        break;
      case 2: // Gula: Cúbica masiva
        headGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        break;
      case 3: // Avaricia: Cónica/Gema
        headGeo = new THREE.ConeGeometry(0.25, 0.44, 6);
        break;
      case 4: // Ira: Cilíndrica punzante
        headGeo = new THREE.CylinderGeometry(0.18, 0.24, 0.42, 16);
        break;
      case 5: // Pereza: Diamante encorvado
        headGeo = new THREE.OctahedronGeometry(0.24, 0);
        break;
      case 6: // Violencia: Cápsula ruda
        headGeo = new THREE.CapsuleGeometry(0.2, 0.2, 8, 16);
        break;
      case 7: // Traición: Dodecaedro enigmático
        headGeo = new THREE.DodecahedronGeometry(0.24, 0);
        break;
      default:
        headGeo = new THREE.SphereGeometry(0.24, 16, 16);
    }

    const headMesh = new THREE.Mesh(headGeo, this.mainMaterial);
    headMesh.position.y = 0.74;
    headMesh.castShadow = true;
    this.group.add(headMesh);
    this.limbs.head = headMesh;

    // Visor de neón synth-pop
    const visorGeo = new THREE.BoxGeometry(0.3, 0.08, 0.12);
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 0.75, 0.16);
    this.group.add(visorMesh);

    // Brazos articulados
    const armGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.32, 12);
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.28, 0.46, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, darkMetalMat);
    leftArmMesh.position.y = -0.14;
    leftArmGroup.add(leftArmMesh);

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.28, 0.46, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, darkMetalMat);
    rightArmMesh.position.y = -0.14;
    rightArmGroup.add(rightArmMesh);

    this.group.add(leftArmGroup, rightArmGroup);
    this.limbs.leftArm = leftArmGroup;
    this.limbs.rightArm = rightArmGroup;

    // Piernas
    const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.3, 12);
    const leftLeg = new THREE.Mesh(legGeo, darkMetalMat);
    leftLeg.rotation.x = Math.PI / 2.3;
    leftLeg.position.set(-0.1, 0.08, 0.14);

    const rightLeg = new THREE.Mesh(legGeo, darkMetalMat);
    rightLeg.rotation.x = Math.PI / 2.3;
    rightLeg.position.set(0.1, 0.08, 0.14);

    this.group.add(leftLeg, rightLeg);

    // Anillo de selección neón
    const ringGeo = new THREE.RingGeometry(0.38, 0.46, 32);
    ringGeo.rotateX(-Math.PI / 2);
    this.highlightMat = new THREE.MeshBasicMaterial({
      color: this.baseColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0
    });
    this.highlightRing = new THREE.Mesh(ringGeo, this.highlightMat);
    this.highlightRing.position.y = -0.02;
    this.group.add(this.highlightRing);

    bodyMesh.userData = { character: this };
    headMesh.userData = { character: this };
  }

  /**
   * Actualiza el personaje según la fase theta de Kuramoto
   * @param {number} theta 
   */
  update(theta) {
    const isActive = this.oscillator.active;
    this.group.visible = true;
    this.mainMaterial.opacity = isActive ? 1.0 : 0.2;
    this.mainMaterial.transparent = !isActive;

    if (!isActive) return;

    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);

    if (this.limbs.head) {
      this.limbs.head.rotation.z = sinT * 0.12;
      this.limbs.head.rotation.x = cosT * 0.08;
    }

    if (this.limbs.leftArm && this.limbs.rightArm) {
      this.limbs.leftArm.rotation.z = sinT * 0.2 + 0.15;
      this.limbs.rightArm.rotation.z = -sinT * 0.2 - 0.15;
    }

    if (this.selected) {
      this.highlightMat.opacity = 0.7 + sinT * 0.3;
    }
  }

  setSelected(isSelected) {
    this.selected = isSelected;
    this.highlightMat.opacity = isSelected ? 0.8 : 0;
  }
}
