import * as THREE from 'three';
import { Seesaw } from './Seesaw.js';
import { Trails } from './Trails.js';

/**
 * Escenario 3D del Patio de Juegos Synth-Pop / Instalación Audiovisual Nocturna.
 */
export class Playground {
  /**
   * @param {THREE.Scene} scene
   * @param {import('../core/KuramotoSystem.js').KuramotoSystem} kuramotoSystem
   */
  constructor(scene, kuramotoSystem) {
    this.scene = scene;
    this.kuramoto = kuramotoSystem;
    this.seesaws = [];
    this.characters = [];
    this.reactiveLights = [];

    this._setupLighting();
    this._buildEnvironment();
    this._buildSeesaws();

    // Crear sistema de estelas de luz neón
    this.trails = new Trails(this.scene, this.characters);
  }

  /**
   * Configura la iluminación ambiental nocturna y las luces puntuales neón reactivas
   */
  _setupLighting() {
    // Luz ambiental tenue de tono azul violeta oscuro
    const ambient = new THREE.AmbientLight(0x1a162b, 0.7);
    this.scene.add(ambient);

    // Luz hemisférica nocturna
    const hemiLight = new THREE.HemisphereLight(0x6633aa, 0x05070e, 0.5);
    hemiLight.position.set(0, 40, 0);
    this.scene.add(hemiLight);

    // Luz direccional principal (luna neón / foco)
    const dirLight = new THREE.DirectionalLight(0x00e5ff, 1.2);
    dirLight.position.set(12, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.bias = -0.0004;
    this.scene.add(dirLight);

    // Luces puntuales reactivas neón en los 4 cuadrantes
    const lightColors = [0xff007f, 0x00f3ff, 0x9d00ff, 0x39ff14];
    const lightRadius = 6.5;

    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const pLight = new THREE.PointLight(lightColors[i], 2.5, 12);
      pLight.position.set(Math.cos(angle) * lightRadius, 1.5, Math.sin(angle) * lightRadius);
      this.scene.add(pLight);
      this.reactiveLights.push({ light: pLight, baseColor: new THREE.Color(lightColors[i]), angle });
    }
  }

  /**
   * Construye la plataforma del patio de juegos nocturno
   */
  _buildEnvironment() {
    // Suelo circular metálico oscuro
    const floorGeo = new THREE.CylinderGeometry(8.8, 8.8, 0.3, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x07090e,
      roughness: 0.4,
      metalness: 0.6
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -0.15;
    floorMesh.receiveShadow = true;
    this.scene.add(floorMesh);

    // Rejilla/Grid cyber synth-pop
    const gridHelper = new THREE.GridHelper(17, 34, 0xff007f, 0x1f293d);
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);

    // Anillo luminoso central neón
    const ringGeo = new THREE.RingGeometry(5.2, 5.35, 64);
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

    // Postes geométricos periféricos con cúpula neón
    const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.2, 12);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x121722, roughness: 0.3, metalness: 0.8 });
    const capGeo = new THREE.SphereGeometry(0.12, 12, 12);

    const postCount = 8;
    for (let i = 0; i < postCount; i++) {
      const angle = (i / postCount) * Math.PI * 2;
      const radius = 8.2;
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(Math.cos(angle) * radius, 0.6, Math.sin(angle) * radius);
      post.castShadow = true;

      const oscColor = this.kuramoto.oscillators[i % 8].color;
      const capMat = new THREE.MeshBasicMaterial({ color: oscColor });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 0.65;
      post.add(cap);

      this.scene.add(post);
    }
  }

  /**
   * Crea los 4 sube y bajas distribuidos equilibradamente
   */
  _buildSeesaws() {
    const radius = 4.2;
    const oscs = this.kuramoto.oscillators;

    const configs = [
      { id: 0, angle: 0, oscA: oscs[0], oscB: oscs[1] },
      { id: 1, angle: Math.PI / 2, oscA: oscs[2], oscB: oscs[3] },
      { id: 2, angle: Math.PI, oscA: oscs[4], oscB: oscs[5] },
      { id: 3, angle: (3 * Math.PI) / 2, oscA: oscs[6], oscB: oscs[7] }
    ];

    configs.forEach((cfg) => {
      const posX = Math.cos(cfg.angle) * radius;
      const posZ = Math.sin(cfg.angle) * radius;

      const seesaw = new Seesaw({
        id: cfg.id,
        position: new THREE.Vector3(posX, 0, posZ),
        rotationY: -cfg.angle + Math.PI / 2,
        oscA: cfg.oscA,
        oscB: cfg.oscB
      });

      this.scene.add(seesaw.group);
      this.seesaws.push(seesaw);
      this.characters.push(seesaw.characterA, seesaw.characterB);
    });
  }

  /**
   * Actualiza los sube y bajas, las estelas y la modulación reactiva de luces neón según R.
   * @param {number} orderR - Parámetro de orden Kuramoto (0 a 1)
   */
  update(orderR) {
    this.seesaws.forEach((s) => s.update());
    this.trails.update(orderR);

    // Modulación reactiva de luces puntuales neón
    // En desorden: las luces titilan independientemente
    // En sincronización: las luces adquieren un pulso luminoso colectivo coordinado
    const time = performance.now() * 0.002;
    this.reactiveLights.forEach((item, idx) => {
      const pulseIncoherent = Math.sin(time * 3 + idx * 1.5);
      const pulseCoherent = Math.sin(time * 4 + this.kuramoto.meanPhase);

      // Mezcla de pulso según R
      const blendPulse = THREE.MathUtils.lerp(pulseIncoherent, pulseCoherent, orderR);
      item.light.intensity = 2.0 + blendPulse * (1.0 + orderR * 1.5);
    });
  }
}
