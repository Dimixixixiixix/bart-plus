import * as Blockly from 'blockly';
import './bartcode_blocks.js';

export const bartcodeGenerator = new Blockly.CodeGenerator('Bartcode');

bartcodeGenerator.ORDER_ATOMIC = 0;
bartcodeGenerator.ORDER_NONE = 99;

/* EVENTS */

bartcodeGenerator.forBlock['bart_on_run'] = function(block, generator) {
  return '';
};

/* COMMANDS */

bartcodeGenerator.forBlock['bart_put'] = function(block, generator) {
  let textCode = generator.valueToCode(block, 'TEXT', generator.ORDER_NONE) || '""';
  let mode = block.getFieldValue('MODE');
  if (mode === 'NEWLINE') {
    return 'PRINTLN ' + textCode + '\n';
  }
  return 'PRINT ' + textCode + '\n';
};

bartcodeGenerator.forBlock['bart_comment'] = function(block, generator) {
  return '';
};

bartcodeGenerator.forBlock['bart_clear'] = function(block, generator) {
  return 'CLEAR\n';
};

bartcodeGenerator.forBlock['bart_wait'] = function(block, generator) {
  let timeVal = generator.valueToCode(block, 'SECONDS', generator.ORDER_NONE) || '1';
  return 'WAIT ' + timeVal + '\n';
};

bartcodeGenerator.forBlock['bart_move'] = function(block, generator) {
  let fromCol = generator.valueToCode(block, 'FROM_COL', generator.ORDER_NONE) || '0';
  let fromRow = generator.valueToCode(block, 'FROM_ROW', generator.ORDER_NONE) || '0';
  let toCol = generator.valueToCode(block, 'TO_COL', generator.ORDER_NONE) || '0';
  let toRow = generator.valueToCode(block, 'TO_ROW', generator.ORDER_NONE) || '0';

  return 'MOVE(' + fromCol + ', ' + fromRow + ', ' + toCol + ', ' + toRow + ')\n';
};

bartcodeGenerator.forBlock['bart_if_else'] = function(block, generator) {
  let condition = generator.valueToCode(block, 'CONDITION', generator.ORDER_NONE) || 'true';
  let doCode = generator.statementToCode(block, 'DO') || '';
  let elseifCount = block.elseifCount_ || 0;

  let code = 'IF ' + condition + '\n' + doCode;

  for (let i = 1; i <= elseifCount; i++) {
    let elseifCondition = generator.valueToCode(block, 'ELSEIF' + i, generator.ORDER_NONE) || 'true';
    let elseifDo = generator.statementToCode(block, 'DO' + i) || '';
    code += 'ELSEIF ' + elseifCondition + '\n' + elseifDo;
  }

  if (block.hasElse_) {
    let elseCode = generator.statementToCode(block, 'ELSE') || '';
    code += 'ELSE\n' + elseCode;
  }

  code += 'ENDIF\n';
  return code;
};

bartcodeGenerator.forBlock['bart_switch_case'] = function(block, generator) {
  let value = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE) || '0';
  let caseCount = block.caseCount_ || 0;
  let hasDefault = block.hasDefault_;

  let code = 'SWITCH ' + value + '\n';

  for (let i = 1; i <= caseCount; i++) {
    let caseValue = generator.valueToCode(block, 'CASE' + i, generator.ORDER_NONE) || '0';
    let caseDo = generator.statementToCode(block, 'DO' + i) || '';
    code += 'CASE ' + caseValue + '\n' + caseDo;
  }

  if (hasDefault) {
    let defaultCode = generator.statementToCode(block, 'DEFAULT') || '';
    code += 'DEFAULT\n' + defaultCode;
  }

  code += 'ENDSWITCH\n';
  return code;
};

bartcodeGenerator.forBlock['bart_case'] = function(block, generator) {
  let value = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE) || '0';
  let doCode = generator.statementToCode(block, 'DO') || '';
  return 'CASE ' + value + '\n' + doCode;
};

