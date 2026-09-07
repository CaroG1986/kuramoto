import * as THREE from 'three';

/**
 * Representa la Rueda (Carousel/Tiovivo) infernal de estilo synth-pop (asociada a Limbo y Traición).
 */
export class Wheel {
  constructor({ position = new THREE.Vector3(3.5, 0, 2.5) } = {}) {
    this.group = new THREE.Group();
    this.group.position.copy(position);

    this.wheelRotation = 0;
    this.rotationSpeed = 0;

    this._buildMesh();
  }

  _buildMesh() {
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

    const neonMatLimbo = new THREE.MeshStandardMaterial({
      color: 0xff007f, // Magenta / Limbo
      emissive: 0xff007f,
      emissiveIntensity: 0.8,
      roughness: 0.1
    });

    const neonMatTreachery = new THREE.MeshStandardMaterial({
      color: 0xff00aa, // Rosa Neón / Traición
      emissive: 0xff00aa,
      emissiveIntensity: 0.8,
      roughness: 0.1
    });

    // 1. Base fija en el suelo
    const baseGeo = new THREE.CylinderGeometry(0.5, 0.7, 0.2, 24);
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.1;
    this.group.add(baseMesh);

    // 2. Grupo giratorio de la rueda
    this.wheelGroup = new THREE.Group();
    this.wheelGroup.position.y = 0.2;
    this.group.add(this.wheelGroup);

    // Plataforma circular giratoria
    const discRadius = 2.0;
    const discGeo = new THREE.CylinderGeometry(discRadius, discRadius, 0.1, 32);
    const discMesh = new THREE.Mesh(discGeo, chromeMat);
    discMesh.position.y = 0.05;
    this.wheelGroup.add(discMesh);

    // Patrón radial neón en el suelo de la rueda
    const spokeCount = 6;
    const spokeGeo = new THREE.BoxGeometry(discRadius * 1.9, 0.02, 0.06);
    for (let i = 0; i < spokeCount / 2; i++) {
      const spoke = new THREE.Mesh(spokeGeo, i % 2 === 0 ? neonMatLimbo : neonMatTreachery);
      spoke.position.y = 0.11;
      spoke.rotation.y = (i / (spokeCount / 2)) * Math.PI;
      this.wheelGroup.add(spoke);
    }

    // Baranda exterior
    const railRadius = 1.9;
    const barCount = 8;
    const barGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.1, 12);
    for (let i = 0; i < barCount; i++) {
      const angle = (i / barCount) * Math.PI * 2;
      const bar = new THREE.Mesh(barGeo, chromeMat);
      bar.position.set(Math.cos(angle) * railRadius, 0.6, Math.sin(angle) * railRadius);
      this.wheelGroup.add(bar);
    }

    // Aro superior neón
    const ringGeo = new THREE.TorusGeometry(railRadius, 0.04, 12, 32);
    ringGeo.rotateX(Math.PI / 2);
    const ringMesh = new THREE.Mesh(ringGeo, neonMatLimbo);
    ringMesh.position.y = 1.15;
    this.wheelGroup.add(ringMesh);

    // 3. Asiento central para Limbo
    const centerSeatGeo = new THREE.CylinderGeometry(0.4, 0.45, 0.4, 16);
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x090c12, roughness: 0.4, metalness: 0.6 });
    const centerSeat = new THREE.Mesh(centerSeatGeo, seatMat);
    centerSeat.position.y = 0.3;
    this.wheelGroup.add(centerSeat);

    // Cojín central
    const cushionGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.1, 16);
    const cushion = new THREE.Mesh(cushionGeo, neonMatLimbo);
    cushion.position.y = 0.52;
    this.wheelGroup.add(cushion);
  }

  /**
   * Actualiza la rotación de la rueda
   * @param {number} deltaRotation 
   */
  update(deltaRotation = 0) {
    this.wheelRotation += deltaRotation;
    this.wheelGroup.rotation.y = this.wheelRotation;
  }
}
