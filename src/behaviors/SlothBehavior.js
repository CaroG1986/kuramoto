import * as THREE from 'three';

/**
 * Comportamiento de Pereza (Círculo 6) - Columpio
 * Permanece en el columpio transmitiendo apatía, cansancio y falta de energía.
 * Se balancea lentamente según theta y posee un estado de sueño.
 */
export class SlothBehavior {
  /**
   * @param {import('../scene/Character.js').Character} character 
   * @param {import('../scene/Swing.js').Swing} swing 
   */
  constructor(character, swing) {
    this.character = character;
    this.swing = swing;
    this.isAsleep = false;
  }

  /**
   * Actualiza el balanceo lento y estado de sueño de Pereza
   * @param {number} theta 
   */
  update(theta) {
    if (!this.character.oscillator.active) return;

    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);

    // Determinar estado de sueño en valles de fase
    this.isAsleep = sinT < -0.2;

    // Balanceo muy lento del columpio
    const swingAmplitude = this.isAsleep ? 0.08 : 0.22;
    const swingAngle = sinT * swingAmplitude;
    this.swing.setSwingAngle(swingAngle);

    // Postura encorvada / dormida
    if (this.character.limbs.head) {
      if (this.isAsleep) {
        this.character.limbs.head.rotation.x = 0.4; // Cabeza caída por sueño
        this.character.limbs.head.rotation.z = 0.1;
      } else {
        this.character.limbs.head.rotation.x = 0.15 + cosT * 0.05;
        this.character.limbs.head.rotation.z = sinT * 0.05;
      }
    }
  }
}