bartcodeGenerator.forBlock['bart_wait_until'] = function(block, generator) {
  let condition = generator.valueToCode(block, 'CONDITION', generator.ORDER_ATOMIC) || 'false';
  return 'WAITUNTIL (' + condition + ')\n';
};

bartcodeGenerator.forBlock['bart_repeat'] = function(block, generator) {
  var value_times = generator.valueToCode(block, 'TIMES', generator.ORDER_ATOMIC) || '0';
  var statements_do = generator.statementToCode(block, 'DO');

  return `REPEAT (${value_times})\n${statements_do}ENDREPEAT\n`;
};

bartcodeGenerator.forBlock['bart_while'] = function(block, generator) {
  var value_condition = generator.valueToCode(block, 'CONDITION', generator.ORDER_ATOMIC) || 'false';
  var statements_do = generator.statementToCode(block, 'DO');

  return `WHILE (${value_condition})\n${statements_do}ENDWHILE\n`;
};

/* ARGUMENTS */

bartcodeGenerator.forBlock['bart_string'] = function(block, generator) {
  let textValue = block.getFieldValue('VALUE');
  return ['"' + textValue + '"', bartcodeGenerator.ORDER_ATOMIC];
};

bartcodeGenerator.forBlock['bart_number'] = function(block, generator) {
  let numValue = block.getFieldValue('VALUE');
  return [numValue, bartcodeGenerator.ORDER_ATOMIC];
};

bartcodeGenerator.forBlock['bart_add'] = function(block, generator) {
  let a = generator.valueToCode(block, 'A', generator.ORDER_NONE) || '0';
  let b = generator.valueToCode(block, 'B', generator.ORDER_NONE) || '0';
  return ['ADD(' + a + ', ' + b + ')', bartcodeGenerator.ORDER_ATOMIC];
};

bartcodeGenerator.forBlock['bart_subtract'] = function(block, generator) {
  let a = generator.valueToCode(block, 'A', generator.ORDER_NONE) || '0';
  let b = generator.valueToCode(block, 'B', generator.ORDER_NONE) || '0';
  return ['SUB(' + a + ', ' + b + ')', bartcodeGenerator.ORDER_ATOMIC];
};

bartcodeGenerator.forBlock['bart_multiply'] = function(block, generator) {
  let a = generator.valueToCode(block, 'A', generator.ORDER_NONE) || '0';
  let b = generator.valueToCode(block, 'B', generator.ORDER_NONE) || '0';
  return ['MUL(' + a + ', ' + b + ')', bartcodeGenerator.ORDER_ATOMIC];
};

bartcodeGenerator.forBlock['bart_divide'] = function(block, generator) {
  let a = generator.valueToCode(block, 'A', generator.ORDER_NONE) || '0';
  let b = generator.valueToCode(block, 'B', generator.ORDER_NONE) || '1';
  return ['DIV(' + a + ', ' + b + ')', bartcodeGenerator.ORDER_ATOMIC];
};

bartcodeGenerator.forBlock['bart_rand'] = function(block, generator) {
  let from = generator.valueToCode(block, 'FROM', generator.ORDER_NONE) || '0';
  let to = generator.valueToCode(block, 'TO', generator.ORDER_NONE) || '1';
  return ['RAND(' + from + ', ' + to + ')', bartcodeGenerator.ORDER_ATOMIC];
};

bartcodeGenerator.forBlock['bart_to_number'] = function(block, generator) {
  let value = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE) || '0';
  return ['TO_NUMBER(' + value + ')', bartcodeGenerator.ORDER_ATOMIC];
};

bartcodeGenerator.forBlock['bart_to_string'] = function(block, generator) {
  let value = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE) || '""';
  return ['TO_STRING(' + value + ')', bartcodeGenerator.ORDER_ATOMIC];
};

bartcodeGenerator.forBlock['bart_to_boolean'] = function(block, generator) {
  let value = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE) || 'true';
  return ['TO_BOOLEAN(' + value + ')', bartcodeGenerator.ORDER_ATOMIC];
};

bartcodeGenerator.forBlock['bart_len'] = function(block, generator) {
  let str = generator.valueToCode(block, 'STR', generator.ORDER_NONE) || '""';
  return ['LEN(' + str + ')', bartcodeGenerator.ORDER_ATOMIC];
};

