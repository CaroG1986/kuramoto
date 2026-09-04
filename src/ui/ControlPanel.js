/**
 * Panel de Control de Interfaz HTML/CSS para la experiencia performativa de Kuramoto.
 */
export class ControlPanel {
  /**
   * @param {Object} config
   * @param {import('../core/KuramotoSystem.js').KuramotoSystem} config.kuramoto
   * @param {import('../audio/AudioManager.js').AudioManager} config.audio
   * @param {Function} config.onStartExperience - Callback cuando se presiona START EXPERIENCE
   * @param {Function} config.onResetCamera - Callback para resetear vista de cámara
   */
  constructor({ kuramoto, audio, onStartExperience, onResetCamera }) {
    this.kuramoto = kuramoto;
    this.audio = audio;
    this.onStartExperience = onStartExperience;
    this.onResetCamera = onResetCamera;

    this.selectedOscillator = null;

    this._createDOMStructure();
    this._bindEvents();
  }

  /**
   * Construye dinámicamente los elementos DOM de la interfaz
   */
  _createDOMStructure() {
    // 1. Pantalla Inicial Overlay (Autoplay Web Audio Unlock)
    this.startOverlay = document.createElement('div');
    this.startOverlay.className = 'start-overlay';
    this.startOverlay.innerHTML = `
      <div class="start-card">
        <div class="start-badge">EXP AUDIOVISUAL PERFORMÁTICA</div>
        <h1>KURAMOTO PLAYGROUND</h1>
        <p>Sincronización emergente en vivo mediante el Modelo de Kuramoto sobre 8 osciladores y 4 sube y bajas.</p>
        <button id="btn-start-exp" class="btn-primary">START EXPERIENCE</button>
      </div>
    `;
    document.body.appendChild(this.startOverlay);

    // 2. Contenedor Principal del Panel de Control
    this.panelContainer = document.createElement('div');
    this.panelContainer.className = 'control-panel';
    this.panelContainer.innerHTML = `
      <div class="panel-header">
        <h2>KURAMOTO LAB</h2>
        <span class="panel-subtitle">SISTEMA AUDIOVISUAL</span>
      </div>

      <!-- MEDIDOR DE SINCRONIZACIÓN R -->
      <div class="sync-meter-card">
        <div class="sync-header">
          <span class="sync-label">SYNC (Parámetro de Orden R)</span>
          <span id="sync-value" class="sync-number">0.00</span>
        </div>
        <div class="sync-bar-bg">
          <div id="sync-bar-fill" class="sync-bar-fill" style="width: 0%"></div>
        </div>
        <div id="sync-state-badge" class="sync-state-badge state-disorder">DESORDEN</div>
      </div>

      <!-- CONTROLES GLOBALES -->
      <div class="control-group">
        <label>
          <span>Acoplamiento <strong>K</strong></span>
          <span id="val-k" class="val-badge">1.0</span>
        </label>
        <input type="range" id="slider-k" min="0" max="10" step="0.1" value="1.0" />
      </div>

      <div class="control-group">
        <label>
          <span>Velocidad Global <strong>SPEED</strong></span>
          <span id="val-speed" class="val-badge">1.0x</span>
        </label>
        <input type="range" id="slider-speed" min="0.1" max="3" step="0.1" value="1.0" />
      </div>

      <!-- PRESETS PERFORMÁTICOS -->
      <div class="preset-buttons">
        <button id="btn-preset-caos" class="btn-chip">Caos (K=0)</button>
        <button id="btn-preset-parcial" class="btn-chip">Parcial (K=1.8)</button>
        <button id="btn-preset-sync" class="btn-chip">Sincro (K=5.0)</button>
      </div>

      <!-- LISTA DE LOS 8 OSCILADORES -->
      <div class="osc-list-section">
        <h3>OSCILADORES (8)</h3>
        <div id="osc-items-container" class="osc-items-container"></div>
      </div>

      <!-- TARJETA DEL OSCILADOR SELECCIONADO -->
      <div id="inspector-card" class="inspector-card hidden">
        <div class="inspector-header">
          <span id="insp-color-dot" class="color-dot"></span>
          <strong id="insp-title">Oscilador #1</strong>
          <button id="btn-close-insp" class="btn-close">&times;</button>
        </div>
        <div class="inspector-body">
          <div class="insp-row"><span>Fase θ:</span> <strong id="insp-theta">0.00 rad</strong></div>
          <div class="insp-row"><span>Nota:</span> <strong id="insp-note">C4</strong></div>
          <div class="insp-row">
            <span>Frecuencia ω:</span>
            <input type="range" id="insp-slider-omega" min="0.2" max="5.0" step="0.1" value="1.0" />
            <span id="insp-val-omega" class="val-badge">1.0</span>
          </div>
        </div>
      </div>

      <!-- ACCIONES DE BARRA INFERIOR -->
      <div class="panel-footer-actions">
        <button id="btn-random-phases" class="btn-secondary">Reordenar Fases</button>
        <button id="btn-reset-cam" class="btn-secondary">Reset Cámara</button>
        <button id="btn-toggle-audio" class="btn-secondary">Audio: ON</button>
      </div>
    `;
    document.body.appendChild(this.panelContainer);

    this._renderOscillatorList();
  }

