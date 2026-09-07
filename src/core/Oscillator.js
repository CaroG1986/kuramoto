/**
 * Clase que representa un oscilador individual de Kuramoto asociado a un Círculo del Infierno.
 */
export class Oscillator {
  /**
   * @param {Object} config
   * @param {number} config.id - Identificador único (0 a 7)
   * @param {string} config.circle - Nombre del Círculo del Infierno
   * @param {number} config.initialTheta - Fase inicial en radianes
   * @param {number} config.omega - Frecuencia natural inicial (rad/s)
   * @param {string} config.color - Color hexadecimal para identificación
   * @param {string} config.audioProfile - Nombre del archivo de audio o perfil sonoro
   */
  constructor({ id, circle, initialTheta, omega, color, audioProfile }) {
    this.id = id;
    this.circle = circle;
    this.theta = initialTheta;
    this.prevTheta = initialTheta;
    this.omega = omega;
    this.color = color;
    this.audioProfile = audioProfile;
    this.active = true;
    this.selected = false;
    this.behavior = null; // Asignado posteriormente por el gestor de comportamientos

    this.normalizedTheta = this.theta % (Math.PI * 2);
    if (this.normalizedTheta < 0) this.normalizedTheta += Math.PI * 2;
  }

  /**
   * Avanza la fase del oscilador dada la derivada dTheta/dt y el deltaTime.
   * @param {number} dThetaDt - Derivada dTheta/dt calculada por el sistema Kuramoto
   * @param {number} dt - Tiempo transcurrido en segundos
   */
  step(dThetaDt, dt) {
    if (!this.active) return;

    this.prevTheta = this.theta;
    this.theta += dThetaDt * dt;

    const TWO_PI = Math.PI * 2;
    this.normalizedTheta = this.theta % TWO_PI;
    if (this.normalizedTheta < 0) this.normalizedTheta += TWO_PI;
  }

  /**
   * Detecta si el oscilador cruzó el pico (cresta superior Math.PI / 2).
   * @returns {boolean} true si se disparó la cresta en este cuadro
   */
  checkPeakTrigger() {
    if (!this.active) return false;

    const TWO_PI = Math.PI * 2;
    const prevMod = ((this.prevTheta % TWO_PI) + TWO_PI) % TWO_PI;
    const currMod = this.normalizedTheta;

    const PEAK = Math.PI / 2;
    return prevMod < PEAK && currMod >= PEAK;
  }

  /**
   * Resetea la fase a un valor específico o aleatorio.
   * @param {number} [newTheta]
   */
  reset(newTheta) {
    const val = newTheta !== undefined ? newTheta : Math.random() * Math.PI * 2;
    this.theta = val;
    this.prevTheta = val;
    this.normalizedTheta = val % (Math.PI * 2);
  }
}
