import { isKeyPressed, getLastKey, isAnyKeyPressed } from '../keyboard.js';
import { primitiveSpecs } from './specs.js';
import { addAlias, removeAlias, clearAliases } from '../tracking.js';

export function primPut(arg, context) {
  let textVal = evaluateExpression(arg, context);
  context.cursorX = context.cursorX || 0;
  context.cursorY = context.cursorY || 0;
  for (let i = 0; i < textVal.length; i++) {
    let char = textVal[i];
    if (context.cursorX < context.width && context.cursorY < context.height) {
      context.grid[context.cursorY][context.cursorX] = char;
      context.cursorX++;
    }
  }
}

export function primPutln(arg, context) {
  primPut(arg, context);
  context.cursorX = 0;
  context.cursorY++;
}

export function primClear(arg, context) {
  context.grid = Array.from({ length: context.height }, () => Array(context.width).fill(' '));
  context.cursorX = 0;
  context.cursorY = 0;
}

export function primWait(arg, context) {
  let seconds = parseFloat(evaluateExpression(arg, context)) || 0;
  return seconds * 1000; 
}

export function primIf(arg, context) {
  let condition = evaluateExpression(arg, context);
  context.controlStack = context.controlStack || [];
  context.controlStack.push({ type: 'IF', condition: condition === 'true' || condition === true, skip: !(condition === 'true' || condition === true), matched: condition === 'true' || condition === true });
}

export function primElseif(arg, context) {
  context.controlStack = context.controlStack || [];
  let top = context.controlStack[context.controlStack.length - 1];
  if (top && top.type === 'IF') {
    let condition = evaluateExpression(arg, context);
    let conditionResult = condition === 'true' || condition === true;
    // Skip if we already matched a condition or if this condition is false
    top.skip = top.matched || !conditionResult;
    if (conditionResult) {
      top.matched = true;
    }
  }
}

export function primElse(arg, context) {
  context.controlStack = context.controlStack || [];
  let top = context.controlStack[context.controlStack.length - 1];
  if (top && top.type === 'IF') {
    top.skip = top.matched; // Skip else if we already matched a condition
  }
}

export function primEndif(arg, context) {
  context.controlStack = context.controlStack || [];
  context.controlStack.pop();
}

export function primSwitch(arg, context) {
  let value = evaluateExpression(arg, context);
  context.controlStack = context.controlStack || [];
  context.controlStack.push({ type: 'SWITCH', value: value, matched: false });
}

export function primDefault(arg, context) {
  context.controlStack = context.controlStack || [];
  let top = context.controlStack[context.controlStack.length - 1];
  if (top && top.type === 'SWITCH') {
    top.skip = top.matched;
  }
}

export function primCase(arg, context) {
  let value = evaluateExpression(arg, context);
  context.controlStack = context.controlStack || [];
  let top = context.controlStack[context.controlStack.length - 1];
  if (top && top.type === 'SWITCH') {
    let conditionResult = value === top.value;
    let shouldSkip = top.matched || !conditionResult;
    top.skip = shouldSkip;
    if (conditionResult) {
      top.matched = true;
    }
  }
}

export function primEndswitch(arg, context) {
  context.controlStack = context.controlStack || [];
  context.controlStack.pop();
}

export function primRepeat(arg, context) {
  let inner = arg.trim();
  if (inner.startsWith('(') && inner.endsWith(')')) {
    inner = inner.substring(1, inner.length - 1);
  }
  let count = parseInt(evaluateExpression(inner, context), 10) || 0;

  if (count <= 0) {
    let depth = 1;
    while (context.pc < context.lines.length) {
      let l = context.lines[context.pc];
      if (l.startsWith('REPEAT') || l.startsWith('WHILE')) depth++;
      if (l.startsWith('ENDREPEAT') || l.startsWith('ENDWHILE')) {
        depth--;
        if (depth === 0) {
          context.pc++;
          break;
        }
      }
      context.pc++;
    }
  } else {
    context.controlStack.push({
      type: 'REPEAT',
      counter: count,
      startPc: context.pc
    });
  }
}

export function primEndRepeat(arg, context) {
  let top = context.controlStack[context.controlStack.length - 1];
  if (top && top.type === 'REPEAT') {
    top.counter--;
    if (top.counter > 0) {
      context.pc = top.startPc;
    } else {
      context.controlStack.pop();
    }
  }
}

