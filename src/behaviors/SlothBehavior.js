import * as THREE from 'three';

/**
 * Comportamiento de Pereza (Círculo 6) - Columpio
 * Permanece en el columpio transmitiendo apatía, cansancio y falta de energía.
 * Se balancea lentamente según theta y posee un estado de sueño.
 * Cuando entra en sueño dispara el audio personalizado de Pereza.
 */
export class SlothBehavior {
  /**
   * @param {import('../Scene/Character.js').Character} character 
   * @param {import('../Scene/Swing.js').Swing} swing 
   * @param {import('../audio/AudioManager.js').AudioManager} [audioManager]
   */
  constructor(character, swing, audioManager = null) {
    this.character = character;
    this.swing = swing;
    this.audioManager = audioManager;
    this.isAsleep = false;
    this._wasSleeping = false; // Para detectar transición (no disparo continuo)
  }

  /**
   * Actualiza el balanceo lento y estado de sueño de Pereza.
   * Dispara audio de Pereza al entrar en sueño (theta conduce la transición).
   * @param {number} theta 
   */
  update(theta) {
    if (!this.character.oscillator.active) return;

    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);

    // Determinar estado de sueño en valles de fase
    this.isAsleep = sinT < -0.2;

    // Disparar audio UNA VEZ por transición dormida (entrada al estado)
    if (this.isAsleep && !this._wasSleeping && this.audioManager) {
      this.audioManager.triggerCharacterEvent(5, 'SLEEP');
    }
    this._wasSleeping = this.isAsleep;

    // Balanceo muy lento del columpio
    const swingAmplitude = this.isAsleep ? 0.08 : 0.22;
    const swingAngle = sinT * swingAmplitude;
    this.swing.setSwingAngle(swingAngle);

    // Postura encorvada / dormida
    if (this.character.limbs.head) {
      if (this.isAsleep) {
        this.character.limbs.head.rotation.x = THREE.MathUtils.lerp(
          this.character.limbs.head.rotation.x, 0.4, 0.08
        ); // Cabeza caída lentamente por sueño
        this.character.limbs.head.rotation.z = THREE.MathUtils.lerp(
          this.character.limbs.head.rotation.z, 0.1, 0.08
        );
      } else {
        this.character.limbs.head.rotation.x = THREE.MathUtils.lerp(
          this.character.limbs.head.rotation.x, 0.15 + cosT * 0.05, 0.1
        );
        this.character.limbs.head.rotation.z = THREE.MathUtils.lerp(
          this.character.limbs.head.rotation.z, sinT * 0.05, 0.1
        );
      }
    }
  }
}
