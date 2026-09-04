/**
 * Clase que representa un oscilador individual de Kuramoto.
 */
export class Oscillator {
  /**
   * @param {Object} config
   * @param {number} config.id - Identificador único (0 a 7)
   * @param {number} config.initialTheta - Fase inicial en radianes
   * @param {number} config.omega - Frecuencia natural inicial (rad/s)
   * @param {string} config.color - Color hexadecimal para identificación
   * @param {string} config.name - Nombre o código de nota (ej: 'C4')
   * @param {number} config.frequency - Frecuencia en Hz para el sonido
   */
  constructor({ id, initialTheta, omega, color, name, frequency }) {
    this.id = id;
    this.theta = initialTheta;
    this.prevTheta = initialTheta;
    this.omega = omega;
    this.color = color;
    this.name = name;
    this.frequency = frequency;
    this.active = true;
    this.selected = false;

    // Almacenamos la fase normalizada en [0, 2PI)
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

    // Normalizar fase a [0, 2PI)
    const TWO_PI = Math.PI * 2;
    this.normalizedTheta = this.theta % TWO_PI;
    if (this.normalizedTheta < 0) this.normalizedTheta += TWO_PI;
  }

  /**
   * Detecta si el oscilador cruzó el inicio de un nuevo ciclo (cresta de sin(theta) ~ 1 o wrap 2PI).
   * @returns {boolean} true si se disparó la cresta en este cuadro
   */
  checkPeakTrigger() {
    if (!this.active) return false;

    const TWO_PI = Math.PI * 2;
    const prevMod = ((this.prevTheta % TWO_PI) + TWO_PI) % TWO_PI;
    const currMod = this.normalizedTheta;

    // Disparo cuando cruza la cresta superior Math.PI / 2 (o el punto 0)
    // Usaremos el paso por Math.PI / 2 (máximo de sin(theta))
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