export function primWaitUntil(arg, context) {
  let inner = arg.trim();
  if (inner.startsWith('(') && inner.endsWith(')')) {
    inner = inner.substring(1, inner.length - 1);
  }
  let condition = evaluateExpression(inner, context);
  let isTrue = condition === true || condition === 'true' || condition === '1';

  if (!isTrue) {
    context.pc--;
  }
}

export function primWhile(arg, context) {
  let inner = arg.trim();
  if (inner.startsWith('(') && inner.endsWith(')')) {
    inner = inner.substring(1, inner.length - 1);
  }
  let condition = evaluateExpression(inner, context);
  let isTrue = condition === true || condition === 'true' || condition === '1';

  if (!isTrue) {
    let depth = 1;
    while (context.pc < context.lines.length) {
      let l = context.lines[context.pc];
      if (l.startsWith('REPEAT') || l.startsWith('WHILE')) depth++;
      if (l.startsWith('ENDREPEAT') || l.startsWith('ENDWHILE')) {
        depth--;
        if (depth === 0) {
          context.pc++;
          break;
        }
      }
      context.pc++;
    }
  } else {
    context.controlStack.push({
      type: 'WHILE',
      startPc: context.pc,
      conditionExpr: inner
    });
  }
}

export function primEndWhile(arg, context) {
  let top = context.controlStack[context.controlStack.length - 1];
  if (top && top.type === 'WHILE') {
    let condition = evaluateExpression(top.conditionExpr, context);
    let isTrue = condition === true || condition === 'true' || condition === '1';
    if (isTrue) {
      context.pc = top.startPc;
    } else {
      context.controlStack.pop();
    }
  }
}

const MEM_SIZE = 512;

function getMemSize(value) {
  if (value == null) return 0;
  if (typeof value === 'string') {
    return Math.max(value.length, 1);
  }
  return 8;
}

function updateMem(addr, newValue, context) {
  let oldValue = context.memory[addr];
  let delta = getMemSize(newValue) - getMemSize(oldValue);

  if (context.ramUsed + delta > context.ramTotal) {
    context.ramError = 'RAM overflow at address ' + addr + ' (need ' + (context.ramUsed + delta) + ' bytes, only ' + context.ramTotal + ' available)';
    return;
  }

  context.ramUsed += delta;
  context.memory[addr] = newValue;
}

export function primFlushRam(arg, context) {
  context.memory = Array(MEM_SIZE).fill(null);
  context.ramUsed = 0;
}

export function primStore(arg, context) {
  let inner = arg.trim();
  if (inner.startsWith('(') && inner.endsWith(')')) {
    inner = inner.substring(1, inner.length - 1);
  }
  let parts = splitByCommaOutsideQuotes(inner);
  if (parts.length < 2) return;
  let addrExpr = parts[0].trim();
  let valueExpr = parts.slice(1).join(',').trim();
  let addr = parseInt(evaluateExpression(addrExpr, context), 10);
  if (isNaN(addr) || addr < 0 || addr >= MEM_SIZE) {
    context.ramError = 'invalid memory address: ' + addr;
    return;
  }
  let value = evaluateExpression(valueExpr, context);
  updateMem(addr, value, context);
}

