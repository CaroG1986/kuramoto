import * as THREE from 'three';
import { Seesaw } from './Seesaw.js';
import { Swing } from './Swing.js';
import { Slide } from './Slide.js';
import { Wheel } from './Wheel.js';
import { Character } from './Character.js';
import { Trails } from './Trails.js';

// Importar los 8 comportamientos modulares de los Círculos del Infierno
import { LimboBehavior } from '../behaviors/LimboBehavior.js';
import { LustBehavior } from '../behaviors/LustBehavior.js';
import { GluttonyBehavior } from '../behaviors/GluttonyBehavior.js';
import { GreedBehavior } from '../behaviors/GreedBehavior.js';
import { WrathBehavior } from '../behaviors/WrathBehavior.js';
import { SlothBehavior } from '../behaviors/SlothBehavior.js';
import { ViolenceBehavior } from '../behaviors/ViolenceBehavior.js';
import { TreacheryBehavior } from '../behaviors/TreacheryBehavior.js';

/**
 * Escenario 3D del Patio de Juegos Infernal Synth-Pop / Instalación Audiovisual Nocturna.
 */
export class Playground {
  /**
   * @param {THREE.Scene} scene
   * @param {import('../core/KuramotoSystem.js').KuramotoSystem} kuramotoSystem
   */
  constructor(scene, kuramotoSystem) {
    this.scene = scene;
    this.kuramoto = kuramotoSystem;
    
    this.characters = [];
    this.reactiveLights = [];

    this._setupLighting();
    this._buildEnvironment();
    this._buildEquipmentAndCharacters();
    this._initBehaviors();

    // Sistema de estelas de luz neón
    this.trails = new Trails(this.scene, this.characters);
  }

