<script>
  import { onMount } from 'svelte';
  import * as Blockly from 'blockly';
  import { bartcodeGenerator } from './blocks/generator.js';
  import { runBartcode } from './interpreter/interpreter.js';
  import { toolboxXML } from './blocks/toolbox.js';
  import { initKeyboard } from './keyboard.js';
  import { clearAliases } from './tracking.js';
  import RamBar from './RamBar.svelte';
  import './blocks/bartcode_blocks.js';
  import './app.css';

  let blocklyDiv;
  let workspace;
  let consoleOutput = 'ready...\n';
  let ramUsed = 0;
  let ramTotal = 524288;
  let running = false;
  let stopBartcode = null;
  let fileOpen = false;
  let fileInput;
  let toolsOpen = false;
  let prefsOpen = false;
  let renderer = 'zelos';
  let soundEnabled = true;
  let theme = 'dark';
  try {
    renderer = localStorage.getItem('bartcode_renderer') || 'zelos';
    soundEnabled = localStorage.getItem('bartcode_sound') !== 'false';
    theme = localStorage.getItem('bartcode_theme') || 'dark';
  } catch (_) {}
  let playermode = false;
  let projectFile = null;

  async function loadProjectFromURL(url) {
    try {
      let response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      let state = await response.json();
      clearAliases();
      Blockly.serialization.workspaces.load(state, workspace);
      if (playermode) {
        handleRun();
      }
    } catch (err) {
      console.error(err);
      if (playermode) {
        consoleOutput = 'Error loading project: ' + err.message + '\n';
      } else {
        alert('Failed to load project from URL: ' + err.message);
      }
    }
  }

  function handleRun() {
    if (running && stopBartcode) {
      stopBartcode.stop();
    }
    clearAliases();
    const code = bartcodeGenerator.workspaceToCode(workspace);
    running = true;
    stopBartcode = runBartcode(code, (newOutput) => {
      consoleOutput = newOutput;
    }, (used, total) => {
      ramUsed = used;
      ramTotal = total;
    }, () => {
      running = false;
      stopBartcode = null;
    });
  }

  function handleStop() {
    if (stopBartcode) {
      stopBartcode.stop();
      stopBartcode = null;
    }
    running = false;
  }

  function setRenderer(newRenderer) {
    if (newRenderer === renderer) return;
    localStorage.setItem('bartcode_renderer', newRenderer);
    let state = Blockly.serialization.workspaces.save(workspace);
    clearAliases();
    workspace.dispose();
    renderer = newRenderer;
    workspace = Blockly.inject(blocklyDiv, {
      toolbox: toolboxXML,
      renderer: renderer,
      theme: Blockly.Theme.defineTheme('scratchTheme', {
        'base': Blockly.Themes.Classic,
        'startHats': true
      })
    });
    Blockly.serialization.workspaces.load(state, workspace);
  }

  function handleRendererChange(e) {
    setRenderer(e.target.value);
  }

  function handleSave() {
    fileOpen = false;
    let state = Blockly.serialization.workspaces.save(workspace);
    let json = JSON.stringify(state, null, 2);
    let blob = new Blob([json], { type: 'application/json' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = 'project.bcp';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleLoad(e) {
    fileOpen = false;
    let file = e.target.files[0];
    if (!file) return;
    let reader = new FileReader();
    reader.onload = (event) => {
      try {
        let state = JSON.parse(event.target.result);
        clearAliases();
        Blockly.serialization.workspaces.load(state, workspace);
      } catch (err) {
        alert('Failed to load project: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleKeydown(e) {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      prefsOpen = false;
      toolsOpen = false;
    }
  }

  function closeMenus(e) {
    if (fileOpen && !e.target.closest('.file-menu')) {
      fileOpen = false;
    }
    if (toolsOpen && !e.target.closest('.tools-menu') && !e.target.closest('.modal-overlay') && !e.target.closest('.modal')) {
      toolsOpen = false;
    }
  }

  function savePref(key, value) {
    try { localStorage.setItem(key, value); } catch (_) {}
  }

  function closePrefs() {
    prefsOpen = false;
    toolsOpen = false;
  }

  onMount(() => {
    initKeyboard();
    workspace = Blockly.inject(blocklyDiv, {
      toolbox: toolboxXML,
      renderer: renderer,
      theme: Blockly.Theme.defineTheme('scratchTheme', {
        'base': Blockly.Themes.Classic,
        'startHats': true
      })
    });
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('click', closeMenus);

    let params = new URLSearchParams(window.location.search);
    playermode = params.get('playermode') === 'true';
    projectFile = params.get('projectfile');

    if (playermode) {
      document.title = 'Bart+ Player';
    }

    clearAliases();

    if (projectFile) {
      loadProjectFromURL(projectFile);
    }
  });
</script>

<div class="app-root" class:player-mode={playermode}>
  <nav class="navbar">
    <div class="navbar-left">
      <div class="navbar-brand">Bart+</div>
      <div class="file-menu">
        <button class="file-btn" on:click={() => fileOpen = !fileOpen}>File</button>
        {#if fileOpen}
          <div class="file-dropdown">
            <button class="dropdown-item" on:click={handleSave}>Save</button>
            <button class="dropdown-item" on:click={() => { fileOpen = false; fileInput.click(); }}>Load</button>
          </div>
        {/if}
      </div>
      <div class="file-menu tools-menu">
        <button class="file-btn" on:click={() => toolsOpen = !toolsOpen}>Tools</button>
        {#if toolsOpen}
          <div class="file-dropdown">
            <button class="dropdown-item" on:click={() => { prefsOpen = true; toolsOpen = false; }}>Preferences</button>
          </div>
        {/if}
      </div>
    </div>
    <div class="navbar-center">
      <RamBar {ramUsed} {ramTotal} />
    </div>
    <div class="navbar-right">
      <button class="run-btn" on:click={handleRun}>Run code</button>
      <button class="stop-btn" on:click={handleStop} disabled={!running}>Stop code</button>
    </div>
  </nav>

  <input type="file" accept=".bcp" bind:this={fileInput} on:change={handleLoad} style="display: none">

  <div class="editor-container">
    <div bind:this={blocklyDiv} class="workspace"></div>
    <div class="console-area">
      <div class="console console-theme-{theme}">
        {consoleOutput}
      </div>
      {#if playermode}
        <div class="player-controls">
          <button on:click={handleRun}>Run code</button>
          <button class="stop-btn" on:click={handleStop} disabled={!running}>Stop code</button>
        </div>
      {/if}
    </div>
  </div>

  {#if prefsOpen}
    <div class="modal-overlay" on:click={closePrefs}></div>
    <div class="modal">
      <div class="modal-header">
        <span>Preferences</span>
        <button class="modal-close" on:click={closePrefs}>&times;</button>
      </div>
      <div class="modal-body">
        <label class="pref-row">
          <span class="pref-label">Renderer</span>
          <select class="pref-select" on:change={(e) => setRenderer(e.target.value)}>
            <option value="geras" selected={renderer === 'geras'}>Geras</option>
            <option value="thrasos" selected={renderer === 'thrasos'}>Thrasos</option>
            <option value="zelos" selected={renderer === 'zelos'}>Zelos</option>
          </select>
        </label>
        <label class="pref-row">
          <input type="checkbox" bind:checked={soundEnabled} on:change={() => savePref('bartcode_sound', soundEnabled)} />
          <span>Sound effects</span>
        </label>
        <label class="pref-row">
          <span class="pref-label">Console theme</span>
          <select class="pref-select" bind:value={theme} on:change={() => savePref('bartcode_theme', theme)}>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="amber">Amber</option>
          </select>
        </label>
      </div>
    </div>
  {/if}
</div>


