import { Oscillator } from './Oscillator.js';

/**
 * Paleta de colores synth-pop neón de alto contraste para los 8 osciladores
 */
const OSCILLATOR_COLORS = [
  '#FF007F', // 01 - Main Synth Bass (Magenta)
  '#00F3FF', // 02 - Secondary Bass / Arp (Cian)
  '#9D00FF', // 03 - Synth Pluck (Violeta)
  '#0066FF', // 04 - Electric Piano Synth (Azul Eléctrico)
  '#FF5500', // 05 - Synth Lead (Naranja Neón)
  '#FFE600', // 06 - Atmospheric Pad (Amarillo Neón)
  '#39FF14', // 07 - Electronic Percussion (Verde Lima)
  '#FF00AA'  // 08 - Bell / Digital Chime (Rosa Neón)
];

/**
 * Roles instrumentales de la Banda Synth-Pop y Frecuencias Base (Escala Fa menor / Fm)
 */
const INSTRUMENT_ROLES = [
  { name: 'Synth Bass', noteName: 'F2', freq: 87.31 },
  { name: 'Arp Bass', noteName: 'C3', freq: 130.81 },
  { name: 'Synth Pluck', noteName: 'Ab3', freq: 207.65 },
  { name: 'El-Piano Synth', noteName: 'C4', freq: 261.63 },
  { name: 'Synth Lead', noteName: 'F4', freq: 349.23 },
  { name: 'Atmospheric Pad', noteName: 'Ab4', freq: 415.30 },
  { name: 'Percussion Synth', noteName: 'Pulse', freq: 110.00 },
  { name: 'Digital Chime', noteName: 'C5', freq: 523.25 }
];

/**
 * Frecuencias naturales iniciales (omega) ligeramente distintas para promover desorden inicial
 */
const INITIAL_OMEGAS = [
  1.20,
  1.85,
  1.45,
  2.10,
  1.60,
  2.35,
  1.30,
  1.95
];

export class KuramotoSystem {
  constructor() {
    this.couplingK = 1.0;     // Fuerza de acoplamiento inicial K
    this.speedScale = 1.0;    // Velocidad global de simulación
    this.orderParameterR = 0; // Parámetro de orden R (0 = caos, 1 = sincronización)
    this.meanPhase = 0;       // Fase promedio ψ (psi)
    this.isPaused = false;    // Estado de pausa global para interacción performática

    // Crear los 8 osciladores representando la banda synth-pop
    this.oscillators = [];
    for (let i = 0; i < 8; i++) {
      const role = INSTRUMENT_ROLES[i];
      const osc = new Oscillator({
        id: i,
        initialTheta: Math.random() * Math.PI * 2,
        omega: INITIAL_OMEGAS[i],
        color: OSCILLATOR_COLORS[i],
        name: `${role.name} (${role.noteName})`,
        frequency: role.freq
      });
      osc.role = role.name;
      this.oscillators.push(osc);
    }
  }

  /**
   * Obtiene la lista de osciladores actualmente activos
   * @returns {Oscillator[]}
   */
  getActiveOscillators() {
    return this.oscillators.filter((o) => o.active);
  }

  /**
   * Actualiza el sistema de Kuramoto avanzando el tiempo dt.
   * Aplica la ecuación: dθᵢ/dt = ωᵢ + (K/N) ∑ sin(θⱼ - θᵢ)
   * @param {number} dt - Tiempo transcurrido en segundos
   */
  update(dt) {
    if (this.isPaused) return;

    const scaledDt = dt * this.speedScale;
    const activeOscillators = this.getActiveOscillators();
    const N = activeOscillators.length;

    if (N === 0) {
      this.orderParameterR = 0;
      return;
    }

    // 1. Calcular dTheta/dt para cada oscilador activo
    const dThetaDt = new Array(this.oscillators.length).fill(0);

    for (let i = 0; i < this.oscillators.length; i++) {
      const oscI = this.oscillators[i];
      if (!oscI.active) continue;

      let couplingSum = 0;
      for (let j = 0; j < activeOscillators.length; j++) {
        const oscJ = activeOscillators[j];
        if (oscI.id === oscJ.id) continue;
        couplingSum += Math.sin(oscJ.theta - oscI.theta);
      }

      // Ecuación fundamental de Kuramoto
      dThetaDt[i] = oscI.omega + (this.couplingK / N) * couplingSum;
    }

    // 2. Aplicar el paso de integración numérica a cada oscilador
    for (let i = 0; i < this.oscillators.length; i++) {
      this.oscillators[i].step(dThetaDt[i], scaledDt);
    }

    // 3. Calcular el Parámetro de Orden de Kuramoto (R)
    let cosSum = 0;
    let sinSum = 0;

    for (let j = 0; j < activeOscillators.length; j++) {
      cosSum += Math.cos(activeOscillators[j].theta);
      sinSum += Math.sin(activeOscillators[j].theta);
    }

    const realMean = cosSum / N;
    const imagMean = sinSum / N;

    this.orderParameterR = Math.sqrt(realMean * realMean + imagMean * imagMean);
    this.meanPhase = Math.atan2(imagMean, realMean);
  }

  /**
   * Métodos para la futura interacción colectiva performática
   */
  pauseAllOscillators() {
    this.isPaused = true;
  }

  resumeAllOscillators() {
    this.isPaused = false;
  }

  /**
   * Resetea las fases de todos los osciladores con valores aleatorios.
   */
  randomizePhases() {
    this.oscillators.forEach((osc) => {
      osc.reset(Math.random() * Math.PI * 2);
    });
  }

  /**
   * Cambia el acoplamiento K.
   * @param {number} val
   */
  setCoupling(val) {
    this.couplingK = Math.max(0, val);
  }

  /**
   * Cambia la velocidad global de simulación.
   * @param {number} val
   */
  setSpeed(val) {
    this.speedScale = Math.max(0.05, val);
  }

  /**
   * Activa o desactiva un oscilador por ID.
   * @param {number} id
   * @param {boolean} active
   */
  setOscillatorActive(id, active) {
    if (this.oscillators[id]) {
      this.oscillators[id].active = active;
    }
  }

  /**
   * Modifica la frecuencia natural omega de un oscilador por ID.
   * @param {number} id
   * @param {number} omega
   */
  setOscillatorOmega(id, omega) {
    if (this.oscillators[id]) {
      this.oscillators[id].omega = Math.max(0.1, omega);
    }
  }
}
