import * as THREE from 'three';

/**
 * Comportamiento de Traición (Círculo 8) - Manipulación de la Rueda
 * Interactúa con la rueda donde está sentado Limbo, haciéndola girar con velocidad e intensidad según theta.
 */
export class TreacheryBehavior {
  /**
   * @param {import('../scene/Character.js').Character} character 
   * @param {import('../scene/Wheel.js').Wheel} wheel 
   */
  constructor(character, wheel) {
    this.character = character;
    this.wheel = wheel;
    this.spinIntensity = 0;
  }

  /**
   * Actualiza el comportamiento de manipulación de la rueda
   * @param {number} theta 
   * @param {number} dt 
   */
  update(theta, dt) {
    if (!this.character.oscillator.active) return;

    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);

    // Determinar la fuerza y velocidad impartida a la rueda según theta
    if (sinT > 0) {
      this.spinIntensity = sinT * 2.5; // Velocidad de giro
      this.wheel.update(this.spinIntensity * dt);

      // Movimiento corporal de empuje de Traición
      if (this.character.limbs.leftArm && this.character.limbs.rightArm) {
        this.character.limbs.leftArm.rotation.x = -cosT * 0.8;
        this.character.limbs.rightArm.rotation.x = cosT * 0.8;
      }
    }
  }
}
