/**
 * AudioManager
 * Gestor de audio audiovisual y performativo.
 *
 * Compatible con:
 * - Desarrollo local con Vite
 * - GitHub Pages
 *
 * Audios personalizados en:
 * public/audio/
 */

export class AudioManager {

  constructor() {

    // ==============================
    // AUDIO CONTEXT
    // ==============================

    this.audioCtx = null;

    this.initialized = false;
    this.isMuted = false;

    // ==============================
    // BUFFERS
    // ==============================

    this.audioBuffers = {};

    this.activeSources = {};

    // Evita disparar demasiados sonidos simultáneamente
    this.lastTriggerTimes = {};

    // ==============================
    // MASTER
    // ==============================

    this.masterGain = null;
    this.masterFilter = null;
    this.compressor = null;

    // ==============================
    // AUDIOS
    // ==============================

    this.soundFileMap = [

      {
        id: 0,
        name: "limbo",
        files: ["limbo.wav"]
      },

      {
        id: 1,
        name: "lujuria",
        files: ["lujuria.wav", "lust.wav"]
      },

      {
        id: 2,
        name: "gula",
        files: ["gula.wav", "gluttony.wav"]
      },

      {
        id: 3,
        name: "avaricia",
        files: ["avaricia.mp3", "avaricia.wav", "greed.wav"]
      },

      {
        id: 4,
        name: "ira",
        files: ["ira.wav", "wrath.wav"]
      },

      {
        id: 5,
        name: "pereza",
        files: ["pereza.wav", "sloth.wav"]
      },

      {
        id: 6,
        name: "violencia",
        files: ["violencia.wav", "violence.wav"]
      },

      {
        id: 7,
        name: "traicion",
        files: ["traicion.wav", "treachery.wav"]
      }

    ];
  }


  // ============================================================
  // INICIALIZACIÓN
  // ============================================================

  async init() {

    if (this.initialized) {

      // Si el navegador suspendió el contexto, lo reactivamos
      if (
        this.audioCtx &&
        this.audioCtx.state === "suspended"
      ) {
        await this.audioCtx.resume();
      }

      return;
    }

    try {

      // Crear AudioContext

      this.audioCtx = new (
        window.AudioContext ||
        window.webkitAudioContext
      )();


      // ==============================
      // COMPRESOR
      // ==============================

      this.compressor =
        this.audioCtx.createDynamicsCompressor();

      this.compressor.threshold.setValueAtTime(
        -12,
        this.audioCtx.currentTime
      );

      this.compressor.knee.setValueAtTime(
        6,
        this.audioCtx.currentTime
      );

      this.compressor.ratio.setValueAtTime(
        5,
        this.audioCtx.currentTime
      );

      this.compressor.attack.setValueAtTime(
        0.003,
        this.audioCtx.currentTime
      );

      this.compressor.release.setValueAtTime(
        0.25,
        this.audioCtx.currentTime
      );


      // ==============================
      // FILTRO MASTER
      // ==============================

      this.masterFilter =
        this.audioCtx.createBiquadFilter();

      this.masterFilter.type = "lowpass";

      this.masterFilter.frequency.setValueAtTime(
        3200,
        this.audioCtx.currentTime
      );

      this.masterFilter.Q.setValueAtTime(
        0.7,
        this.audioCtx.currentTime
      );


      // ==============================
      // MASTER GAIN
      // ==============================

      this.masterGain =
        this.audioCtx.createGain();

      this.masterGain.gain.setValueAtTime(
        1.0,
        this.audioCtx.currentTime
      );


      // ==============================
      // CADENA DE AUDIO
      // ==============================

      this.masterFilter.connect(
        this.compressor
      );

      this.compressor.connect(
        this.masterGain
      );

      this.masterGain.connect(
        this.audioCtx.destination
      );


      // ==============================
      // RESOLVER AUTOPLAY
      // ==============================

      if (this.audioCtx.state === "suspended") {

        await this.audioCtx.resume();

      }


      // ==============================
      // CARGAR AUDIOS
      // ==============================

      await this._loadCustomAudioFiles();


      this.initialized = true;

      console.log(
        "[AudioManager] ✓ Audio inicializado"
      );

      console.log(
        "[AudioManager] Audios cargados:",
        Object.keys(this.audioBuffers)
      );

    } catch (error) {

      console.error(
        "[AudioManager] Error inicializando:",
        error
      );

    }
  }


  // ============================================================
  // CARGAR TODOS LOS AUDIOS
  // ============================================================

  async loadAll() {

    if (!this.initialized) {

      await this.init();

    }

    else {

      await this._loadCustomAudioFiles();

    }

  }


  // ============================================================
  // CARGAR ARCHIVOS PERSONALIZADOS
  // ============================================================

