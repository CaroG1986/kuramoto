/**
 * Gestor de Audio Audiovisual y Performativo basado en Web Audio API.
 * Carga archivos de audio personalizados desde public/audio/ para cada Círculo del Infierno:
 * - limbo.wav, lust.wav, gluttony.wav, greed.wav, wrath.wav, sloth.wav, violence.wav, treachery.wav
 * Posee sintetizadores Web Audio API como fallback si los archivos .wav no están presentes.
 */
export class AudioManager {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.compressor = null;
    this.masterFilter = null;
    this.isMuted = false;
    this.initialized = false;

    // Buffer de muestras cargadas por ID de oscilador
    this.audioBuffers = {};
    this.customFiles = [
      'limbo.wav',
      'lust.wav',
      'gluttony.wav',
      'greed.wav',
      'wrath.wav',
      'sloth.wav',
      'violence.wav',
      'treachery.wav'
    ];
  }

  /**
   * Inicializa el AudioContext, la cadena de efectos y carga los archivos .wav personalizados.
   */
  async init() {
    if (this.initialized) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContext();

    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    // Compresor de dinámica maestro
    this.compressor = this.audioCtx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-12, this.audioCtx.currentTime);
    this.compressor.knee.setValueAtTime(6, this.audioCtx.currentTime);
    this.compressor.ratio.setValueAtTime(5, this.audioCtx.currentTime);

    // Filtro maestro reactivo a R
    this.masterFilter = this.audioCtx.createBiquadFilter();
    this.masterFilter.type = 'lowpass';
    this.masterFilter.frequency.setValueAtTime(3200, this.audioCtx.currentTime);

    // Ganancia Maestra
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.setValueAtTime(0.5, this.audioCtx.currentTime);

    this.masterFilter.connect(this.compressor);
    this.compressor.connect(this.masterGain);
    this.masterGain.connect(this.audioCtx.destination);

    // Intentar cargar archivos .wav desde public/audio/
    this._loadCustomAudioFiles();

    this.initialized = true;
  }

  /**
   * Intenta cargar los 8 archivos de audio desde public/audio/
   */
  async _loadCustomAudioFiles() {
    for (let i = 0; i < 8; i++) {
      const fileName = this.customFiles[i];
      const filePath = `/audio/${fileName}`;

      try {
        const res = await fetch(filePath);
        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          const decoded = await this.audioCtx.decodeAudioData(arrayBuffer);
          this.audioBuffers[i] = decoded;
          console.log(`[AudioManager] Cargado archivo de audio personalizado: ${fileName}`);
        }
      } catch (err) {
        // Si el archivo no existe aún en public/audio/, se usará el sintetizador de respaldo
      }
    }
  }

  /**
   * Dispara el evento de audio asociado al oscilador
   * @param {Object} osc 
   * @param {number} orderR 
   */
  triggerNote(osc, orderR = 0) {
    if (!this.initialized || this.isMuted || !osc.active) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const oscId = osc.id % 8;
    const now = this.audioCtx.currentTime;

    // 1. Si existe archivo .wav cargado en el buffer, reproducirlo
    if (this.audioBuffers[oscId]) {
      const source = this.audioCtx.createBufferSource();
      source.buffer = this.audioBuffers[oscId];
      
      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.6, now);

      source.connect(gain);
      gain.connect(this.masterFilter);
      source.start(now);
      return;
    }

    // 2. De lo contrario, usar sintetizador de respaldo según el Círculo del Infierno
    this._playSynthFallback(oscId, osc.normalizedTheta, now, orderR);
  }

  /**
   * Sintetizador de respaldo para cada Círculo del Infierno
   */
  _playSynthFallback(oscId, normalizedTheta, now, R) {
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    const freqs = [110, 220, 164.8, 329.63, 440, 130.81, 293.66, 523.25];
    const freq = freqs[oscId] || 220;

    osc.type = oscId % 2 === 0 ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.masterFilter);

    osc.start(now);
    osc.stop(now + 0.42);
  }

  /**
   * Actualiza el filtro del sistema de audio según el valor de R
   * @param {number} orderR 
   */
  updateSystemAudioState(orderR) {
    if (!this.initialized) return;
    const now = this.audioCtx.currentTime;
    const targetFreq = 1800 + orderR * 4200;
    this.masterFilter.frequency.setTargetAtTime(targetFreq, now, 0.1);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(
        this.isMuted ? 0 : 0.5,
        this.audioCtx ? this.audioCtx.currentTime : 0
      );
    }
    return this.isMuted;
  }
}
