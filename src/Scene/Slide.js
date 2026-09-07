import * as THREE from 'three';

/**
 * Representa el Tobogán infernal de estilo synth-pop/retrofuturista (asociado a Avaricia).
 */
export class Slide {
  constructor({ position = new THREE.Vector3(-3.5, 0, 2.5), rotationY = Math.PI / 4 } = {}) {
    this.group = new THREE.Group();
    this.group.position.copy(position);
    this.group.rotation.y = rotationY;

    this._buildMesh();
  }

  _buildMesh() {
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x121722,
      roughness: 0.3,
      metalness: 0.8
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0x3a4254,
      roughness: 0.15,
      metalness: 0.95
    });

    const neonMat = new THREE.MeshStandardMaterial({
      color: 0x0066ff, // Azul Eléctrico / Avaricia
      emissive: 0x0066ff,
      emissiveIntensity: 0.8,
      roughness: 0.1
    });

    const topHeight = 2.8;
    const slideLength = 3.6;

    // 1. Escalera / Peldaños
    const ladderGeo = new THREE.CylinderGeometry(0.04, 0.04, topHeight + 0.2, 12);
    const legL = new THREE.Mesh(ladderGeo, frameMat);
    legL.position.set(-0.35, topHeight / 2, -1.5);
    const legR = new THREE.Mesh(ladderGeo, frameMat);
    legR.position.set(0.35, topHeight / 2, -1.5);
    this.group.add(legL, legR);

    // Peldaños
    const stepCount = 6;
    const stepGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.7, 8);
    stepGeo.rotateZ(Math.PI / 2);
    for (let i = 1; i <= stepCount; i++) {
      const step = new THREE.Mesh(stepGeo, chromeMat);
      step.position.set(0, (i / (stepCount + 1)) * topHeight, -1.5);
      this.group.add(step);
    }

    // 2. Plataforma superior
    const platformGeo = new THREE.BoxGeometry(0.9, 0.08, 0.9);
    const platform = new THREE.Mesh(platformGeo, chromeMat);
    platform.position.set(0, topHeight, -1.05);
    this.group.add(platform);

    // Barandas de protección de la plataforma
    const railGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.7, 8);
    const railL = new THREE.Mesh(railGeo, neonMat);
    railL.position.set(-0.42, topHeight + 0.35, -1.05);
    const railR = new THREE.Mesh(railGeo, neonMat);
    railR.position.set(0.42, topHeight + 0.35, -1.05);
    this.group.add(railL, railR);

    // 3. Rampa / Chute del tobogán
    const slideAngle = Math.atan2(topHeight - 0.2, slideLength);
    const rampLength = Math.sqrt(Math.pow(topHeight - 0.2, 2) + Math.pow(slideLength, 2));

    const rampGeo = new THREE.BoxGeometry(0.8, 0.06, rampLength);
    const ramp = new THREE.Mesh(rampGeo, chromeMat);
    ramp.position.set(0, (topHeight + 0.2) / 2, (slideLength - 1.2) / 2);
    ramp.rotation.x = slideAngle;
    this.group.add(ramp);

    // Tiras neón laterales en la rampa
    const stripGeo = new THREE.BoxGeometry(0.04, 0.12, rampLength);
    const stripL = new THREE.Mesh(stripGeo, neonMat);
    stripL.position.set(-0.4, (topHeight + 0.2) / 2 + 0.04, (slideLength - 1.2) / 2);
    stripL.rotation.x = slideAngle;

    const stripR = new THREE.Mesh(stripGeo, neonMat);
    stripR.position.set(0.4, (topHeight + 0.2) / 2 + 0.04, (slideLength - 1.2) / 2);
    stripR.rotation.x = slideAngle;
    this.group.add(stripL, stripR);

    // Postes de soporte de la rampa
    const suppGeo = new THREE.CylinderGeometry(0.04, 0.04, topHeight / 2, 8);
    const suppL = new THREE.Mesh(suppGeo, frameMat);
    suppL.position.set(-0.35, topHeight / 4, 0.4);
    const suppR = new THREE.Mesh(suppGeo, frameMat);
    suppR.position.set(0.35, topHeight / 4, 0.4);
    this.group.add(suppL, suppR);
  }

  /**
   * Puntos clave en el mundo para el recorrido de Avaricia
   */
  getLadderBottomWorldPos(target = new THREE.Vector3()) {
    return target.set(0, 0, -1.5).applyMatrix4(this.group.matrixWorld);
  }

  getPlatformWorldPos(target = new THREE.Vector3()) {
    return target.set(0, 2.8, -1.05).applyMatrix4(this.group.matrixWorld);
  }

  getSlideBottomWorldPos(target = new THREE.Vector3()) {
    return target.set(0, 0.2, 1.8).applyMatrix4(this.group.matrixWorld);
  }
}