  async _loadCustomAudioFiles() {

    if (!this.audioCtx) {

      console.warn(
        "[AudioManager] No existe AudioContext."
      );

      return;

    }


    for (const item of this.soundFileMap) {

      let loaded = false;


      for (const fileName of item.files) {

        /*
         * IMPORTANTE PARA GITHUB PAGES
         *
         * NO usamos:
         *
         * /audio/archivo.wav
         *
         * porque GitHub Pages utiliza:
         *
         * /kuramoto/audio/archivo.wav
         *
         * BASE_URL resuelve ambas situaciones.
         */

        const filePath =
          `${import.meta.env.BASE_URL}audio/${fileName}`;


        console.log(
          `[AudioManager] Intentando cargar: ${filePath}`
        );


        try {

          const response =
            await fetch(filePath);


          console.log(
            `[AudioManager] ${fileName}: HTTP ${response.status}`
          );


          if (!response.ok) {

            continue;

          }


          const arrayBuffer =
            await response.arrayBuffer();


          const decoded =
            await this.audioCtx.decodeAudioData(
              arrayBuffer
            );


          this.audioBuffers[item.id] =
            decoded;


          console.log(
            `[AudioManager] ✓ Cargado: ${fileName} → ${item.name}`
          );


          loaded = true;

          break;

        }

        catch (error) {

          console.error(
            `[AudioManager] Error cargando ${filePath}:`,
            error
          );

        }

      }


      if (!loaded) {

        console.warn(
          `[AudioManager] ⚠ No se encontró audio para ${item.name}. Se utilizará el sintetizador.`
        );

      }

    }

  }


  // ============================================================
  // REPRODUCIR AUDIO DIRECTAMENTE
  // ============================================================

  play(id, options = {}) {

    if (!this.initialized) {

      console.warn(
        "[AudioManager] No está inicializado."
      );

      return;

    }


    if (this.isMuted) {

      return;

    }


    if (
      this.audioCtx.state === "suspended"
    ) {

      this.audioCtx.resume();

    }


    const buffer =
      this.audioBuffers[id];


    if (!buffer) {

      console.warn(
        `[AudioManager] No hay buffer para ${id}`
      );

      return;

    }


    try {

      const source =
        this.audioCtx.createBufferSource();


      const gainNode =
        this.audioCtx.createGain();


      source.buffer = buffer;


      const volume =
        options.volume !== undefined
          ? options.volume
          : 0.7;


      gainNode.gain.setValueAtTime(
        volume,
        this.audioCtx.currentTime
      );


      source.connect(gainNode);

      gainNode.connect(
        this.masterFilter
      );


      this.activeSources[id] =
        source;


      source.onended = () => {

        if (
          this.activeSources[id] === source
        ) {

          delete this.activeSources[id];

        }

      };


      const offset =
        options.offset !== undefined
          ? options.offset
          : 0;


      source.start(
        0,
        offset
      );


      console.log(
        `[AudioManager] ▶ Reproduciendo: ${id}`
      );


      return source;

    }

    catch (error) {

      console.error(
        `[AudioManager] Error reproduciendo ${id}:`,
        error
      );

    }

  }


  // ============================================================
  // EVENTOS DE PERSONAJES
  // ============================================================

  triggerCharacterEvent(
    oscId,
    eventName = "EVENT"
  ) {

    if (
      !this.initialized ||
      this.isMuted
    ) {

      return;

    }


    if (
      this.audioCtx.state === "suspended"
    ) {

      this.audioCtx.resume();

    }


    const id =
      Number(oscId) % 8;


    const now =
      this.audioCtx.currentTime;


    const lastTime =
      this.lastTriggerTimes[id] || 0;


    // Evitar demasiados sonidos superpuestos

    if (
      now - lastTime < 0.25
    ) {

      return;

    }


    this.lastTriggerTimes[id] =
      now;


    console.log(
      `[AudioManager] Evento ${eventName} → personaje ${id}`
    );


    // ==============================
    // AUDIO PERSONALIZADO
    // ==============================

    if (this.audioBuffers[id]) {

      const source =
        this.audioCtx.createBufferSource();


      source.buffer =
        this.audioBuffers[id];


      const gain =
        this.audioCtx.createGain();


      gain.gain.setValueAtTime(
        0.7,
        now
      );


      source.connect(gain);

      gain.connect(
        this.masterFilter
      );


      source.start(now);


      return;

    }


    // ==============================
    // FALLBACK
    // ==============================

    this._playSynthFallback(
      id,
      0.5,
      now,
      0.5
    );

  }


  // ============================================================
  // TRIGGER NOTE
  // ============================================================

  triggerNote(
    osc,
    orderR = 0
  ) {

    if (
      !this.initialized ||
      this.isMuted ||
      !osc ||
      !osc.active
    ) {

      return;

    }


    const oscId =
      osc.id % 8;


    const theta =
      osc.normalizedTheta !== undefined
        ? osc.normalizedTheta
        : 0.5;


    const now =
      this.audioCtx.currentTime;


    const lastTime =
      this.lastTriggerTimes[oscId] || 0;


    if (
      now - lastTime < 0.25
    ) {

      return;

    }


    this.lastTriggerTimes[oscId] =
      now;


    // ==============================
    // AUDIO PERSONALIZADO
    // ==============================

    if (
      this.audioBuffers[oscId]
    ) {

      const source =
        this.audioCtx.createBufferSource();


      source.buffer =
        this.audioBuffers[oscId];


      const gain =
        this.audioCtx.createGain();


      gain.gain.setValueAtTime(
        0.7,
        now
      );


      source.connect(gain);

      gain.connect(
        this.masterFilter
      );


      source.start(now);


      return;

    }


    // ==============================
    // FALLBACK
    // ==============================

    this._playSynthFallback(
      oscId,
      theta,
      now,
      orderR
    );

  }


