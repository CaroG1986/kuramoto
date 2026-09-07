import * as THREE from 'three';

/**
 * Comportamiento de Lujuria (Círculo 2) - Persecución Obsesiva
 * Persigue a los demás osciladores en el patio con dirección e intensidad determinadas por theta.
 */
export class LustBehavior {
  /**
   * @param {import('../Scene/Character.js').Character} character 
   * @param {import('../Scene/Character.js').Character[]} allCharacters 
   */
  constructor(character, allCharacters) {
    this.character = character;
    this.allCharacters = allCharacters;
    this.currentTarget = null;
    this.speed = 2.0;
  }

  /**
   * Actualiza el comportamiento de persecución
   * @param {number} theta 
   * @param {number} dt 
   */
  update(theta, dt) {
    if (!this.character.oscillator.active) return;

    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);

    // Selección de objetivo dinámico impulsado por theta
    const otherChars = this.allCharacters.filter(c => c !== this.character && c.oscillator.active);
    if (otherChars.length > 0) {
      const targetIndex = Math.floor(Math.abs(sinT) * otherChars.length) % otherChars.length;
      this.currentTarget = otherChars[targetIndex];
    }

    if (this.currentTarget) {
      const charPos = this.character.group.position;
      const targetPos = new THREE.Vector3();
      this.currentTarget.group.getWorldPosition(targetPos);
      targetPos.y = 0; // Mantenerse en el plano del suelo

      const dir = targetPos.clone().sub(charPos);
      const dist = dir.length();

      if (dist > 0.8) {
        dir.normalize();
        // La fase theta modula la velocidad de persecución
        const currentSpeed = this.speed * (0.5 + Math.abs(cosT) * 1.2);
        charPos.add(dir.multiplyScalar(currentSpeed * dt));

        // Orientar personaje hacia el objetivo
        const angle = Math.atan2(dir.x, dir.z);
        this.character.group.rotation.y = THREE.MathUtils.lerp(this.character.group.rotation.y, angle, 0.15);
      }
    }
  }
}
