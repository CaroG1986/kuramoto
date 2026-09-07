import * as THREE from 'three';

/**
 * Comportamiento de Gula (Círculo 3) - Sube y Baja (Lado Pesado)
 * Permanece atrapado en la posición inferior debido a su gran peso.
 * Intenta levantarse según theta, pero su peso limita el ascenso.
 */
export class GluttonyBehavior {
  /**
   * @param {import('../scene/Character.js').Character} character 
   * @param {import('../scene/Seesaw.js').Seesaw} seesaw 
   */
  constructor(character, seesaw) {
    this.character = character;
    this.seesaw = seesaw;
    this.weight = 3.5; // Factor de peso dominante
    this.upwardForce = 0;
  }

  /**
   * Actualiza el intento de movimiento de Gula
   * @param {number} theta 
   */
  update(theta) {
    if (!this.character.oscillator.active) return;

    const sinT = Math.sin(theta);

    // Intento de esfuerzo ascendente limitado por el peso
    if (sinT > 0.4) {
      this.upwardForce = (sinT - 0.4) * 0.15; // Fuerza muy atenuada por su gran peso
    } else {
      this.upwardForce = 0;
    }

    // Micro-animaciones de respiración pesada / esfuerzo
    if (this.character.limbs.head) {
      this.character.limbs.head.rotation.x = 0.2 + sinT * 0.1;
    }
  }

  /**
   * Retorna la fuerza efectiva ejercida por Gula en el extremo del sube y baja
   */
  getEffectiveWeightForce() {
    return this.weight - this.upwardForce;
  }
}