  // ============================================================
  // SINTETIZADOR DE RESPALDO
  // ============================================================

  _playSynthFallback(
    oscId,
    normalizedTheta = 0.5,
    now,
    R = 0.5
  ) {

    if (!this.audioCtx) {

      return;

    }


    const oscillator =
      this.audioCtx.createOscillator();


    const gain =
      this.audioCtx.createGain();


    // Frecuencias diferentes para cada círculo

    const frequencies = [

      130.81, // Limbo - C3
      164.81, // Lujuria - E3
      196.00, // Gula - G3
      220.00, // Avaricia - A3
      261.63, // Ira - C4
      293.66, // Pereza - D4
      329.63, // Violencia - E4
      392.00  // Traición - G4

    ];


    let freq =
      frequencies[oscId] ||
      220;


    // Pequeña variación según theta

    freq *=
      1 +
      (
        (normalizedTheta - 0.5) *
        0.15
      );


    oscillator.type =
      "sine";


    oscillator.frequency.setValueAtTime(
      freq,
      now
    );


    gain.gain.setValueAtTime(
      0.001,
      now
    );


    gain.gain.linearRampToValueAtTime(
      0.22,
      now + 0.01
    );


    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + 0.38
    );


    oscillator.connect(gain);

    gain.connect(
      this.masterFilter
    );


    oscillator.start(now);

    oscillator.stop(
      now + 0.4
    );

  }


  // ============================================================
  // ACTUALIZAR AUDIO SEGÚN R DE KURAMOTO
  // ============================================================

  updateSystemAudioState(
    orderR
  ) {

    if (
      !this.initialized ||
      !this.audioCtx ||
      !this.masterFilter
    ) {

      return;

    }


    const now =
      this.audioCtx.currentTime;


    /*
     * R representa el grado de sincronización.
     *
     * R ≈ 0 → desorden
     * R ≈ 1 → sincronización
     *
     * Cuando aumenta R:
     * - el filtro se abre
     * - el sonido se vuelve más brillante
     *
     * Cuando disminuye R:
     * - el filtro se cierra
     * - el sonido se vuelve más oscuro
     */


    const R =
      Math.max(
        0,
        Math.min(
          1,
          Number(orderR) || 0
        )
      );


    const minFreq =
      900;


    const maxFreq =
      5000;


    const frequency =
      minFreq +
      (
        maxFreq -
        minFreq
      ) * R;


    this.masterFilter.frequency
      .setTargetAtTime(
        frequency,
        now,
        0.08
      );

  }


  // ============================================================
  // MUTE
  // ============================================================

  mute() {

    this.isMuted = true;


    if (this.masterGain) {

      this.masterGain.gain.setTargetAtTime(
        0,
        this.audioCtx.currentTime,
        0.03
      );

    }

  }


  // ============================================================
  // UNMUTE
  // ============================================================

  unmute() {

    this.isMuted = false;


    if (this.masterGain) {

      this.masterGain.gain.setTargetAtTime(
        1,
        this.audioCtx.currentTime,
        0.03
      );

    }

  }


  // ============================================================
  // TOGGLE MUTE
  // ============================================================

  toggleMute() {

    if (this.isMuted) {

      this.unmute();

    }

    else {

      this.mute();

    }


    return this.isMuted;

  }


  // ============================================================
  // DETENER AUDIO
  // ============================================================

  stop(id) {

    const source =
      this.activeSources[id];


    if (source) {

      try {

        source.stop();

      }

      catch (error) {

        // El source puede haber terminado naturalmente

      }


      delete this.activeSources[id];

    }

  }


  // ============================================================
  // DETENER TODO
  // ============================================================

  stopAll() {

    Object.keys(
      this.activeSources
    ).forEach(
      id => this.stop(id)
    );

  }


  // ============================================================
  // VOLUMEN MASTER
  // ============================================================

  setMasterVolume(
    volume
  ) {

    if (!this.masterGain) {

      return;

    }


    const value =
      Math.max(
        0,
        Math.min(
          1,
          Number(volume)
        )
      );


    this.masterGain.gain.setTargetAtTime(
      value,
      this.audioCtx.currentTime,
      0.03
    );

  }


  // ============================================================
  // ¿ESTÁ CARGADO?
  // ============================================================

  isLoaded(id) {

    return !!this.audioBuffers[id];

  }


  // ============================================================
  // AUDIOS CARGADOS
  // ============================================================

  getLoadedAudios() {

    return Object.keys(
      this.audioBuffers
    );

  }

}