bartcodeGenerator.forBlock['bart_char_at'] = function(block, generator) {
  let str = generator.valueToCode(block, 'STR', generator.ORDER_NONE) || '""';
  let idx = generator.valueToCode(block, 'INDEX', generator.ORDER_NONE) || '0';
  return ['CHARAT(' + str + ', ' + idx + ')', bartcodeGenerator.ORDER_ATOMIC];
};

bartcodeGenerator.forBlock['bart_substr'] = function(block, generator) {
  let str = generator.valueToCode(block, 'STR', generator.ORDER_NONE) || '""';
  let start = generator.valueToCode(block, 'START', generator.ORDER_NONE) || '0';
  let len = generator.valueToCode(block, 'LEN', generator.ORDER_NONE) || '0';
  return ['SUBSTR(' + str + ', ' + start + ', ' + len + ')', bartcodeGenerator.ORDER_ATOMIC];
};

bartcodeGenerator.forBlock['bart_join'] = function(block, generator) {
  let str1 = generator.valueToCode(block, 'STR1', generator.ORDER_NONE) || '""';
  let str2 = generator.valueToCode(block, 'STR2', generator.ORDER_NONE) || '""';
  return ['JOIN(' + str1 + ', ' + str2 + ')', bartcodeGenerator.ORDER_ATOMIC];
};

bartcodeGenerator.forBlock['bart_logic_op'] = function(block, generator) {
  let a = generator.valueToCode(block, 'A', generator.ORDER_NONE) || 'true';
  let op = block.getFieldValue('OP');
  let b = generator.valueToCode(block, 'B', generator.ORDER_NONE) || 'true';
  return [op + '(' + a + ', ' + b + ')', bartcodeGenerator.ORDER_ATOMIC];
};

bartcodeGenerator.forBlock['bart_not'] = function(block, generator) {
  let value = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE) || 'true';
  return ['NOT(' + value + ')', bartcodeGenerator.ORDER_ATOMIC];
};

bartcodeGenerator.forBlock['bart_equals'] = function(block, generator) {
  let a = generator.valueToCode(block, 'A', generator.ORDER_NONE) || '0';
  let b = generator.valueToCode(block, 'B', generator.ORDER_NONE) || '0';
  return ['EQ(' + a + ', ' + b + ')', bartcodeGenerator.ORDER_ATOMIC];
};

bartcodeGenerator.forBlock['bart_key_pressed'] = function(block, generator) {
  let key = block.getFieldValue('KEY');
  return ['KEYPRESSED("' + key + '")', bartcodeGenerator.ORDER_ATOMIC];
};

bartcodeGenerator.forBlock['bart_last_key'] = function(block, generator) {
  return ['LASTKEY', bartcodeGenerator.ORDER_ATOMIC];
};

bartcodeGenerator.forBlock['bart_any_key'] = function(block, generator) {
  return ['ANYKEY', bartcodeGenerator.ORDER_ATOMIC];
};

bartcodeGenerator.forBlock['bart_current_time'] = function(block, generator) {
  let unit = block.getFieldValue('UNIT');
  return ['CURRENTTIME("' + unit + '")', bartcodeGenerator.ORDER_ATOMIC];
};

bartcodeGenerator.forBlock['bart_track_start'] = function(block, generator) {
  let col = generator.valueToCode(block, 'COL', bartcodeGenerator.ORDER_NONE) || '0';
  let row = generator.valueToCode(block, 'ROW', bartcodeGenerator.ORDER_NONE) || '0';
  let alias = block.getFieldValue('ALIAS');
  return 'TRACKSTART(' + col + ', ' + row + ', "' + alias + '")\n';
};

bartcodeGenerator.forBlock['bart_track_stop_all'] = function(block, generator) {
  return 'TRACKSTOPALL\n';
};

bartcodeGenerator.forBlock['bart_track_stop'] = function(block, generator) {
  let alias = block.getFieldValue('ALIAS');
  return 'TRACKSTOP("' + alias + '")\n';
};

