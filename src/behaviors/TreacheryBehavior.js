import * as THREE from 'three';

/**
 * Comportamiento de Traición (Círculo 8) - Manipulación de la Rueda
 * Interactúa con la rueda donde está sentado Limbo, haciéndola girar con velocidad e intensidad según theta.
 * Cuando empieza a girar la rueda dispara el audio personalizado de Traición.
 */
export class TreacheryBehavior {
  /**
   * @param {import('../Scene/Character.js').Character} character 
   * @param {import('../Scene/Wheel.js').Wheel} wheel 
   * @param {import('../audio/AudioManager.js').AudioManager} [audioManager]
   */
  constructor(character, wheel, audioManager = null) {
    this.character = character;
    this.wheel = wheel;
    this.audioManager = audioManager;
    this.spinIntensity = 0;
    this._wasSpinning = false; // Para detectar transición (no disparo continuo)
  }

  /**
   * Actualiza el comportamiento de manipulación de la rueda.
   * Dispara audio al inicio del giro (conducido por theta).
   * @param {number} theta 
   * @param {number} dt 
   */
  update(theta, dt) {
    if (!this.character.oscillator.active) return;

    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);

    const isSpinningNow = sinT > 0;

    // Disparar audio UNA VEZ al inicio del empuje (no en cada frame)
    if (isSpinningNow && !this._wasSpinning && this.audioManager) {
      this.audioManager.triggerCharacterEvent(7, 'SPIN');
    }
    this._wasSpinning = isSpinningNow;

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
