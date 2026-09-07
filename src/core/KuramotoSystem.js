import { Oscillator } from './Oscillator.js';

/**
 * Mapeo de los 8 Círculos del Infierno con sus propiedades únicas
 */
const CIRCLES_CONFIG = [
  { id: 0, circle: 'Limbo', color: '#FF007F', omega: 1.1, audioProfile: 'limbo.wav' },
  { id: 1, circle: 'Lujuria', color: '#00F3FF', omega: 1.8, audioProfile: 'lust.wav' },
  { id: 2, circle: 'Gula', color: '#9D00FF', omega: 1.35, audioProfile: 'gluttony.wav' },
  { id: 3, circle: 'Avaricia', color: '#0066FF', omega: 2.1, audioProfile: 'greed.wav' },
  { id: 4, circle: 'Ira', color: '#FF5500', omega: 2.6, audioProfile: 'wrath.wav' },
  { id: 5, circle: 'Pereza', color: '#FFE600', omega: 0.8, audioProfile: 'sloth.wav' },
  { id: 6, circle: 'Violencia', color: '#39FF14', omega: 2.2, audioProfile: 'violence.wav' },
  { id: 7, circle: 'Traición', color: '#FF00AA', omega: 1.9, audioProfile: 'treachery.wav' }
];

export class KuramotoSystem {
  constructor() {
    this.couplingK = 1.2;     // Fuerza de acoplamiento inicial K
    this.speedScale = 1.0;    // Velocidad global de simulación
    this.orderParameterR = 0; // Parámetro de orden R (0 = caos, 1 = sincronización)
    this.meanPhase = 0;       // Fase promedio ψ (psi)
    this.isPaused = false;

    // Instanciar los 8 osciladores representando los 8 círculos del Infierno
    this.oscillators = CIRCLES_CONFIG.map((cfg) => {
      return new Oscillator({
        id: cfg.id,
        circle: cfg.circle,
        initialTheta: Math.random() * Math.PI * 2,
        omega: cfg.omega,
        color: cfg.color,
        audioProfile: cfg.audioProfile
      });
    });
  }

  /**
   * Obtiene la lista de osciladores actualmente activos (N)
   * @returns {Oscillator[]}
   */
  getActiveOscillators() {
    return this.oscillators.filter((o) => o.active);
  }

  /**
   * Actualiza el sistema de Kuramoto avanzando el tiempo dt.
   * Aplica la ecuación fundamental: dθᵢ/dt = ωᵢ + (K/N) ∑ sin(θⱼ - θᵢ)
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

      // Ecuación matemática de Kuramoto
      dThetaDt[i] = oscI.omega + (this.couplingK / N) * couplingSum;
    }

    // 2. Integración numérica de la fase para cada oscilador
    for (let i = 0; i < this.oscillators.length; i++) {
      this.oscillators[i].step(dThetaDt[i], scaledDt);
    }

    // 3. Parámetro de Orden de Kuramoto: R = |(1/N) ∑ exp(iθᵢ)|
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

  pauseAllOscillators() {
    this.isPaused = true;
  }

  resumeAllOscillators() {
    this.isPaused = false;
  }

  randomizePhases() {
    this.oscillators.forEach((osc) => {
      osc.reset(Math.random() * Math.PI * 2);
    });
  }

  setCoupling(val) {
    this.couplingK = Math.max(0, val);
  }

  setSpeed(val) {
    this.speedScale = Math.max(0.05, val);
  }

  setOscillatorActive(id, active) {
    if (this.oscillators[id]) {
      this.oscillators[id].active = active;
    }
  }

  setOscillatorOmega(id, omega) {
    if (this.oscillators[id]) {
      this.oscillators[id].omega = Math.max(0.1, omega);
    }
  }
}