bartcodeGenerator.forBlock['bart_track_col'] = function(block, generator) {
  let alias = block.getFieldValue('ALIAS');
  return ['TRACKCOL("' + alias + '")', bartcodeGenerator.ORDER_ATOMIC];
};

bartcodeGenerator.forBlock['bart_track_row'] = function(block, generator) {
  let alias = block.getFieldValue('ALIAS');
  return ['TRACKROW("' + alias + '")', bartcodeGenerator.ORDER_ATOMIC];
};

bartcodeGenerator.forBlock['bart_true'] = function(block, generator) {
  return ['true', bartcodeGenerator.ORDER_ATOMIC];
};

bartcodeGenerator.forBlock['bart_false'] = function(block, generator) {
  return ['false', bartcodeGenerator.ORDER_ATOMIC];
};

bartcodeGenerator.forBlock['bart_flush_ram'] = function(block, generator) {
  return 'FLUSHRAM\n';
};

bartcodeGenerator.forBlock['bart_store'] = function(block, generator) {
  let addr = generator.valueToCode(block, 'ADDR', generator.ORDER_ATOMIC) || '0';
  let value = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE) || '0';
  return 'STORE(' + addr + ', ' + value + ')\n';
};

bartcodeGenerator.forBlock['bart_load'] = function(block, generator) {
  let addr = generator.valueToCode(block, 'ADDR', generator.ORDER_ATOMIC) || '0';
  return ['LOAD(' + addr + ')', bartcodeGenerator.ORDER_ATOMIC];
};

/* FUNCTIONS */
bartcodeGenerator.forBlock['bart_function'] = function(block, generator) {
  let name = block.getFieldValue('NAME');
  let bodyCode = generator.statementToCode(block, 'BODY') || '';
  return 'FUNCTION ' + name + '\n' + bodyCode + 'ENDFUNCTION\n';
};

bartcodeGenerator.forBlock['bart_call_function'] = function(block, generator) {
  let name = block.getFieldValue('NAME');
  return 'CALL ' + name + '\n';
};

bartcodeGenerator.forBlock['bart_call_boolean'] = function(block, generator) {
  let name = block.getFieldValue('NAME');
  return ['CALL(' + name + ')', bartcodeGenerator.ORDER_ATOMIC];
};

bartcodeGenerator.forBlock['bart_call_value'] = function(block, generator) {
  let name = block.getFieldValue('NAME');
  return ['CALL(' + name + ')', bartcodeGenerator.ORDER_ATOMIC];
};

bartcodeGenerator.forBlock['bart_return'] = function(block, generator) {
  let value = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE) || '';
  return 'RETURN' + (value ? ' ' + value : '') + '\n';
};

bartcodeGenerator.scrub_ = function(block, code, thisOnly) {
  let nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  let nextCode = '';
  if (nextBlock) {
    if (!thisOnly) {
      nextCode = bartcodeGenerator.blockToCode(nextBlock);
    }
  }
  return code + nextCode;
};

const TOP_LEVEL_ROOT_TYPES = ['bart_on_run', 'bart_function'];

bartcodeGenerator.workspaceToCode = function(workspace) {
  if (!workspace) {
    console.warn('No workspace specified in workspaceToCode call.');
    workspace = Blockly.getMainWorkspace();
  }

  const codeLines = [];
  this.init(workspace);

  const topBlocks = workspace.getTopBlocks(true);
  for (let i = 0; i < topBlocks.length; i++) {
    const block = topBlocks[i];

    if (!TOP_LEVEL_ROOT_TYPES.includes(block.type)) {
      continue;
    }

    if (typeof block.isEnabled === 'function' && !block.isEnabled()) {
      continue;
    }

    let line = this.blockToCode(block);
    if (Array.isArray(line)) {
      line = line[0];
    }
    if (line) {
      codeLines.push(line);
    }
  }

  let code = codeLines.join('\n');
  code = this.finish(code);

  code = code.replace(/^\s+\n/, '');
  code = code.replace(/\n\s+$/, '\n');
  code = code.replace(/[ \t]+\n/g, '\n');

  return code;
};