  /**
   * Genera los elementos individuales para cada uno de los 8 osciladores
   */
  _renderOscillatorList() {
    const container = this.panelContainer.querySelector('#osc-items-container');
    container.innerHTML = '';

    this.kuramoto.oscillators.forEach((osc) => {
      const item = document.createElement('div');
      item.className = `osc-item ${osc.active ? '' : 'inactive'}`;
      item.dataset.id = osc.id;

      item.innerHTML = `
        <div class="osc-item-left">
          <span class="color-dot" style="background-color: ${osc.color}"></span>
          <span class="osc-name">#0${osc.id + 1} (${osc.name})</span>
        </div>
        <div class="osc-item-right">
          <label class="toggle-switch">
            <input type="checkbox" class="chk-osc-active" data-id="${osc.id}" ${osc.active ? 'checked' : ''} />
            <span class="slider-toggle"></span>
          </label>
        </div>
      `;

      container.appendChild(item);
    });
  }

  /**
   * Vincula los event listeners a la interfaz
   */
  _bindEvents() {
    // 1. Botón Start Experience
    const btnStart = this.startOverlay.querySelector('#btn-start-exp');
    btnStart.addEventListener('click', () => {
      this.startOverlay.classList.add('fade-out');
      setTimeout(() => this.startOverlay.remove(), 400);
      if (this.onStartExperience) this.onStartExperience();
    });

    // 2. Slider K
    const sliderK = this.panelContainer.querySelector('#slider-k');
    const valK = this.panelContainer.querySelector('#val-k');
    sliderK.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.kuramoto.setCoupling(val);
      valK.textContent = val.toFixed(1);
    });

    // 3. Slider Speed
    const sliderSpeed = this.panelContainer.querySelector('#slider-speed');
    const valSpeed = this.panelContainer.querySelector('#val-speed');
    sliderSpeed.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.kuramoto.setSpeed(val);
      valSpeed.textContent = `${val.toFixed(1)}x`;
    });

    // 4. Presets
    this.panelContainer.querySelector('#btn-preset-caos').addEventListener('click', () => {
      sliderK.value = 0;
      sliderK.dispatchEvent(new Event('input'));
    });
    this.panelContainer.querySelector('#btn-preset-parcial').addEventListener('click', () => {
      sliderK.value = 1.8;
      sliderK.dispatchEvent(new Event('input'));
    });
    this.panelContainer.querySelector('#btn-preset-sync').addEventListener('click', () => {
      sliderK.value = 5.0;
      sliderK.dispatchEvent(new Event('input'));
    });

    // 5. Checkboxes de Osciladores Activos/Inactivos
    this.panelContainer.addEventListener('change', (e) => {
      if (e.target.classList.contains('chk-osc-active')) {
        const id = parseInt(e.target.dataset.id, 10);
        const active = e.target.checked;
        this.kuramoto.setOscillatorActive(id, active);
        const item = e.target.closest('.osc-item');
        if (item) item.classList.toggle('inactive', !active);
      }
    });

    // 6. Botones de Acción
    this.panelContainer.querySelector('#btn-random-phases').addEventListener('click', () => {
      this.kuramoto.randomizePhases();
    });

    this.panelContainer.querySelector('#btn-reset-cam').addEventListener('click', () => {
      if (this.onResetCamera) this.onResetCamera();
    });

    const btnAudio = this.panelContainer.querySelector('#btn-toggle-audio');
    btnAudio.addEventListener('click', () => {
      const isMuted = this.audio.toggleMute();
      btnAudio.textContent = `Audio: ${isMuted ? 'OFF' : 'ON'}`;
    });

    // 7. Cierre de Inspector
    this.panelContainer.querySelector('#btn-close-insp').addEventListener('click', () => {
      this.setSelectedOscillator(null);
    });

    // 8. Slider de Omega en Inspector
    const sliderOmega = this.panelContainer.querySelector('#insp-slider-omega');
    const valOmega = this.panelContainer.querySelector('#insp-val-omega');
    sliderOmega.addEventListener('input', (e) => {
      if (this.selectedOscillator) {
        const val = parseFloat(e.target.value);
        this.kuramoto.setOscillatorOmega(this.selectedOscillator.id, val);
        valOmega.textContent = val.toFixed(1);
      }
    });
  }

  /**
   * Actualiza los datos del inspector cuando un oscilador es seleccionado en 3D
   * @param {import('../core/Oscillator.js').Oscillator | null} osc
   */
  setSelectedOscillator(osc) {
    this.selectedOscillator = osc;
    const card = this.panelContainer.querySelector('#inspector-card');

    if (!osc) {
      card.classList.add('hidden');
      return;
    }

    card.classList.remove('hidden');
    card.querySelector('#insp-color-dot').style.backgroundColor = osc.color;
    card.querySelector('#insp-title').textContent = `Oscilador #0${osc.id + 1}`;
    card.querySelector('#insp-note').textContent = osc.name;

    const sliderOmega = card.querySelector('#insp-slider-omega');
    const valOmega = card.querySelector('#insp-val-omega');
    sliderOmega.value = osc.omega;
    valOmega.textContent = osc.omega.toFixed(1);
  }

  /**
   * Actualiza los elementos dinámicos del panel en cada cuadro
   */
  update() {
    const R = this.kuramoto.orderParameterR;

    // 1. Actualizar barra y número R
    const syncNumber = this.panelContainer.querySelector('#sync-value');
    const syncFill = this.panelContainer.querySelector('#sync-bar-fill');
    const syncBadge = this.panelContainer.querySelector('#sync-state-badge');

    syncNumber.textContent = R.toFixed(2);
    syncFill.style.width = `${Math.min(100, R * 100)}%`;

    // 2. Estado emergente
    if (R < 0.35) {
      syncBadge.textContent = 'ESTADO 1 — DESORDEN';
      syncBadge.className = 'sync-state-badge state-disorder';
    } else if (R < 0.75) {
      syncBadge.textContent = 'ESTADO 2 — ORGANIZACIÓN PARCIAL';
      syncBadge.className = 'sync-state-badge state-partial';
    } else {
      syncBadge.textContent = 'ESTADO 3 — SINCRONIZACIÓN ESTABLE';
      syncBadge.className = 'sync-state-badge state-sync';
    }

    // 3. Actualizar fase en inspector si está abierto
    if (this.selectedOscillator) {
      const inspTheta = this.panelContainer.querySelector('#insp-theta');
      if (inspTheta) {
        inspTheta.textContent = `${this.selectedOscillator.normalizedTheta.toFixed(2)} rad`;
      }
    }
  }
}
