import * as THREE from 'three';

/**
 * Estados del comportamiento de Violencia
 */
export const VIOLENCE_STATES = {
  IDLE: 'IDLE',
  APPROACH: 'APPROACH',
  WINDUP: 'WINDUP',
  ATTACK: 'ATTACK',
  RECOVERY: 'RECOVERY'
};

/**
 * Comportamiento de Violencia (Círculo 7) - Máquina de Estados para ataque a Pereza
 * IDLE -> APPROACH -> WINDUP -> ATTACK -> RECOVERY -> IDLE
 * 
 * Transiciones conducidas por la fase theta7 de Kuramoto:
 *   [0, 0.4π)   → IDLE
 *   [0.4π, 0.8π) → APPROACH
 *   [0.8π, 1.15π) → WINDUP
 *   [1.15π, 1.45π) → ATTACK
 *   [1.45π, 2π) → RECOVERY
 *
 * Con K alto los estados se sincronizan con el resto de osciladores.
 * Con K bajo cada estado cambia a la velocidad propia de Violencia (ω₇).
 */
export class ViolenceBehavior {
  /**
   * @param {import('../Scene/Character.js').Character} character 
   * @param {import('../Scene/Character.js').Character} targetCharacter  (Pereza)
   * @param {import('../Scene/Swing.js').Swing} swing 
   * @param {import('../audio/AudioManager.js').AudioManager} [audioManager]
   */
  constructor(character, targetCharacter, swing, audioManager = null) {
    this.character = character;
    this.targetCharacter = targetCharacter;
    this.swing = swing;
    this.audioManager = audioManager;

    this.currentState = VIOLENCE_STATES.IDLE;
    this.homePosition = new THREE.Vector3(3.8, 0, -0.6);
    this.hasTriggeredSound = false;
  }

