import * as THREE from 'three';

/**
 * Comportamiento de Avaricia (Círculo 4) - Tobogán Monopolizado
 * Recorre continuamente el tobogán (acerca, sube, se posiciona, se desliza, llega al final) impulsado por theta.
 */
export class GreedBehavior {
  /**
   * @param {import('../Scene/Character.js').Character} character 
   * @param {import('../Scene/Slide.js').Slide} slide 
   */
  constructor(character, slide) {
    this.character = character;
    this.slide = slide;
    this.progress = 0; // Progreso en la secuencia [0 a 1]
  }

  /**
   * Actualiza el recorrido de Avaricia por el tobogán
   * @param {number} theta 
   */
  update(theta) {
    if (!this.character.oscillator.active) return;

    // Normalizar theta a [0, 1] para controlar la posición en la secuencia
    const normalized = ((theta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / (Math.PI * 2);
    this.progress = normalized;

    const pBottom = this.slide.getLadderBottomWorldPos();
    const pTop = this.slide.getPlatformWorldPos();
    const pEnd = this.slide.getSlideBottomWorldPos();

    const charGroup = this.character.group;

    if (this.progress < 0.35) {
      // Subiendo la escalera
      const t = this.progress / 0.35;
      charGroup.position.lerpVectors(pBottom, pTop, t);
      charGroup.rotation.y = this.slide.group.rotation.y;
    } else if (this.progress < 0.45) {
      // Posicionado arriba preparándose
      charGroup.position.copy(pTop);
    } else if (this.progress < 0.85) {
      // Deslizándose por la rampa
      const t = (this.progress - 0.45) / 0.4;
      charGroup.position.lerpVectors(pTop, pEnd, t);
    } else {
      // Llegada al final y retorno a la base
      const t = (this.progress - 0.85) / 0.15;
      charGroup.position.lerpVectors(pEnd, pBottom, t);
    }
  }
}
