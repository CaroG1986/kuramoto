/**
 * Gestor de Audio Audiovisual y Performativo basado en Web Audio API.
 * Carga archivos de audio personalizados desde public/audio/ para los 8 Círculos del Infierno:
 * - limbo.wav, lujuria.wav, gula.wav, avaricia.wav, ira.wav, pereza.wav, violencia.wav, traicion.wav
 * (Soporta también nombres alternativos en inglés como fallback si están en disco).
 */
export class AudioManager {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.compressor = null;
    this.masterFilter = null;
    this.isMuted = false;
    this.initialized = false;

    // Buffer de muestras cargadas por ID de oscilador (0 a 7)
    this.audioBuffers = {};

    // Mapeo de archivos primarios y secundarios en public/audio/
    this.soundFileMap = [
      { id: 0, name: 'limbo', files: ['limbo.wav'] },
      { id: 1, name: 'lujuria', files: ['lujuria.wav', 'lust.wav'] },
      { id: 2, name: 'gula', files: ['gula.wav', 'gluttony.wav'] },
      { id: 3, name: 'avaricia', files: ['avaricia.wav', 'greed.wav'] },
      { id: 4, name: 'ira', files: ['ira.wav', 'wrath.wav'] },
      { id: 5, name: 'pereza', files: ['pereza.wav', 'sloth.wav'] },
      { id: 6, name: 'violencia', files: ['violencia.wav', 'violence.wav'] },
      { id: 7, name: 'traicion', files: ['traicion.wav', 'treachery.wav'] }
    ];

    this.lastTriggerTimes = {};
  }

  /**
   * Inicializa el AudioContext, la cadena de efectos y carga los archivos .wav de public/audio/
   */
  async init() {
    if (this.initialized) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContext();

    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    // Compresor maestro
    this.compressor = this.audioCtx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-12, this.audioCtx.currentTime);
    this.compressor.knee.setValueAtTime(6, this.audioCtx.currentTime);
    this.compressor.ratio.setValueAtTime(5, this.audioCtx.currentTime);

    // Filtro maestro
    this.masterFilter = this.audioCtx.createBiquadFilter();
    this.masterFilter.type = 'lowpass';
    this.masterFilter.frequency.setValueAtTime(3200, this.audioCtx.currentTime);

    // Ganancia Maestra
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.setValueAtTime(0.5, this.audioCtx.currentTime);

    this.masterFilter.connect(this.compressor);
    this.compressor.connect(this.masterGain);
    this.masterGain.connect(this.audioCtx.destination);

    // Cargar archivos de audio
    await this._loadCustomAudioFiles();

    this.initialized = true;
  }

  /**
   * Intenta cargar los 8 archivos de audio desde public/audio/
   */
  async _loadCustomAudioFiles() {
    for (const item of this.soundFileMap) {
      let loaded = false;
      for (const fileName of item.files) {
        const filePath = `/audio/${fileName}`;
        try {
          const res = await fetch(filePath);
          if (res.ok) {
            const arrayBuffer = await res.arrayBuffer();
            const decoded = await this.audioCtx.decodeAudioData(arrayBuffer);
            this.audioBuffers[item.id] = decoded;
            console.log(`[AudioManager] Cargado correctamente: ${fileName} para ${item.name}`);
            loaded = true;
            break; // Archivo encontrado
          }
        } catch (err) {
          // Continuar al siguiente posible nombre
        }
      }
    }
  }

  /**
   * Dispara el audio del personaje ante eventos específicos de comportamiento
   * @param {number} oscId 
   * @param {string} eventName 
   */
  triggerCharacterEvent(oscId, eventName = 'EVENT') {
    if (!this.initialized || this.isMuted) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const now = this.audioCtx.currentTime;
    const lastTime = this.lastTriggerTimes[oscId] || 0;
    if (now - lastTime < 0.25) return; // Evitar traslapes excesivos
    this.lastTriggerTimes[oscId] = now;

    // Reproducir si existe muestra en buffer
    if (this.audioBuffers[oscId]) {
      const source = this.audioCtx.createBufferSource();
      source.buffer = this.audioBuffers[oscId];

      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.7, now);

      source.connect(gain);
      gain.connect(this.masterFilter);
      source.start(now);
      return;
    }

    // Sintetizador de respaldo si no hay archivo en disco
    this._playSynthFallback(oscId, 0.5, now, 0.5);
  }

  /**
   * Dispara audio por evento de cresta de oscilador
   * @param {Object} osc 
   * @param {number} orderR 
   */
  triggerNote(osc, orderR = 0) {
    if (!this.initialized || this.isMuted || !osc.active) return;
    this.triggerCharacterEvent(osc.id, 'PEAK');
  }

  /**
   * Sintetizador de respaldo cuando no se ha colocado archivo .wav en public/audio/
   */
  _playSynthFallback(oscId, normalizedTheta, now, R) {
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    const freqs = [110, 220, 164.8, 329.63, 440, 130.81, 293.66, 523.25];
    const freq = freqs[oscId] || 220;

    osc.type = oscId % 2 === 0 ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

    osc.connect(gain);
    gain.connect(this.masterFilter);

    osc.start(now);
    osc.stop(now + 0.4);
  }

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
