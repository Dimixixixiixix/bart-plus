import { primitiveSpecs } from './specs.js';

const RAM_TOTAL = 524288;

export function runBartcode(code, onOutputUpdate, onRamUpdate, onComplete) {
  if (!code || typeof code !== 'string') {
    onOutputUpdate('ready...\n');
    if (onComplete) onComplete();
    return { stop: () => {} };
  }

  let stopped = false;
  let lines = code.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Pre-scan for function definitions
  let functions = {};
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('FUNCTION ')) {
      let name = lines[i].substring(9).trim();
      let depth = 1;
      let endLine = -1;
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].startsWith('FUNCTION ')) depth++;
        if (lines[j] === 'ENDFUNCTION') {
          depth--;
          if (depth === 0) {
            endLine = j;
            break;
          }
        }
      }
      if (endLine !== -1) {
        functions[name] = { startLine: i, endLine: endLine };
      }
    }
  }
  
  const WIDTH = 60;
  const HEIGHT = 30;
  let grid = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(' '));

  const MEM_SIZE = 512;
  let memory = Array(MEM_SIZE).fill(null);
  let initialRam = 0;

  let context = {
    outputBuffer: '',
    grid: grid,
    width: WIDTH,
    height: HEIGHT,
    controlStack: [],
    callStack: [],
    functions: functions,
    pc: 0,
    lines: lines,
    memory: memory,
    ramUsed: initialRam,
    ramTotal: RAM_TOTAL,
    ramError: null
  };

  const CONTROL_KEYWORDS = ['IF', 'ELSEIF', 'ELSE', 'ENDIF', 'SWITCH', 'CASE', 'DEFAULT', 'ENDSWITCH', 'REPEAT', 'ENDREPEAT', 'WHILE', 'ENDWHILE'];

  function renderGrid() {
    return context.grid.map(row => row.join('')).join('\n');
  }

  function notifyRam() {
    if (onRamUpdate) onRamUpdate(context.ramUsed, context.ramTotal);
  }

  function step() {
    if (stopped) return;

    if (context.ramError) {
      onOutputUpdate('ERR: ' + context.ramError);
      if (onComplete) onComplete();
      return;
    }

    if (context.pc >= context.lines.length) {
      onOutputUpdate(renderGrid());
      if (onComplete) onComplete();
      return;
    }

    let line = context.lines[context.pc];
    context.pc++;

    let spaceIndex = line.indexOf(' ');
    let parenIndex = line.indexOf('(');
    let splitIndex = spaceIndex;
    if (parenIndex !== -1 && (spaceIndex === -1 || parenIndex < spaceIndex)) {
      splitIndex = parenIndex;
    }

    let keyword = splitIndex === -1 ? line : line.substring(0, splitIndex);
    let arg = splitIndex === -1 ? '' : line.substring(splitIndex);

    let top = context.controlStack[context.controlStack.length - 1];
    let shouldSkip = top && top.skip;
    let isControlFlow = CONTROL_KEYWORDS.includes(keyword);

    if (primitiveSpecs[keyword]) {
      if (!shouldSkip || isControlFlow) {
        let result = primitiveSpecs[keyword](arg, context);

        if (typeof result === 'number' && result > 0) {
          onOutputUpdate(renderGrid());
          notifyRam();
          setTimeout(step, result);
          return;
        }
      }
    }

    onOutputUpdate(renderGrid());
    notifyRam();
    setTimeout(step, 0);
  }

  setTimeout(step, 0);

  return { stop: () => { stopped = true; if (onComplete) onComplete(); } };
}