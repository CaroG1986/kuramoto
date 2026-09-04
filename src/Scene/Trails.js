import * as THREE from 'three';

/**
 * Sistema de estelas de luz neón tipo fibra óptica que reaccionan a los osciladores y al grado de orden R.
 */
export class Trails {
  /**
   * @param {THREE.Scene} scene
   * @param {import('./Character.js').Character[]} characters
   */
  constructor(scene, characters) {
    this.scene = scene;
    this.characters = characters;

    this.particleCountPerChar = 45;
    this.totalParticles = characters.length * this.particleCountPerChar;

    this._initTrailParticles();
  }

  _initTrailParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.totalParticles * 3);
    const colors = new Float32Array(this.totalParticles * 3);
    const sizes = new Float32Array(this.totalParticles);

    let index = 0;
    for (let c = 0; c < this.characters.length; c++) {
      const charColor = this.characters[c].baseColor;
      for (let p = 0; p < this.particleCountPerChar; p++) {
        positions[index * 3] = 0;
        positions[index * 3 + 1] = -100;
        positions[index * 3 + 2] = 0;

        colors[index * 3] = charColor.r;
        colors[index * 3 + 1] = charColor.g;
        colors[index * 3 + 2] = charColor.b;

        sizes[index] = (1 - p / this.particleCountPerChar) * 0.2;
        index++;
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Material de luz neón aditivo
    const material = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particleSystem = new THREE.Points(geometry, material);
    this.scene.add(this.particleSystem);

    this.history = this.characters.map(() => []);
  }

  /**
   * Actualiza las estelas de luz neón en cada cuadro.
   * @param {number} orderR - Parámetro de orden Kuramoto (0 a 1)
   */
  update(orderR) {
    const posAttr = this.particleSystem.geometry.attributes.position;
    const array = posAttr.array;

    for (let c = 0; c < this.characters.length; c++) {
      const char = this.characters[c];
      const charHist = this.history[c];

      if (char.oscillator.active) {
        const headPos = new THREE.Vector3();
        char.limbs.head.getWorldPosition(headPos);

        charHist.unshift(headPos);
        if (charHist.length > this.particleCountPerChar) {
          charHist.pop();
        }
      } else {
        charHist.length = 0;
      }

      const baseIdx = c * this.particleCountPerChar;
      for (let p = 0; p < this.particleCountPerChar; p++) {
        const idx = (baseIdx + p) * 3;
        if (p < charHist.length) {
          const pt = charHist[p];
          array[idx] = pt.x;
          array[idx + 1] = pt.y;
          array[idx + 2] = pt.z;
        } else {
          array[idx + 1] = -100;
        }
      }
    }

    // Intensificar estelas a medida que R aumenta
    this.particleSystem.material.opacity = 0.6 + orderR * 0.35;
    posAttr.needsUpdate = true;
  }
}
