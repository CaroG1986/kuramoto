import * as THREE from 'three';

/**
 * Comportamiento de Violencia (Círculo 7) - Ataque a Pereza en Columpio
 * Se aproxima al personaje dormido en el columpio y ejecuta golpes según theta.
 */
export class ViolenceBehavior {
  /**
   * @param {import('../scene/Character.js').Character} character 
   * @param {import('../scene/Character.js').Character} targetCharacter 
   * @param {import('../scene/Swing.js').Swing} swing 
   */
  constructor(character, targetCharacter, swing) {
    this.character = character;
    this.targetCharacter = targetCharacter;
    this.swing = swing;
    this.isAttacking = false;
  }

  /**
   * Actualiza el ataque de Violencia
   * @param {number} theta 
   */
  update(theta) {
    if (!this.character.oscillator.active) return;

    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);

    // Ejecuta el golpe cuando theta cruza el pico
    if (sinT > 0.6) {
      this.isAttacking = true;

      // Reacción de golpe en Violencia (brazo impulsado violentamente hacia adelante)
      if (this.character.limbs.rightArm) {
        this.character.limbs.rightArm.rotation.x = -Math.PI / 2;
        this.character.limbs.rightArm.rotation.z = -0.5;
      }

      // Reacción visual producida en Pereza y el Columpio
      if (this.swing) {
        // Sacudida brusca del columpio por el impacto
        this.swing.setSwingAngle(0.45);
      }

      if (this.targetCharacter && this.targetCharacter.limbs.head) {
        // Cabeza de Pereza sacudida hacia atrás por el golpe
        this.targetCharacter.limbs.head.rotation.x = -0.5;
      }
    } else {
      this.isAttacking = false;
      if (this.character.limbs.rightArm) {
        this.character.limbs.rightArm.rotation.x = 0;
      }
    }
  }
}
