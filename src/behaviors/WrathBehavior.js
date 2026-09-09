import * as THREE from 'three';

/**
 * Comportamiento de Ira (Círculo 5) - Sube y Baja (Lado Elevado)
 * Atrapado arriba debido al peso de Gula. Salta e intenta bajar furiosamente impulsado por theta.
 * Cuando el salto alcanza su pico dispara el audio personalizado de Ira.
 */
export class WrathBehavior {
  /**
   * @param {import('../Scene/Character.js').Character} character 
   * @param {import('../Scene/Seesaw.js').Seesaw} seesaw 
   * @param {import('../audio/AudioManager.js').AudioManager} [audioManager]
   */
  constructor(character, seesaw, audioManager = null) {
    this.character = character;
    this.seesaw = seesaw;
    this.audioManager = audioManager;
    this.downwardForce = 0;
    this.isJumpingViolently = false;
    this._wasJumping = false; // Para detectar transición (no disparo continuo)
  }

  /**
   * Actualiza el comportamiento furioso de Ira.
   * Dispara audio al inicio del salto violento (conducido por theta).
   * @param {number} theta 
   */
  update(theta) {
    if (!this.character.oscillator.active) return;

    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);

    // Cuando theta indica pico de acción, Ira salta violento intentando forzar la bajada
    if (sinT > 0.3) {
      this.isJumpingViolently = true;
      this.downwardForce = Math.pow(sinT, 2) * 1.8; // Fuerza de impacto al caer
    } else {
      this.isJumpingViolently = false;
      this.downwardForce = 0;
    }

    // Disparar audio UNA VEZ al inicio del salto (no en cada frame)
    if (this.isJumpingViolently && !this._wasJumping && this.audioManager) {
      this.audioManager.triggerCharacterEvent(4, 'JUMP');
    }
    this._wasJumping = this.isJumpingViolently;

    // Animación agitada y espasmódica de cabeza y brazos
    if (this.character.limbs.head) {
      this.character.limbs.head.rotation.z = sinT * 0.4;
      this.character.limbs.head.rotation.x = cosT * 0.3;
    }

    if (this.character.limbs.leftArm && this.character.limbs.rightArm) {
      this.character.limbs.leftArm.rotation.z = sinT * 0.6 + 0.4;
      this.character.limbs.rightArm.rotation.z = -sinT * 0.6 - 0.4;
    }
  }

  /**
   * Retorna la fuerza ejercida por Ira en su extremo
   */
  getDownwardImpactForce() {
    return this.downwardForce;
  }
}
