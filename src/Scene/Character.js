import * as THREE from 'three';

/**
 * Nombres de los 8 círculos del Infierno
 */
export const CIRCLE_NAMES = [
  'Limbo', 'Lujuria', 'Gula', 'Avaricia',
  'Ira', 'Pereza', 'Violencia', 'Traición'
];

/**
 * Paleta oscura y deteriorada — muñecos viejos de patio nocturno.
 * Cada color identifica un círculo sin recurrir a la estética synth-pop.
 */
const DARK_PALETTE = [
  '#2e2c2c', // 0 Limbo        — ceniza grisácea
  '#5c1a28', // 1 Lujuria      — vino oscuro
  '#4a2a12', // 2 Gula         — marrón herrumbre
  '#3a360e', // 3 Avaricia     — oliva sucio
  '#6e2606', // 4 Ira          — naranja oxidado
  '#1e2e1e', // 5 Pereza       — verde moho oscuro
  '#521010', // 6 Violencia    — ladrillo oscuro
  '#1e1030', // 7 Traición     — violeta oscuro
];

export class Character {
  /**
   * @param {Object} config
   * @param {import('../core/Oscillator.js').Oscillator} config.oscillator
   * @param {THREE.Color | string} config.color  ← color del oscilador (usado en UI y accent)
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
    const id = this.oscillator.id % 8;

    // ── Materiales ────────────────────────────────────────────────────────
    // Color principal: paleta oscura y deteriorada
    const darkColor = new THREE.Color(DARK_PALETTE[id]);

    // Material de plástico viejo mate — cuerpo y extremidades
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x110d0d,
      roughness: 0.94,
      metalness: 0.0
    });

    // Material de identificación — color del círculo, muy apagado
    this.mainMaterial = new THREE.MeshStandardMaterial({
      color: darkColor,
      roughness: 0.90,
      metalness: 0.0,
      emissive: darkColor,
      emissiveIntensity: 0.05
    });

    // Accent muy sutil del color del oscilador (solo en un pequeño detalle)
    const accentMat = new THREE.MeshStandardMaterial({
      color: this.baseColor,
      roughness: 0.88,
      metalness: 0.0,
      emissive: this.baseColor,
      emissiveIntensity: 0.07
    });

    // ── Proporciones por personaje ─────────────────────────────────────────
    // legLen: longitud de piernas (determina la altura total)
    // torsoH: altura del torso
    // torsoRTop/Bot: radio superior/inferior del torso
    // neckH: altura del cuello
    // armLen: longitud del brazo
    // armR: radio del brazo
    // armOffL/R: desplazamiento lateral del hombro
    // armYRel: altura del hombro relativa al tope del torso (negativo = más abajo)
    // bodyTiltX: inclinación del cuerpo completo en X (adelante/atrás)
    // armInitXL/R: rotación inicial del brazo en X (adelante/atrás)
    // armInitYL/R: rotación inicial del brazo en Y (torsión)

    let legLen = 0.52, legR = 0.055;
    let torsoH = 0.80, torsoRTop = 0.13, torsoRBot = 0.16;
    let neckH = 0.20;
    let armLen = 0.58, armR = 0.044;
    let armOffL = -0.25, armOffR = 0.25;
    let armYRel = -0.06;         // posición Y del hombro respecto al tope del torso
    let bodyTiltX = 0;
    let armInitXL = 0, armInitXR = 0;
    let armInitYL = 0, armInitYR = 0;

    switch (id) {
      case 0: // LIMBO — rígido, vertical, congelado, sin vida
        legLen = 0.55; legR = 0.050;
        torsoH = 0.88; torsoRTop = 0.11; torsoRBot = 0.14;
        neckH = 0.26;
        armLen = 0.56; armR = 0.040;
        armOffL = -0.23; armOffR = 0.23;
        armYRel = -0.04;
        // brazos totalmente verticales, pegados al cuerpo
        armInitXL = 0.02; armInitXR = 0.02;
        break;

      case 1: // LUJURIA — delgada, inclinada, brazos extendidos
        legLen = 0.58; legR = 0.044;
        torsoH = 0.78; torsoRTop = 0.09; torsoRBot = 0.12;
        neckH = 0.22;
        armLen = 0.70; armR = 0.036; // brazos muy largos
        armOffL = -0.26; armOffR = 0.26;
        armYRel = -0.04;
        bodyTiltX = -0.20;           // inclinada hacia adelante/otras figuras
        armInitXL = 0.38; armInitXR = 0.38; // brazos extendidos
        armInitYL = 0.15; armInitYR = -0.15;
        break;

      case 2: // GULA — ancha, pesada, baja, extremidades cortas
        legLen = 0.32; legR = 0.072;
        torsoH = 0.60; torsoRTop = 0.30; torsoRBot = 0.34;
        neckH = 0.10;
        armLen = 0.38; armR = 0.065;
        armOffL = -0.36; armOffR = 0.36;
        armYRel = -0.10;
        break;

      case 3: // AVARICIA — encogida, protectora, brazos cerrados
        legLen = 0.50; legR = 0.052;
        torsoH = 0.72; torsoRTop = 0.12; torsoRBot = 0.15;
        neckH = 0.16;
        armLen = 0.52; armR = 0.042;
        armOffL = -0.21; armOffR = 0.21;
        armYRel = -0.08;
        bodyTiltX = -0.14;
        armInitXL = -0.50; armInitXR = -0.50; // brazos doblados hacia adentro
        armInitYL = 0.45; armInitYR = -0.45;
        break;

      case 4: // IRA — angular, hombros alzados, tenso
        legLen = 0.54; legR = 0.058;
        torsoH = 0.78; torsoRTop = 0.19; torsoRBot = 0.15; // invertido: más ancho arriba
        neckH = 0.14;
        armLen = 0.60; armR = 0.054;
        armOffL = -0.30; armOffR = 0.30;
        armYRel = 0.02;   // hombros más altos
        armInitXL = 0.28; armInitXR = 0.28; // brazos ligeramente adelantados
        break;

      case 5: // PEREZA — encorvada, caída, sin fuerza
        legLen = 0.44; legR = 0.053;
        torsoH = 0.65; torsoRTop = 0.14; torsoRBot = 0.18;
        neckH = 0.12;
        armLen = 0.60; armR = 0.040;
        armOffL = -0.24; armOffR = 0.24;
        armYRel = -0.14; // hombros bajos y caídos
        bodyTiltX = 0.28; // cuerpo encorvado hacia adelante
        armInitXL = 0.62; armInitXR = 0.62; // brazos colgando hacia adelante
        break;

      case 6: // VIOLENCIA — torso inclinado, listo para golpear
        legLen = 0.52; legR = 0.060;
        torsoH = 0.76; torsoRTop = 0.16; torsoRBot = 0.20;
        neckH = 0.16;
        armLen = 0.62; armR = 0.054;
        armOffL = -0.27; armOffR = 0.30; // leve asimetría
        armYRel = -0.04;
        bodyTiltX = -0.24; // torso inclinado agresivamente
        armInitXL = 0.12; armInitXR = 0.32; // brazo derecho adelantado
        break;

      case 7: // TRAICIÓN — asimétrico, retorcido, irregular
        legLen = 0.50; legR = 0.050;
        torsoH = 0.74; torsoRTop = 0.12; torsoRBot = 0.16;
        neckH = 0.20;
        armLen = 0.58; armR = 0.040;
        armOffL = -0.19; armOffR = 0.30; // asimetría pronunciada
        armYRel = -0.06;
        bodyTiltX = -0.10;
        armInitXL = -0.32; armInitXR = 0.55; // un brazo atrás, el otro adelante
        armInitYL = -0.50; armInitYR = 0.20;
        break;
    }

    // ── Grupo central del cuerpo (se puede inclinar globalmente) ──────────
    const bodyGroup = new THREE.Group();
    this.group.add(bodyGroup);

    // ── PIERNAS ────────────────────────────────────────────────────────────
    const legGeo = new THREE.CylinderGeometry(legR * 0.88, legR, legLen, 7);

    const leftLeg = new THREE.Mesh(legGeo, bodyMat);
    leftLeg.position.set(-0.09, legLen * 0.5, 0.02);
    leftLeg.rotation.x = 0.07;
    bodyGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, bodyMat);
    rightLeg.position.set(0.09, legLen * 0.5, 0.02);
    rightLeg.rotation.x = 0.07;
    bodyGroup.add(rightLeg);

    // Pies angulares — cajas rectangulares delgadas
    const footGeo = new THREE.BoxGeometry(0.09, 0.055, 0.17);
    const footL = new THREE.Mesh(footGeo, this.mainMaterial);
    footL.position.set(-0.09, 0.02, 0.06);
    bodyGroup.add(footL);
    const footR = new THREE.Mesh(footGeo, this.mainMaterial);
    footR.position.set(0.09, 0.02, 0.06);
    bodyGroup.add(footR);

    // Base del torso = cima de las piernas
    const torsoBaseY = legLen;

    // ── TORSO ─────────────────────────────────────────────────────────────
    // Gula usa una caja ancha y baja (volumen pesado, pero angular, no esférica)
    const torsoGeo = id === 2
      ? new THREE.BoxGeometry(torsoRBot * 2.15, torsoH, torsoRBot * 1.75)
      : new THREE.CylinderGeometry(torsoRTop, torsoRBot, torsoH, 7);

    const torsoMesh = new THREE.Mesh(torsoGeo, bodyMat);
    torsoMesh.position.y = torsoBaseY + torsoH * 0.5;
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    bodyGroup.add(torsoMesh);

    // Franja de color estrecha en el torso — marca de identidad del personaje
    const bandR = (id === 2) ? torsoRBot + 0.015 : torsoRTop + 0.012;
    const bandGeo = new THREE.CylinderGeometry(bandR, bandR, 0.085, 7);
    const band = new THREE.Mesh(bandGeo, this.mainMaterial);
    band.position.y = torsoBaseY + torsoH * 0.58;
    bodyGroup.add(band);

    // Articulaciones de hombros marcadas
    const shoulderGeo = new THREE.SphereGeometry(0.060, 6, 5);
    const shL = new THREE.Mesh(shoulderGeo, this.mainMaterial);
    shL.position.set(-0.22, torsoBaseY + torsoH + armYRel, 0);
    bodyGroup.add(shL);
    const shR = new THREE.Mesh(shoulderGeo, this.mainMaterial);
    shR.position.set(0.22, torsoBaseY + torsoH + armYRel, 0);
    bodyGroup.add(shR);

    // ── CUELLO ────────────────────────────────────────────────────────────
    const neckGeo = new THREE.CylinderGeometry(
      torsoRTop * 0.50, torsoRTop * 0.60, neckH, 6
    );
    const neckMesh = new THREE.Mesh(neckGeo, bodyMat);
    const neckCenterY = torsoBaseY + torsoH + neckH * 0.5;
    neckMesh.position.y = neckCenterY;
    bodyGroup.add(neckMesh);

    // ── CABEZA — geometría deformada / geométrica ─────────────────────────
    let headGeo;
    switch (id) {
      case 0: // Limbo: caja rectangular alargada, inexpresiva
        headGeo = new THREE.BoxGeometry(0.34, 0.44, 0.28);
        break;
      case 1: // Lujuria: icosaedro facetado alargado — no una esfera perfecta
        headGeo = new THREE.IcosahedronGeometry(0.19, 0);
        break;
      case 2: // Gula: caja grande y aplastada
        headGeo = new THREE.BoxGeometry(0.50, 0.34, 0.44);
        break;
      case 3: // Avaricia: prisma hexagonal puntiagudo (pirámide truncada)
        headGeo = new THREE.CylinderGeometry(0.08, 0.26, 0.40, 6);
        break;
      case 4: // Ira: cubo angular, aristas marcadas
        headGeo = new THREE.BoxGeometry(0.36, 0.38, 0.34);
        break;
      case 5: // Pereza: octaedro aplastado y caído
        headGeo = new THREE.OctahedronGeometry(0.27, 0);
        break;
      case 6: // Violencia: cilindro achatado — aplastado, brutal
        headGeo = new THREE.CylinderGeometry(0.24, 0.27, 0.28, 7);
        break;
      case 7: // Traición: dodecaedro asimétrico
        headGeo = new THREE.DodecahedronGeometry(0.22, 0);
        break;
      default:
        headGeo = new THREE.BoxGeometry(0.34, 0.38, 0.28);
    }

    const headCenterY = torsoBaseY + torsoH + neckH + 0.22;
    const headMesh = new THREE.Mesh(headGeo, this.mainMaterial);
    headMesh.position.y = headCenterY;
    headMesh.castShadow = true;

    // Asimetría o deformación inicial en algunos personajes
    if (id === 1) { headMesh.scale.set(0.90, 1.35, 1.0); }  // alargada + leve asimetría lateral
    if (id === 7) { headMesh.rotation.y = 0.28; }           // retorcido
    if (id === 4) { headMesh.rotation.z = 0.08; }           // levemente torcido — tenso

    bodyGroup.add(headMesh);
    this.limbs.head = headMesh;

    // Pequeña marca de acento en la cabeza (sin cara, sin ojos, sin boca)
    // Una sola hendidura rectangular oscura como una grieta
    if (id !== 2 && id !== 5) {
      const crackGeo = new THREE.BoxGeometry(0.18, 0.03, 0.05);
      const crack = new THREE.Mesh(crackGeo, accentMat);
      crack.position.set(0, headCenterY - 0.04, 0.14 + torsoRTop * 0.3);
      bodyGroup.add(crack);
    }

    // ── BRAZOS ────────────────────────────────────────────────────────────
    const armGeo = new THREE.CylinderGeometry(armR * 0.85, armR, armLen, 7);

    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(armOffL, torsoBaseY + torsoH + armYRel, 0);
    leftArmGroup.rotation.x = armInitXL;
    leftArmGroup.rotation.y = armInitYL;

    const leftArmMesh = new THREE.Mesh(armGeo, bodyMat);
    leftArmMesh.position.y = -armLen * 0.5;
    leftArmGroup.add(leftArmMesh);

    // Mano angular — caja pequeña, no esférica
    const handGeo = new THREE.BoxGeometry(0.09, 0.075, 0.085);
    const handL = new THREE.Mesh(handGeo, this.mainMaterial);
    handL.position.y = -armLen - 0.035;
    leftArmGroup.add(handL);

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(armOffR, torsoBaseY + torsoH + armYRel, 0);
    rightArmGroup.rotation.x = armInitXR;
    rightArmGroup.rotation.y = armInitYR;

    const rightArmMesh = new THREE.Mesh(armGeo, bodyMat);
    rightArmMesh.position.y = -armLen * 0.5;
    rightArmGroup.add(rightArmMesh);

    const handR = new THREE.Mesh(handGeo, this.mainMaterial);
    handR.position.y = -armLen - 0.035;
    rightArmGroup.add(handR);

    bodyGroup.add(leftArmGroup, rightArmGroup);
    this.limbs.leftArm = leftArmGroup;
    this.limbs.rightArm = rightArmGroup;

    // ── Inclinación global del cuerpo ──────────────────────────────────────
    bodyGroup.rotation.x = bodyTiltX;

    // ── ANILLO DE SELECCIÓN (invisible hasta interacción) ─────────────────
    const ringGeo = new THREE.RingGeometry(0.40, 0.48, 24);
    ringGeo.rotateX(-Math.PI / 2);
    this.highlightMat = new THREE.MeshBasicMaterial({
      color: this.baseColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0
    });
    this.highlightRing = new THREE.Mesh(ringGeo, this.highlightMat);
    this.highlightRing.position.y = 0.01;
    this.group.add(this.highlightRing);

    // userData para raycasting
    torsoMesh.userData = { character: this };
    headMesh.userData = { character: this };
  }

  /**
   * Actualiza el personaje según la fase theta de Kuramoto.
   * Mantiene la misma API que la versión anterior.
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