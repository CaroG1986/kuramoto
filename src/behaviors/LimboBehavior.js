import * as THREE from 'three';

/**
 * Comportamiento de Limbo (Círculo 1) - Rueda
 * Permanece en el centro de la rueda, aislado, pasivo y con micro-movimientos.
 */
export class LimboBehavior {
  /**
   * @param {import('../scene/Character.js').Character} character 
   * @param {import('../scene/Wheel.js').Wheel} wheel 
   */
  constructor(character, wheel) {
    this.character = character;
    this.wheel = wheel;
  }

  /**
   * Actualiza el estado de Limbo según la fase theta de su oscilador
   * @param {number} theta 
   */
  update(theta) {
    if (!this.character.oscillator.active) return;

    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);

    // Micro-movimientos corporales sutiles de contemplación/espera
    if (this.character.limbs.head) {
      this.character.limbs.head.rotation.y = sinT * 0.15;
      this.character.limbs.head.rotation.z = cosT * 0.08;
    }

    if (this.character.limbs.leftArm && this.character.limbs.rightArm) {
      this.character.limbs.leftArm.rotation.z = 0.1 + sinT * 0.05;
      this.character.limbs.rightArm.rotation.z = -0.1 - sinT * 0.05;
    }
  }
}
