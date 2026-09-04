import * as THREE from 'three';

/**
 * Representa a un personaje 3D estilizado tipo "Juguete de Diseño / Instalación Audiovisual"
 * que responde a la fase de Kuramoto y realiza un pequeño salto reactivo al impulso del sube y baja.
 */
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

    // Guardar piezas móviles para micro-animaciones
    this.limbs = {};

    this._buildCharacterMesh();
  }

  /**
   * Construye el personaje 3D estilizado como juguete de diseño / instrumento visual
   */
  _buildCharacterMesh() {
    const oscId = this.oscillator.id % 8;

    // Materiales synth-pop
    this.mainMaterial = new THREE.MeshStandardMaterial({
      color: this.baseColor,
      roughness: 0.25,
      metalness: 0.3,
      emissive: this.baseColor,
      emissiveIntensity: 0.15
    });

    const bodyMetalMat = new THREE.MeshStandardMaterial({
      color: 0x161b26,
      roughness: 0.3,
      metalness: 0.7
    });

    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x05070c,
      roughness: 0.1,
      metalness: 0.9,
      emissive: this.baseColor,
      emissiveIntensity: 0.6
    });

    // 1. Torso / Cuerpo estilizado (Cilindro con anillo cromado)
    const bodyGeo = new THREE.CylinderGeometry(0.2, 0.26, 0.58, 16);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMetalMat);
    bodyMesh.position.y = 0.3;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    this.group.add(bodyMesh);

    const chestRingGeo = new THREE.TorusGeometry(0.24, 0.025, 12, 24);
    chestRingGeo.rotateX(Math.PI / 2);
    const chestRing = new THREE.Mesh(chestRingGeo, this.mainMaterial);
    chestRing.position.y = 0.36;
    this.group.add(chestRing);

    // 2. Cabeza Única según ID del Oscilador (Identidad Individual de Juguete de Diseño)
    let headGeo;
    switch (oscId) {
      case 0: // Cabeza esfenoide/faceteada
        headGeo = new THREE.IcosahedronGeometry(0.22, 1);
        break;
      case 1: // Esférica pulida
        headGeo = new THREE.SphereGeometry(0.22, 20, 16);
        break;
      case 2: // Cúbica biselada
        headGeo = new THREE.BoxGeometry(0.38, 0.38, 0.38);
        break;
      case 3: // Cónica/Gema
        headGeo = new THREE.ConeGeometry(0.24, 0.42, 6);
        break;
      case 4: // Cilíndrica futurista
        headGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.38, 16);
        break;
      case 5: // Diamante/Octaedro
        headGeo = new THREE.OctahedronGeometry(0.24, 0);
        break;
      case 6: // Cápsula redondeada
        headGeo = new THREE.CapsuleGeometry(0.18, 0.18, 8, 16);
        break;
      case 7: // Dodecaedro
        headGeo = new THREE.DodecahedronGeometry(0.22, 0);
        break;
      default:
        headGeo = new THREE.SphereGeometry(0.22, 16, 16);
    }

    const headMesh = new THREE.Mesh(headGeo, this.mainMaterial);
    headMesh.position.y = 0.72;
    headMesh.castShadow = true;
    this.group.add(headMesh);
    this.limbs.head = headMesh;

    // Visor de neón synth-pop (reemplaza ojos infantiles)
    const visorGeo = new THREE.BoxGeometry(0.28, 0.08, 0.12);
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 0.73, 0.15);
    this.group.add(visorMesh);

    // Antena o Cresta Neón individual
    const crestGeo = new THREE.CylinderGeometry(0.02, 0.04, 0.2, 12);
    const crestMesh = new THREE.Mesh(crestGeo, visorMat);
    crestMesh.position.set(0, 0.96, 0);
    this.group.add(crestMesh);

    // 3. Brazos articulados
    const armGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.32, 12);
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.28, 0.46, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, bodyMetalMat);
    leftArmMesh.position.y = -0.14;
    leftArmGroup.add(leftArmMesh);

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.28, 0.46, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, bodyMetalMat);
    rightArmMesh.position.y = -0.14;
    rightArmGroup.add(rightArmMesh);

    this.group.add(leftArmGroup, rightArmGroup);
    this.limbs.leftArm = leftArmGroup;
    this.limbs.rightArm = rightArmGroup;

    // 4. Piernas en posición sentada
    const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.3, 12);
    const leftLeg = new THREE.Mesh(legGeo, bodyMetalMat);
    leftLeg.rotation.x = Math.PI / 2.3;
    leftLeg.position.set(-0.1, 0.08, 0.14);

    const rightLeg = new THREE.Mesh(legGeo, bodyMetalMat);
    rightLeg.rotation.x = Math.PI / 2.3;
    rightLeg.position.set(0.1, 0.08, 0.14);

    this.group.add(leftLeg, rightLeg);

    // 5. Anillo de selección neón
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

    // userData para Raycasting
    bodyMesh.userData = { character: this };
    headMesh.userData = { character: this };
  }

  /**
   * Actualiza la posición y animación del muñequito según la fase theta de Kuramoto.
   * Aplica un salto reactivo despegando suavemente del asiento solo durante el impulso ascendente.
   * @param {number} theta - Fase actual en radianes
   */
  update(theta) {
    const isActive = this.oscillator.active;

    // Atenuar visualmente si está inactivo
    this.group.visible = true;
    const targetOpacity = isActive ? 1.0 : 0.2;
    this.mainMaterial.opacity = targetOpacity;
    this.mainMaterial.transparent = !isActive;

    if (!isActive) return;

    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);

    // =========================================================================
    // SALTO REACTIVO AL IMPULSO DEL SUBE Y BAJA
    // =========================================================================
    // Cuando el asiento asciende (cosT > 0 y sinT > 0), despegamos suavemente del asiento
    let jumpOffset = 0;
    if (sinT > 0 && cosT > 0) {
      // Curva suave de salto durante la fase de ascenso inicial
      const jumpIntensity = Math.pow(sinT, 2);
      jumpOffset = jumpIntensity * 0.22; // Elevación elegante de despegue (0.22 unidades)
    }

    // Aplicar la elevación del salto sobre el grupo local del personaje
    this.group.position.y = THREE.MathUtils.lerp(this.group.position.y, 0.1 + jumpOffset, 0.25);

    // Micro-animación de cabeza y brazos reaccionando al despegue
    if (this.limbs.head) {
      this.limbs.head.rotation.z = sinT * 0.15;
      this.limbs.head.rotation.x = cosT * 0.1;
    }

    if (this.limbs.leftArm && this.limbs.rightArm) {
      // Levantar los brazos durante el despegue del salto
      const armLift = jumpOffset * 1.5;
      this.limbs.leftArm.rotation.z = sinT * 0.3 + 0.2 + armLift;
      this.limbs.rightArm.rotation.z = -sinT * 0.3 - 0.2 - armLift;
    }

    // Efecto de pulso si está seleccionado
    if (this.selected) {
      this.highlightMat.opacity = 0.7 + sinT * 0.3;
    }
  }

  /**
   * Marca el personaje como seleccionado / deseleccionado
   * @param {boolean} isSelected
   */
  setSelected(isSelected) {
    this.selected = isSelected;
    this.highlightMat.opacity = isSelected ? 0.8 : 0;
  }
}
