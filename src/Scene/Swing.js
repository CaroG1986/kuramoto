import * as THREE from 'three';

/**
 * Representa el Columpio infernal de estilo synth-pop/retrofuturista (asociado a Pereza).
 */
export class Swing {
  constructor({ position = new THREE.Vector3(3.5, 0, -2.5), rotationY = -Math.PI / 6 } = {}) {
    this.group = new THREE.Group();
    this.group.position.copy(position);
    this.group.rotation.y = rotationY;

    this.swingAngle = 0;
    
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
      color: 0xffe600, // Amarillo neón / Pereza
      emissive: 0xffe600,
      emissiveIntensity: 0.8,
      roughness: 0.1
    });

    const height = 3.2;
    const width = 2.4;

    // 1. Estructura lateral en A (Patas)
    const legGeo = new THREE.CylinderGeometry(0.06, 0.08, height + 0.4, 12);
    
    // Izquierda
    const legA1 = new THREE.Mesh(legGeo, frameMat);
    legA1.position.set(-width / 2, height / 2, 0.6);
    legA1.rotation.z = 0.15;
    legA1.rotation.x = -0.25;

    const legA2 = new THREE.Mesh(legGeo, frameMat);
    legA2.position.set(-width / 2, height / 2, -0.6);
    legA2.rotation.z = 0.15;
    legA2.rotation.x = 0.25;

    // Derecha
    const legB1 = new THREE.Mesh(legGeo, frameMat);
    legB1.position.set(width / 2, height / 2, 0.6);
    legB1.rotation.z = -0.15;
    legB1.rotation.x = -0.25;

    const legB2 = new THREE.Mesh(legGeo, frameMat);
    legB2.position.set(width / 2, height / 2, -0.6);
    legB2.rotation.z = -0.15;
    legB2.rotation.x = 0.25;

    this.group.add(legA1, legA2, legB1, legB2);

    // 2. Barra transversal superior
    const barGeo = new THREE.CylinderGeometry(0.07, 0.07, width + 0.6, 16);
    barGeo.rotateZ(Math.PI / 2);
    const topBar = new THREE.Mesh(barGeo, chromeMat);
    topBar.position.set(0, height, 0);
    this.group.add(topBar);

    // Detalle neón en los extremos de la barra
    const capGeo = new THREE.SphereGeometry(0.1, 12, 12);
    const capL = new THREE.Mesh(capGeo, neonMat);
    capL.position.set(-width / 2 - 0.3, height, 0);
    const capR = new THREE.Mesh(capGeo, neonMat);
    capR.position.set(width / 2 + 0.3, height, 0);
    this.group.add(capL, capR);

    // 3. Grupo basculante del columpio (Pivota desde la barra superior)
    this.swingGroup = new THREE.Group();
    this.swingGroup.position.set(0, height, 0);
    this.group.add(this.swingGroup);

    // Cadenas neón
    const chainHeight = 2.2;
    const chainGeo = new THREE.CylinderGeometry(0.02, 0.02, chainHeight, 8);
    
    const chainL = new THREE.Mesh(chainGeo, neonMat);
    chainL.position.set(-0.5, -chainHeight / 2, 0);

    const chainR = new THREE.Mesh(chainGeo, neonMat);
    chainR.position.set(0.5, -chainHeight / 2, 0);

    this.swingGroup.add(chainL, chainR);

    // Asiento
    const seatMat = new THREE.MeshStandardMaterial({
      color: 0x090c12,
      roughness: 0.4,
      metalness: 0.6
    });
    const seatGeo = new THREE.BoxGeometry(1.2, 0.08, 0.45);
    this.seatMesh = new THREE.Mesh(seatGeo, seatMat);
    this.seatMesh.position.set(0, -chainHeight, 0);
    this.swingGroup.add(this.seatMesh);
  }

  /**
   * Obtiene la posición global del asiento en el espacio 3D
   */
  getSeatWorldPosition(targetVector = new THREE.Vector3()) {
    return this.seatMesh.getWorldPosition(targetVector);
  }

  /**
   * Actualiza el ángulo de oscilación del columpio
   * @param {number} angle 
   */
  setSwingAngle(angle) {
    this.swingAngle = angle;
    this.swingGroup.rotation.x = angle;
  }
}