  /**
   * Actualiza la máquina de estados según la fase theta7 de Kuramoto.
   * @param {number} theta 
   * @param {number} dt 
   */
  update(theta, dt = 0.016) {
    if (!this.character.oscillator.active) return;

    // Normalizar theta7 a [0, 2PI)
    const TWO_PI = Math.PI * 2;
    const normTheta = ((theta % TWO_PI) + TWO_PI) % TWO_PI;

    // Mapeo estricto de la máquina de estados según la fase theta7 de Kuramoto
    let nextState = VIOLENCE_STATES.IDLE;

    if (normTheta >= 0 && normTheta < Math.PI * 0.4) {
      nextState = VIOLENCE_STATES.IDLE;
    } else if (normTheta >= Math.PI * 0.4 && normTheta < Math.PI * 0.8) {
      nextState = VIOLENCE_STATES.APPROACH;
    } else if (normTheta >= Math.PI * 0.8 && normTheta < Math.PI * 1.15) {
      nextState = VIOLENCE_STATES.WINDUP;
    } else if (normTheta >= Math.PI * 1.15 && normTheta < Math.PI * 1.45) {
      nextState = VIOLENCE_STATES.ATTACK;
    } else {
      nextState = VIOLENCE_STATES.RECOVERY;
    }

    // Resetear flag de sonido al salir del estado ATTACK
    if (this.currentState !== VIOLENCE_STATES.ATTACK && nextState === VIOLENCE_STATES.ATTACK) {
      this.hasTriggeredSound = false;
    }

    this.currentState = nextState;

    // Ejecutar lógica del estado actual
    const charGroup = this.character.group;
    const targetPos = new THREE.Vector3();
    if (this.swing) {
      this.swing.getSeatWorldPosition(targetPos);
      targetPos.z += 0.65; // Posición de ataque frente al columpio
      targetPos.y = 0;
    }

    switch (this.currentState) {
      case VIOLENCE_STATES.IDLE:
        // Retorno a la posición base con orientación neutral
        charGroup.position.lerp(this.homePosition, 0.1);
        charGroup.rotation.y = THREE.MathUtils.lerp(charGroup.rotation.y, -Math.PI / 4, 0.1);
        if (this.character.limbs.rightArm) {
          this.character.limbs.rightArm.rotation.x = THREE.MathUtils.lerp(
            this.character.limbs.rightArm.rotation.x, 0, 0.1
          );
          this.character.limbs.rightArm.rotation.z = THREE.MathUtils.lerp(
            this.character.limbs.rightArm.rotation.z, -0.2, 0.1
          );
        }
        break;

      case VIOLENCE_STATES.APPROACH:
        // Desplazamiento hacia el objetivo: mira hacia el columpio antes de llegar
        charGroup.position.lerp(targetPos, 0.12);
        charGroup.rotation.y = THREE.MathUtils.lerp(charGroup.rotation.y, 0, 0.15);
        if (this.character.limbs.rightArm) {
          this.character.limbs.rightArm.rotation.x = THREE.MathUtils.lerp(
            this.character.limbs.rightArm.rotation.x, 0, 0.1
          );
        }
        break;

      case VIOLENCE_STATES.WINDUP:
        // Cargar/llevar el brazo derecho hacia atrás para preparar el golpe
        charGroup.position.copy(targetPos);
        charGroup.rotation.y = THREE.MathUtils.lerp(charGroup.rotation.y, 0, 0.2);
        if (this.character.limbs.rightArm) {
          this.character.limbs.rightArm.rotation.x = THREE.MathUtils.lerp(
            this.character.limbs.rightArm.rotation.x, Math.PI / 2.5, 0.2
          );
          this.character.limbs.rightArm.rotation.z = THREE.MathUtils.lerp(
            this.character.limbs.rightArm.rotation.z, 0.4, 0.2
          );
        }
        if (this.character.limbs.head) {
          this.character.limbs.head.rotation.x = THREE.MathUtils.lerp(
            this.character.limbs.head.rotation.x, -0.25, 0.2
          );
        }
        break;

      case VIOLENCE_STATES.ATTACK:
        // Impacto rápido: brazo cae hacia adelante
        charGroup.position.copy(targetPos);
        if (this.character.limbs.rightArm) {
          this.character.limbs.rightArm.rotation.x = -Math.PI / 1.8;
          this.character.limbs.rightArm.rotation.z = -0.4;
        }
        if (this.character.limbs.head) {
          this.character.limbs.head.rotation.x = THREE.MathUtils.lerp(
            this.character.limbs.head.rotation.x, 0.1, 0.3
          );
        }

        // Impulso al columpio por el impacto
        if (this.swing) {
          this.swing.setSwingAngle(0.48);
        }
        // Sacudida de la cabeza de Pereza por el golpe
        if (this.targetCharacter && this.targetCharacter.limbs.head) {
          this.targetCharacter.limbs.head.rotation.x = THREE.MathUtils.lerp(
            this.targetCharacter.limbs.head.rotation.x, -0.55, 0.35
          );
        }

        // Disparar evento sonoro de Violencia al ocurrir ATTACK (solo una vez)
        if (!this.hasTriggeredSound) {
          this.hasTriggeredSound = true;
          if (this.audioManager) {
            this.audioManager.triggerCharacterEvent(6, 'ATTACK');
          }
        }
        break;

      case VIOLENCE_STATES.RECOVERY:
        // Recuperación: Violencia retrocede, columpio amortigua, Pereza normaliza
        charGroup.position.lerp(this.homePosition, 0.08);
        if (this.character.limbs.rightArm) {
          this.character.limbs.rightArm.rotation.x = THREE.MathUtils.lerp(
            this.character.limbs.rightArm.rotation.x, 0, 0.1
          );
          this.character.limbs.rightArm.rotation.z = THREE.MathUtils.lerp(
            this.character.limbs.rightArm.rotation.z, -0.2, 0.1
          );
        }
        // El columpio amortigua su movimiento gradualmente
        if (this.swing) {
          const currentAngle = this.swing.swingAngle;
          this.swing.setSwingAngle(currentAngle * 0.88); // amortiguación exponencial
        }
        // La cabeza de Pereza recupera postura normal
        if (this.targetCharacter && this.targetCharacter.limbs.head) {
          this.targetCharacter.limbs.head.rotation.x = THREE.MathUtils.lerp(
            this.targetCharacter.limbs.head.rotation.x, 0.15, 0.08
          );
        }
        break;
    }
  }
}