function evaluateExpression(expr, context) {
  if (!expr) return '';
  expr = expr.trim();
  
  // Math operations
  const mathOps = ['ADD', 'SUB', 'MUL', 'DIV'];
  for (let op of mathOps) {
    if (expr.startsWith(op + '(') && expr.endsWith(')')) {
      let inner = expr.substring(op.length + 1, expr.length - 1);
      let splitIndex = findCommaSplitIndex(inner);
      let leftExpr = inner.substring(0, splitIndex).trim();
      let rightExpr = inner.substring(splitIndex + 1).trim();
      let left = parseFloat(evaluateExpression(leftExpr, context)) || 0;
      let right = parseFloat(evaluateExpression(rightExpr, context)) || 0;
      
      switch (op) {
        case 'ADD': return (left + right).toString();
        case 'SUB': return (left - right).toString();
        case 'MUL': return (left * right).toString();
        case 'DIV': return right !== 0 ? (left / right).toString() : '0';
      }
    }
  }
  
  // EQ comparison
  if (expr.startsWith('EQ(') && expr.endsWith(')')) {
    let inner = expr.substring(3, expr.length - 1);
    let splitIndex = findCommaSplitIndex(inner);
    let leftExpr = inner.substring(0, splitIndex).trim();
    let rightExpr = inner.substring(splitIndex + 1).trim();
    let left = evaluateExpression(leftExpr, context);
    let right = evaluateExpression(rightExpr, context);
    return (left === right).toString();
  }
  
  // Logical operators
  const logicalOps = ['AND', 'OR', 'NOR', 'XAND', 'XOR', 'XNOR'];
  for (let op of logicalOps) {
    if (expr.startsWith(op + '(') && expr.endsWith(')')) {
      let inner = expr.substring(op.length + 1, expr.length - 1);
      let splitIndex = findCommaSplitIndex(inner);
      let leftExpr = inner.substring(0, splitIndex).trim();
      let rightExpr = inner.substring(splitIndex + 1).trim();
      let left = evaluateExpression(leftExpr, context) === 'true' || evaluateExpression(leftExpr, context) === true;
      let right = evaluateExpression(rightExpr, context) === 'true' || evaluateExpression(rightExpr, context) === true;
      
      switch (op) {
        case 'AND': return (left && right).toString();
        case 'OR': return (left || right).toString();
        case 'NOR': return (!(left || right)).toString();
        case 'XAND': return (!(left && right)).toString();
        case 'XOR': return (left !== right).toString();
        case 'XNOR': return (left === right).toString();
      }
    }
  }
  
  // NOT operator
  if (expr.startsWith('NOT(') && expr.endsWith(')')) {
    let inner = expr.substring(4, expr.length - 1);
    let val = evaluateExpression(inner, context) === 'true' || evaluateExpression(inner, context) === true;
    return (!val).toString();
  }
  
  // LEN
  if (expr.startsWith('LEN(') && expr.endsWith(')')) {
    let inner = expr.substring(4, expr.length - 1);
    let str = evaluateExpression(inner.trim(), context);
    return str.length.toString();
  }

  // CHARAT
  if (expr.startsWith('CHARAT(') && expr.endsWith(')')) {
    let inner = expr.substring(7, expr.length - 1);
    let splitIndex = findCommaSplitIndex(inner);
    let strExpr = inner.substring(0, splitIndex).trim();
    let idxExpr = inner.substring(splitIndex + 1).trim();
    let str = evaluateExpression(strExpr, context);
    let idx = parseInt(evaluateExpression(idxExpr, context), 10);
    if (isNaN(idx) || idx < 0 || idx >= str.length) return '';
    return str[idx];
  }

  // SUBSTR
  if (expr.startsWith('SUBSTR(') && expr.endsWith(')')) {
    let inner = expr.substring(7, expr.length - 1);
    let parts = splitByCommaOutsideQuotes(inner);
    if (parts.length < 3) return '';
    let strExpr = parts[0].trim();
    let startExpr = parts[1].trim();
    let lenExpr = parts[2].trim();
    let str = evaluateExpression(strExpr, context);
    let start = parseInt(evaluateExpression(startExpr, context), 10);
    let len = parseInt(evaluateExpression(lenExpr, context), 10);
    if (isNaN(start) || start < 0) start = 0;
    if (isNaN(len) || len < 0) return '';
    if (start >= str.length || len === 0) return '';
    return str.substring(start, start + len);
  }

  if (expr.startsWith('JOIN(') && expr.endsWith(')')) {
    let inner = expr.substring(5, expr.length - 1);
    let splitIndex = findCommaSplitIndex(inner);
    let leftExpr = inner.substring(0, splitIndex).trim();
    let rightExpr = inner.substring(splitIndex + 1).trim();
    return evaluateExpression(leftExpr, context) + evaluateExpression(rightExpr, context);
  }

  // KEYPRESSED
  if (expr.startsWith('KEYPRESSED(') && expr.endsWith(')')) {
    let inner = expr.substring(11, expr.length - 1);
    let key = evaluateExpression(inner, context);
    return isKeyPressed(key) ? 'true' : 'false';
  }

  // LASTKEY
  if (expr === 'LASTKEY') {
    return getLastKey();
  }

  // ANYKEY
  if (expr === 'ANYKEY') {
    return isAnyKeyPressed() ? 'true' : 'false';
  }

  // CURRENTTIME
  if (expr.startsWith('CURRENTTIME(') && expr.endsWith(')')) {
    let inner = expr.substring(12, expr.length - 1);
    let unit = evaluateExpression(inner, context).replace(/"/g, '');
    let now = new Date();
    switch (unit) {
      case 'seconds': return now.getSeconds().toString();
      case 'minutes': return now.getMinutes().toString();
      case 'hours': return now.getHours().toString();
      case 'day': return now.getDate().toString();
      case 'month': return (now.getMonth() + 1).toString();
      case 'year': return now.getFullYear().toString();
      default: return now.toLocaleString();
    }
  }

  // TRACKCOL
  if (expr.startsWith('TRACKCOL(') && expr.endsWith(')')) {
    let inner = expr.substring(9, expr.length - 1);
    let alias = evaluateExpression(inner, context).replace(/"/g, '');
    if (context.tracking && context.tracking[alias]) {
      return context.tracking[alias].col.toString();
    }
    return '0';
  }

  // TRACKROW
  if (expr.startsWith('TRACKROW(') && expr.endsWith(')')) {
    let inner = expr.substring(9, expr.length - 1);
    let alias = evaluateExpression(inner, context).replace(/"/g, '');
    if (context.tracking && context.tracking[alias]) {
      return context.tracking[alias].row.toString();
    }
    return '0';
  }

  // LOAD
  if (expr.startsWith('LOAD(') && expr.endsWith(')')) {
    let inner = expr.substring(5, expr.length - 1);
    let addr = parseInt(evaluateExpression(inner.trim(), context), 10);
    if (isNaN(addr) || addr < 0 || addr >= MEM_SIZE) return '0';
    return context.memory[addr] || '0';
  }

  // CALL expression - synchronous function execution
  if (expr.startsWith('CALL(') && expr.endsWith(')')) {
    let inner = expr.substring(5, expr.length - 1);
    let name = evaluateExpression(inner.trim(), context);
    let funcDef = context.functions[name];
    if (!funcDef) return '';

    let savedPc = context.pc;
    let savedControlDepth = context.controlStack.length;
    let savedCallDepth = context.callStack.length;
    let returnValue = '';

    context.pc = funcDef.startLine + 1;

    while (context.pc >= 0 && context.pc < context.lines.length) {
      let line = context.lines[context.pc];
      context.pc++;

      let spaceIdx = line.indexOf(' ');
      let parenIdx = line.indexOf('(');
      let splitBy = spaceIdx;
      if (parenIdx !== -1 && (splitBy === -1 || parenIdx < splitBy)) {
        splitBy = parenIdx;
      }
      let kw = splitBy === -1 ? line : line.substring(0, splitBy);
      let a = splitBy === -1 ? '' : line.substring(splitBy);

      if (kw === 'RETURN') {
        returnValue = evaluateExpression(a.trim(), context);
        break;
      }

      if (kw === 'ENDFUNCTION') {
        break;
      }

      if (primitiveSpecs[kw]) {
        primitiveSpecs[kw](a, context);
      }
    }

    context.pc = savedPc;
    while (context.controlStack.length > savedControlDepth) {
      context.controlStack.pop();
    }
    while (context.callStack.length > savedCallDepth) {
      context.callStack.pop();
    }

    return returnValue;
  }

  // RAND
  if (expr.startsWith('RAND(') && expr.endsWith(')')) {
    let inner = expr.substring(5, expr.length - 1);
    let splitIndex = findCommaSplitIndex(inner);
    let fromExpr = inner.substring(0, splitIndex).trim();
    let toExpr = inner.substring(splitIndex + 1).trim();
    let from = parseFloat(evaluateExpression(fromExpr, context)) || 0;
    let to = parseFloat(evaluateExpression(toExpr, context)) || 1;
    let min = Math.min(from, to);
    let max = Math.max(from, to);
    return (Math.floor(Math.random() * (max - min + 1)) + min).toString();
  }

  // TO_NUMBER
  if (expr.startsWith('TO_NUMBER(') && expr.endsWith(')')) {
    let inner = expr.substring(10, expr.length - 1);
    let val = evaluateExpression(inner, context);
    return parseFloat(val).toString();
  }

  // TO_STRING
  if (expr.startsWith('TO_STRING(') && expr.endsWith(')')) {
    let inner = expr.substring(10, expr.length - 1);
    let val = evaluateExpression(inner, context);
    return String(val);
  }

  // TO_BOOLEAN
  if (expr.startsWith('TO_BOOLEAN(') && expr.endsWith(')')) {
    let inner = expr.substring(11, expr.length - 1);
    let val = evaluateExpression(inner, context);
    return (val === 'true' || val === true).toString();
  }

  if ((expr.startsWith('"') && expr.endsWith('"')) || 
      (expr.startsWith("'") && expr.endsWith("'"))) {
    return expr.slice(1, -1);
  }
  
  return expr;
}

export function primMove(arg, context) {
  let inner = arg.trim();
  if (inner.startsWith('(') && inner.endsWith(')')) {
    inner = inner.substring(1, inner.length - 1);
  }

  let parts = splitByCommaOutsideQuotes(inner);
  let fromCol = parseInt(evaluateExpression(parts[0], context), 10) || 0;
  let fromRow = parseInt(evaluateExpression(parts[1], context), 10) || 0;
  let toCol = parseInt(evaluateExpression(parts[2], context), 10) || 0;
  let toRow = parseInt(evaluateExpression(parts[3], context), 10) || 0;

  if (fromRow >= 0 && fromRow < context.height && fromCol >= 0 && fromCol < context.width &&
      toRow >= 0 && toRow < context.height && toCol >= 0 && toCol < context.width) {
    
    let charToMove = context.grid[fromRow][fromCol];

    context.grid[fromRow][fromCol] = ' ';
    context.grid[toRow][toCol] = charToMove;

    if (context.tracking) {
      for (let alias in context.tracking) {
        let t = context.tracking[alias];
        if (t.col === fromCol && t.row === fromRow) {
          t.col = toCol;
          t.row = toRow;
        }
      }
    }
  }
}

export function primFunction(arg, context) {
  let name = arg.trim();
  let funcDef = context.functions[name];
  if (funcDef) {
    context.pc = funcDef.endLine + 1;
  }
}

export function primCall(arg, context) {
  let name = arg.trim();
  let funcDef = context.functions[name];
  if (funcDef) {
    context.callStack.push(context.pc);
    context.pc = funcDef.startLine + 1;
  }
}

export function primEndFunction(arg, context) {
  if (context.callStack.length > 0) {
    context.pc = context.callStack.pop();
  }
}

export function primReturn(arg, context) {
  evaluateExpression(arg.trim(), context);
  if (context.callStack.length > 0) {
    context.pc = context.callStack.pop();
  }
}

export function primTrackStart(arg, context) {
  let inner = arg.trim();
  if (inner.startsWith('(') && inner.endsWith(')')) {
    inner = inner.substring(1, inner.length - 1);
  }
  let parts = splitByCommaOutsideQuotes(inner);
  if (parts.length < 3) return;
  let col = parseInt(evaluateExpression(parts[0].trim(), context), 10) || 0;
  let row = parseInt(evaluateExpression(parts[1].trim(), context), 10) || 0;
  let alias = evaluateExpression(parts[2].trim(), context);

  context.tracking = context.tracking || {};
  context.tracking[alias] = { col, row };
  addAlias(alias);
}

export function primTrackStopAll(arg, context) {
  context.tracking = {};
  clearAliases();
}

export function primTrackStop(arg, context) {
  let inner = arg.trim();
  if (inner.startsWith('(') && inner.endsWith(')')) {
    inner = inner.substring(1, inner.length - 1);
  }
  let alias = evaluateExpression(inner, context);
  if (context.tracking) {
    delete context.tracking[alias];
  }
  removeAlias(alias);
}

function splitByCommaOutsideQuotes(str) {
  let result = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';
  let parenDepth = 0;
  
  for (let i = 0; i < str.length; i++) {
    let char = str[i];
    if ((char === '"' || char === "'") && (i === 0 || str[i - 1] !== '\\')) {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuotes = false;
      }
    }
    
    if (!inQuotes) {
      if (char === '(') parenDepth++;
      if (char === ')') parenDepth--;
    }
    
    if (char === ',' && !inQuotes && parenDepth === 0) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function findCommaSplitIndex(str) {
  let inQuotes = false;
  let quoteChar = '';
  let parenDepth = 0;
  
  for (let i = 0; i < str.length; i++) {
    let char = str[i];
    if ((char === '"' || char === "'") && (i === 0 || str[i - 1] !== '\\')) {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuotes = false;
      }
    }
    if (!inQuotes) {
      if (char === '(') parenDepth++;
      if (char === ')') parenDepth--;
    }
    if (char === ',' && !inQuotes && parenDepth === 0) {
      return i;
    }
  }
  return str.length;
}