export class AudioManager {
  constructor() {
    this.audioCtx = null;
    this.audioBuffers = {};
    this.activeSources = {};
    this.masterGain = null;

    // Los nombres de los archivos que tienes en public/audio
    this.audioFiles = {
      limbo: "limbo.wav",
      lujuria: "lujuria.wav",
      gula: "gula.wav",
      avaricia: "avaricia.mp3",
      ira: "ira.wav",
      pereza: "pereza.wav",
      violencia: "violencia.wav",
      traicion: "traicion.wav"
    };
  }

  /**
   * Inicializa el AudioContext.
   * Debe llamarse después de una interacción del usuario
   * debido a las restricciones de los navegadores.
   */
  async init() {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext ||
          window.webkitAudioContext)();

        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.value = 1.0;
        this.masterGain.connect(this.audioCtx.destination);
      }

      if (this.audioCtx.state === "suspended") {
        await this.audioCtx.resume();
      }

      console.log(
        "[AudioManager] AudioContext:",
        this.audioCtx.state
      );

    } catch (error) {
      console.error(
        "[AudioManager] Error inicializando audio:",
        error
      );
    }
  }

  /**
   * Carga todos los audios.
   */
  async loadAll() {
    await this.init();

    for (const [id, fileName] of Object.entries(this.audioFiles)) {
      await this.loadAudio(id, fileName);
    }

    console.log(
      "[AudioManager] Todos los audios fueron procesados."
    );
  }

  /**
   * Carga un archivo de audio.
   */
  async loadAudio(id, fileName) {
    // BASE_URL permite que funcione tanto localmente
    // como en GitHub Pages.
    const filePath =
      `${import.meta.env.BASE_URL}audio/${fileName}`;

    console.log(
      `[AudioManager] Intentando cargar: ${filePath}`
    );

    try {
      const response = await fetch(filePath);

      console.log(
        `[AudioManager] Respuesta ${fileName}:`,
        response.status,
        response.url
      );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status} - ${response.statusText}`
        );
      }

      const arrayBuffer = await response.arrayBuffer();

      const audioBuffer =
        await this.audioCtx.decodeAudioData(arrayBuffer);

      this.audioBuffers[id] = audioBuffer;

      console.log(
        `[AudioManager] ✓ Audio cargado correctamente: ${id}`
      );

      return true;

    } catch (error) {
      console.error(
        `[AudioManager] ✗ Error cargando ${fileName}`,
        error
      );

      return false;
    }
  }

  /**
   * Reproduce un audio.
   *
   * Ejemplo:
   * audioManager.play("violencia");
   */
  play(id, options = {}) {
    if (!this.audioCtx) {
      console.warn(
        "[AudioManager] El AudioContext no está inicializado."
      );
      return;
    }

    const buffer = this.audioBuffers[id];

    if (!buffer) {
      console.warn(
        `[AudioManager] No existe un audio cargado para: ${id}`
      );
      return;
    }

    try {
      const source = this.audioCtx.createBufferSource();
      const gainNode = this.audioCtx.createGain();

      source.buffer = buffer;

      // Volumen
      gainNode.gain.value =
        options.volume !== undefined
          ? options.volume
          : 1.0;

      source.connect(gainNode);
      gainNode.connect(this.masterGain);

      // Guardamos referencia al source
      this.activeSources[id] = source;

      // Cuando termina, eliminamos la referencia
      source.onended = () => {
        if (this.activeSources[id] === source) {
          delete this.activeSources[id];
        }
      };

      // Comenzar desde una posición específica
      const offset =
        options.offset !== undefined
          ? options.offset
          : 0;

      source.start(0, offset);

      console.log(
        `[AudioManager] ▶ Reproduciendo: ${id}`
      );

      return source;

    } catch (error) {
      console.error(
        `[AudioManager] Error reproduciendo ${id}:`,
        error
      );
    }
  }

  /**
   * Detiene un audio específico.
   */
  stop(id) {
    const source = this.activeSources[id];

    if (source) {
      try {
        source.stop();
      } catch (error) {
        console.warn(
          `[AudioManager] No se pudo detener ${id}:`,
          error
        );
      }

      delete this.activeSources[id];
    }
  }

  /**
   * Detiene todos los audios.
   */
  stopAll() {
    Object.keys(this.activeSources).forEach((id) => {
      this.stop(id);
    });
  }

  /**
   * Cambia el volumen general.
   */
  setMasterVolume(volume) {
    if (!this.masterGain) return;

    this.masterGain.gain.value = Math.max(
      0,
      Math.min(1, volume)
    );
  }

  /**
   * Comprueba si un audio está cargado.
   */
  isLoaded(id) {
    return !!this.audioBuffers[id];
  }

  /**
   * Devuelve los audios que ya fueron cargados.
   */
  getLoadedAudios() {
    return Object.keys(this.audioBuffers);
  }
}