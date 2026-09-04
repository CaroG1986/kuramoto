/**
 * Gestor de Audio Synth-Pop Generativo basado en Web Audio API.
 * Cada oscilador de Kuramoto actúa como un instrumento único de una banda de 8 integrantes.
 * Las notas seleccionadas pertenecen a una escala armónica común (Fa menor Synth-Pop) a 100 BPM.
 */
export class AudioManager {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.compressor = null;
    this.masterFilter = null;
    this.delayNode = null;
    this.delayFeedback = null;
    this.isMuted = false;
    this.initialized = false;

    // Configuración Musical Global
    this.bpm = 100;
    this.beatDuration = 60 / this.bpm; // 0.6s por beat
    this.subdivision16th = this.beatDuration / 4; // 0.15s por 16ava

    // Escala Armónica Común (Fa Menor Synth-Pop: Fm - Db - Ab - Eb)
    this.scale = [
      { name: 'F2', freq: 87.31 },
      { name: 'Ab2', freq: 103.83 },
      { name: 'C3', freq: 130.81 },
      { name: 'Eb3', freq: 155.56 },
      { name: 'F3', freq: 174.61 },
      { name: 'Ab3', freq: 207.65 },
      { name: 'Bb3', freq: 233.08 },
      { name: 'C4', freq: 261.63 },
      { name: 'Eb4', freq: 311.13 },
      { name: 'F4', freq: 349.23 },
      { name: 'Ab4', freq: 415.30 },
      { name: 'C5', freq: 523.25 },
      { name: 'Eb5', freq: 622.25 },
      { name: 'Ab5', freq: 830.61 }
    ];
  }

  /**
   * Inicializa el AudioContext y la cadena de efectos maestros.
   */
  async init() {
    if (this.initialized) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContext();

    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    // 1. Compresor de dinámica maestro
    this.compressor = this.audioCtx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-14, this.audioCtx.currentTime);
    this.compressor.knee.setValueAtTime(8, this.audioCtx.currentTime);
    this.compressor.ratio.setValueAtTime(6, this.audioCtx.currentTime);
    this.compressor.attack.setValueAtTime(0.005, this.audioCtx.currentTime);
    this.compressor.release.setValueAtTime(0.15, this.audioCtx.currentTime);

    // 2. Filtro maestro dependiente de R
    this.masterFilter = this.audioCtx.createBiquadFilter();
    this.masterFilter.type = 'lowpass';
    this.masterFilter.frequency.setValueAtTime(3500, this.audioCtx.currentTime);
    this.masterFilter.Q.setValueAtTime(1.8, this.audioCtx.currentTime);

    // 3. Efecto de Delay Estéreo Sincronizado al Tempo (1/8 de nota = 0.3s)
    this.delayNode = this.audioCtx.createDelay();
    this.delayNode.delayTime.setValueAtTime(this.beatDuration / 2, this.audioCtx.currentTime);

    this.delayFeedback = this.audioCtx.createGain();
    this.delayFeedback.gain.setValueAtTime(0.28, this.audioCtx.currentTime);

    // Cadena de Delay: MasterFilter -> DelayNode -> DelayFeedback -> DelayNode -> Compressor
    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    this.delayNode.connect(this.compressor);

    // 4. Ganancia Maestra
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.setValueAtTime(0.42, this.audioCtx.currentTime);

    this.masterFilter.connect(this.compressor);
    this.masterFilter.connect(this.delayNode);
    this.compressor.connect(this.masterGain);
    this.masterGain.connect(this.audioCtx.destination);

    this.initialized = true;
  }

  /**
   * Dispara el instrumento correspondiente al oscilador cuando ocurre su evento de fase theta.
   * @param {Object} osc - Objeto Oscillator (id: 0..7, theta, normalizedTheta)
   * @param {number} orderR - Parámetro de orden Kuramoto R (0 a 1)
   */
  triggerNote(osc, orderR = 0) {
    if (!this.initialized || this.isMuted || !osc.active) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const now = this.audioCtx.currentTime;
    const oscId = osc.id % 8;
    const phaseNorm = osc.normalizedTheta / (Math.PI * 2); // 0 a 1

    switch (oscId) {
      case 0: // OSC 1: Main Synth Bass
        this._playMainSynthBass(phaseNorm, now, orderR);
        break;
      case 1: // OSC 2: Secondary Bass / Arpeggio
        this._playArpBass(phaseNorm, now, orderR);
        break;
      case 2: // OSC 3: Synth Pluck
        this._playSynthPluck(phaseNorm, now, orderR);
        break;
      case 3: // OSC 4: Electric Piano / Organ Synth
        this._playElPianoSynth(phaseNorm, now, orderR);
        break;
      case 4: // OSC 5: Synth Lead
        this._playSynthLead(phaseNorm, now, orderR);
        break;
      case 5: // OSC 6: Atmospheric Pad
        this._playAtmosphericPad(phaseNorm, now, orderR);
        break;
      case 6: // OSC 7: Electronic Percussion
        this._playElectronicPercussion(phaseNorm, now, orderR);
        break;
      case 7: // OSC 8: Bell / Digital Chime
        this._playDigitalChime(phaseNorm, now, orderR);
        break;
      default:
        this._playSynthPluck(phaseNorm, now, orderR);
    }
  }

  // --------------------------------------------------------------------------
  // IMPLEMENTACIÓN DE LOS 8 PERFILES INSTRUMENTALES DE LA BANDA SYNTH-POP
  // --------------------------------------------------------------------------

  // OSC 1: Main Synth Bass (Bajo principal potente en Fa2 / Ab2)
  _playMainSynthBass(phase, now, R) {
    const noteIdx = Math.floor(phase * 3); // F2, Ab2, C3
    const freq = this.scale[noteIdx].freq;

    const osc1 = this.audioCtx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, now);

    const osc2 = this.audioCtx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(freq * 0.5, now); // Sub-octava

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    const cutoff = 250 + R * 1400;
    filter.frequency.setValueAtTime(cutoff, now);
    filter.frequency.exponentialRampToValueAtTime(90, now + 0.38);
    filter.Q.setValueAtTime(3.5, now);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.38, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterFilter);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);
  }

  // OSC 2: Secondary Bass / Arp (Arpegio rápido grave C3, Eb3, F3, Ab3)
  _playArpBass(phase, now, R) {
    const noteIdx = 2 + Math.floor(phase * 4); // C3, Eb3, F3, Ab3
    const freq = this.scale[noteIdx].freq;

    const osc = this.audioCtx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900 + R * 1800, now);
    filter.Q.setValueAtTime(4.0, now);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.24, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterFilter);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // OSC 3: Synth Pluck (Motivos melódicos con ataque digital Ab3, Bb3, C4, Eb4)
  _playSynthPluck(phase, now, R) {
    const noteIdx = 5 + Math.floor(phase * 4); // Ab3, Bb3, C4, Eb4
    const freq = this.scale[noteIdx].freq;

    const osc = this.audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Modulador FM para ataque brillante
    const mod = this.audioCtx.createOscillator();
    const modGain = this.audioCtx.createGain();
    mod.type = 'square';
    mod.frequency.setValueAtTime(freq * 2, now);
    modGain.gain.setValueAtTime(freq * 0.8, now);
    modGain.gain.exponentialRampToValueAtTime(0.1, now + 0.1);
    mod.connect(osc.frequency);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.26, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

    mod.start(now);
    osc.start(now);
    mod.stop(now + 0.3);
    osc.stop(now + 0.3);

    gain.connect(this.masterFilter);
    osc.connect(gain);
  }

  // OSC 4: Electric Piano / Organ Synth (Acordes sostenidos C4, Eb4, F4, Ab4)
  _playElPianoSynth(phase, now, R) {
    const noteIdx = 7 + Math.floor(phase * 4); // C4, Eb4, F4, Ab4
    const freq = this.scale[noteIdx].freq;

    const osc1 = this.audioCtx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    const osc2 = this.audioCtx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 1.002, now); // Detune suave

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600 + R * 2200, now);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.03); // Ataque suave
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterFilter);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.6);
    osc2.stop(now + 0.6);
  }

  // OSC 5: Synth Lead (Melodía principal expresiva F4, Ab4, C5, Eb5)
  _playSynthLead(phase, now, R) {
    const noteIdx = 9 + Math.floor(phase * 4); // F4, Ab4, C5, Eb5
    const freq = this.scale[noteIdx].freq;

    const osc = this.audioCtx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);

    // LFO Vibrato
    const lfo = this.audioCtx.createOscillator();
    const lfoGain = this.audioCtx.createGain();
    lfo.frequency.setValueAtTime(6.0, now); // 6 Hz vibrato
    lfoGain.gain.setValueAtTime(4.0, now);
    lfo.connect(osc.frequency);

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200 + R * 3500, now);
    filter.Q.setValueAtTime(3.0, now);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + 0.5);
    osc.stop(now + 0.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterFilter);
  }

  // OSC 6: Atmospheric Pad (Textura sostenida larga F3, Ab3, C4, Eb4)
  _playAtmosphericPad(phase, now, R) {
    const noteIdx = 4 + Math.floor(phase * 4); // F3, Ab3, C4, Eb4
    const freq = this.scale[noteIdx].freq;

    const osc1 = this.audioCtx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    const osc2 = this.audioCtx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 1.498, now); // Quinta armónica

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.06); // Ataque largo pad
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterFilter);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.8);
    osc2.stop(now + 0.8);
  }

  // OSC 7: Electronic Percussion (Pulso percusivo sintético Kick / Snare)
  _playElectronicPercussion(phase, now, R) {
    // Cuerpo grave del pulso
    const osc = this.audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.09);

    const oscGain = this.audioCtx.createGain();
    oscGain.gain.setValueAtTime(0.38, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(oscGain);
    oscGain.connect(this.masterFilter);

    // Snap percusivo agudo
    const snap = this.audioCtx.createOscillator();
    snap.type = 'square';
    snap.frequency.setValueAtTime(320, now);

    const snapFilter = this.audioCtx.createBiquadFilter();
    snapFilter.type = 'bandpass';
    snapFilter.frequency.setValueAtTime(1800, now);
    snapFilter.Q.setValueAtTime(4.0, now);

    const snapGain = this.audioCtx.createGain();
    snapGain.gain.setValueAtTime(0.2, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    snap.connect(snapFilter);
    snapFilter.connect(snapGain);
    snapGain.connect(this.masterFilter);

    osc.start(now);
    snap.start(now);
    osc.stop(now + 0.14);
    snap.stop(now + 0.14);
  }

  // OSC 8: Bell / Digital Chime (Brillo agudo cristalino Ab4, C5, Eb5, Ab5)
  _playDigitalChime(phase, now, R) {
    const noteIdx = 10 + Math.floor(phase * 4); // Ab4, C5, Eb5, Ab5
    const freq = this.scale[noteIdx].freq;

    const osc1 = this.audioCtx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    const osc2 = this.audioCtx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2.005, now); // Octava detuned

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterFilter);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.7);
    osc2.stop(now + 0.7);
  }

  /**
   * Modula la apertura del filtro maestro y el feedback del delay según R.
   * @param {number} orderR - Valor R de 0 a 1
   */
  updateSystemAudioState(orderR) {
    if (!this.initialized) return;

    const now = this.audioCtx.currentTime;
    const targetFreq = 1800 + orderR * 4200;
    this.masterFilter.frequency.setTargetAtTime(targetFreq, now, 0.1);

    if (this.delayFeedback) {
      const targetFeedback = 0.2 + orderR * 0.15;
      this.delayFeedback.gain.setTargetAtTime(targetFeedback, now, 0.1);
    }
  }

  /**
   * Alterna el silenciador de audio
   * @returns {boolean} nuevo estado de silenciamiento
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(
        this.isMuted ? 0 : 0.42,
        this.audioCtx ? this.audioCtx.currentTime : 0
      );
    }
    return this.isMuted;
  }
}