  /**
   * Configura la iluminación ambiental nocturna e infernal con luces neón reactivas
   */
  _setupLighting() {
    const ambient = new THREE.AmbientLight(0x120d20, 0.7);
    this.scene.add(ambient);

    const hemiLight = new THREE.HemisphereLight(0x4a154b, 0x05070e, 0.6);
    hemiLight.position.set(0, 40, 0);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xff007f, 1.2);
    dirLight.position.set(12, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.bias = -0.0004;
    this.scene.add(dirLight);

    const lightColors = [0xff007f, 0x00f3ff, 0x9d00ff, 0x39ff14];
    const lightRadius = 7.0;

    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const pLight = new THREE.PointLight(lightColors[i], 2.8, 14);
      pLight.position.set(Math.cos(angle) * lightRadius, 1.8, Math.sin(angle) * lightRadius);
      this.scene.add(pLight);
      this.reactiveLights.push({ light: pLight, baseColor: new THREE.Color(lightColors[i]), angle });
    }
  }

  /**
   * Construye la plataforma circular y los postes del patio de juegos infernal
   */
  _buildEnvironment() {
    const floorGeo = new THREE.CylinderGeometry(9.5, 9.5, 0.3, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x07090e,
      roughness: 0.4,
      metalness: 0.7
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -0.15;
    floorMesh.receiveShadow = true;
    this.scene.add(floorMesh);

    const gridHelper = new THREE.GridHelper(19, 38, 0xff007f, 0x1a2130);
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);

    const ringGeo = new THREE.RingGeometry(6.0, 6.18, 64);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = 0.02;
    this.scene.add(ringMesh);

    const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.4, 12);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x121722, roughness: 0.3, metalness: 0.8 });
    const capGeo = new THREE.SphereGeometry(0.14, 12, 12);

    const postCount = 8;
    for (let i = 0; i < postCount; i++) {
      const angle = (i / postCount) * Math.PI * 2;
      const radius = 8.8;
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(Math.cos(angle) * radius, 0.7, Math.sin(angle) * radius);
      post.castShadow = true;

      const oscColor = this.kuramoto.oscillators[i].color;
      const capMat = new THREE.MeshStandardMaterial({
        color: oscColor,
        emissive: oscColor,
        emissiveIntensity: 0.8
      });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 0.75;
      post.add(cap);

      this.scene.add(post);
    }
  }

  /**
   * Instancia el equipamiento del patio y los 8 personajes asociados a sus osciladores.
   */
  _buildEquipmentAndCharacters() {
    const oscs = this.kuramoto.oscillators;

    for (let i = 0; i < 8; i++) {
      const char = new Character({ oscillator: oscs[i], color: oscs[i].color });
      this.characters.push(char);
    }

    // 1. ÚNICO Sube y Baja (Gula: oscs[2], Ira: oscs[4])
    this.seesaw = new Seesaw({
      id: 0,
      position: new THREE.Vector3(-3.8, 0, -1.0),
      rotationY: Math.PI / 6,
      oscA: oscs[2],
      oscB: oscs[4]
    });
    this.seesaw.characterA = this.characters[2];
    this.seesaw.characterB = this.characters[4];
    this.scene.add(this.seesaw.group);

    // 2. Columpio (Pereza: oscs[5], Violencia: oscs[6])
    this.swing = new Swing({
      position: new THREE.Vector3(3.8, 0, -2.2),
      rotationY: -Math.PI / 5
    });
    this.scene.add(this.swing.group);

    this.characters[5].group.position.set(0, 0, 0);
    this.swing.seatMesh.add(this.characters[5].group);

    this.characters[6].group.position.set(3.8, 0, -0.6);
    this.scene.add(this.characters[6].group);

    // 3. Tobogán (Avaricia: oscs[3])
    this.slide = new Slide({
      position: new THREE.Vector3(-3.6, 0, 3.2),
      rotationY: Math.PI / 4
    });
    this.scene.add(this.slide.group);

    const slideStart = this.slide.getLadderBottomWorldPos();
    this.characters[3].group.position.copy(slideStart);
    this.scene.add(this.characters[3].group);

    // 4. Rueda (Limbo: oscs[0], Traición: oscs[7])
    this.wheel = new Wheel({
      position: new THREE.Vector3(3.6, 0, 3.2)
    });
    this.scene.add(this.wheel.group);

    this.characters[0].group.position.set(0, 0.58, 0);
    this.wheel.wheelGroup.add(this.characters[0].group);

    this.characters[7].group.position.set(3.6, 0, 1.0);
    this.scene.add(this.characters[7].group);

    // Lujuria libre en el patio
    this.characters[1].group.position.set(0, 0, 0);
    this.scene.add(this.characters[1].group);
  }

  /**
   * Asigna e inicializa los 8 comportamientos conducidos por las fases de Kuramoto
   */
  _initBehaviors() {
    this.behaviors = {
      limbo: new LimboBehavior(this.characters[0], this.wheel),
      lust: new LustBehavior(this.characters[1], this.characters),
      gluttony: new GluttonyBehavior(this.characters[2], this.seesaw),
      greed: new GreedBehavior(this.characters[3], this.slide),
      wrath: new WrathBehavior(this.characters[4], this.seesaw),
      sloth: new SlothBehavior(this.characters[5], this.swing),
      violence: new ViolenceBehavior(this.characters[6], this.characters[5], this.swing),
      treachery: new TreacheryBehavior(this.characters[7], this.wheel)
    };

    // Vincular comportamientos en los objetos osciladores
    this.kuramoto.oscillators[0].behavior = this.behaviors.limbo;
    this.kuramoto.oscillators[1].behavior = this.behaviors.lust;
    this.kuramoto.oscillators[2].behavior = this.behaviors.gluttony;
    this.kuramoto.oscillators[3].behavior = this.behaviors.greed;
    this.kuramoto.oscillators[4].behavior = this.behaviors.wrath;
    this.kuramoto.oscillators[5].behavior = this.behaviors.sloth;
    this.kuramoto.oscillators[6].behavior = this.behaviors.violence;
    this.kuramoto.oscillators[7].behavior = this.behaviors.treachery;
  }

  /**
   * Actualización del escenario en cada cuadro
   * @param {number} orderR 
   * @param {number} dt 
   */
  update(orderR, dt = 0.016) {
    const oscs = this.kuramoto.oscillators;

    // Actualizar comportamientos individuales
    if (this.behaviors.limbo) this.behaviors.limbo.update(oscs[0].theta);
    if (this.behaviors.lust) this.behaviors.lust.update(oscs[1].theta, dt);
    if (this.behaviors.gluttony) this.behaviors.gluttony.update(oscs[2].theta);
    if (this.behaviors.greed) this.behaviors.greed.update(oscs[3].theta);
    if (this.behaviors.wrath) this.behaviors.wrath.update(oscs[4].theta);
    if (this.behaviors.sloth) this.behaviors.sloth.update(oscs[5].theta);
    if (this.behaviors.violence) this.behaviors.violence.update(oscs[6].theta);
    if (this.behaviors.treachery) this.behaviors.treachery.update(oscs[7].theta, dt);

    // =========================================================================
    // ETAPA 5: INTERACCIÓN DE COMPORTAMIENTO COLECTIVO GULA ↔ IRA EN EL SUBE Y BAJA
    // =========================================================================
    if (this.seesaw) {
      const gWeight = this.behaviors.gluttony ? this.behaviors.gluttony.getEffectiveWeightForce() : 3.0;
      const wForce = this.behaviors.wrath ? this.behaviors.wrath.getDownwardImpactForce() : 0;

      // Inclinación dinámica resultante: Gula (lado A) pesa más, pero los saltos de Ira (lado B) intentan moverlo
      const netTilt = Math.PI / 12 * (gWeight - wForce) / 3.5;
      this.seesaw.plankGroup.rotation.z = THREE.MathUtils.lerp(this.seesaw.plankGroup.rotation.z, -netTilt, 0.15);
    }

    // Actualizar animaciones base de personajes y estelas
    this.characters.forEach((char) => {
      char.update(char.oscillator.theta);
    });

    if (this.trails) this.trails.update(orderR);

    // Modulación reactiva de luces neón
    const time = performance.now() * 0.002;
    this.reactiveLights.forEach((item, idx) => {
      const pulseIncoherent = Math.sin(time * 3 + idx * 1.5);
      const pulseCoherent = Math.sin(time * 4 + this.kuramoto.meanPhase);
      const blendPulse = THREE.MathUtils.lerp(pulseIncoherent, pulseCoherent, orderR);
      item.light.intensity = 2.2 + blendPulse * (1.2 + orderR * 1.6);
    });
  }
}
