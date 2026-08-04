import * as Blockly from 'blockly';
import { getAliases } from '../tracking.js'; 

/* CAPS */

Blockly.Blocks['bart_on_run'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('when code run');
    this.setPreviousStatement(false, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip('Runs the attached blocks when the run button is clicked. Blocks not connected to this event will not run.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
    this.hat = 'cap';
  }
};

// put
Blockly.Blocks['bart_put'] = {
  init: function() {
    this.appendValueInput('TEXT')
        .setCheck('String')
        .appendField('put');
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['\\n', 'NEWLINE'],
          ['-', 'NO_NEWLINE']
        ]), 'MODE');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip('Prints text to the screen.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

// clear
Blockly.Blocks['bart_clear'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('clear console');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip('Clears the screen.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

// move cursor
Blockly.Blocks['bart_move'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('move c:');
    this.appendValueInput('FROM_COL')
        .setCheck('Number');
    this.appendDummyInput()
        .appendField('r:');
    this.appendValueInput('FROM_ROW')
        .setCheck('Number');
    this.appendDummyInput()
        .appendField('to c:');
    this.appendValueInput('TO_COL')
        .setCheck('Number');
    this.appendDummyInput()
        .appendField('r:');
    this.appendValueInput('TO_ROW')
        .setCheck('Number');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip('Moves cursor from one position to another.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

/* CONTROL */

// wait [n] secs
Blockly.Blocks['bart_wait'] = {
  init: function() {
    this.appendValueInput('SECONDS')
        .setCheck('Number')
        .appendField('wait');
    this.appendDummyInput()
        .appendField('secs');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip('Pauses execution for a specified number of seconds.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

// repeat times
Blockly.Blocks['bart_repeat'] = {
  init: function() {
    this.appendValueInput('TIMES')
        .setCheck('Number')
        .appendField('repeat');
    this.appendStatementInput('DO')
        .appendField('times');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip('Repeats the contained blocks a specified number of times.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

// wait until
Blockly.Blocks['bart_wait_until'] = {
  init: function() {
    this.appendValueInput('CONDITION')
        .setCheck('Boolean')
        .appendField('wait until');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip('Waits until the condition is true.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

// while do
Blockly.Blocks['bart_while'] = {
  init: function() {
    this.appendValueInput('CONDITION')
        .setCheck('Boolean')
        .appendField('while');
    this.appendStatementInput('DO')
        .appendField('do');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip('Repeats the contained blocks while the condition is true.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

// if/else - mutator based
Blockly.Blocks['bart_if_else'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('if');
    this.appendValueInput('CONDITION')
        .setCheck('Boolean');
    this.appendStatementInput('DO')
        .appendField('do');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip('If/else conditional statement. Use mutator to add elseif/else clauses.');
    this.setHelpUrl('');
    this.elseifCount_ = 0;
    this.hasElse_ = false;
    this.setMutator(new Blockly.icons.MutatorIcon(['bart_if_elseif_clause', 'bart_if_else_clause'], this));
  },
  mutationToDom: function() {
    let container = document.createElement('mutation');
    container.setAttribute('elseif_count', this.elseifCount_);
    container.setAttribute('has_else', this.hasElse_ ? 'true' : 'false');
    return container;
  },
  domToMutation: function(xmlElement) {
    this.elseifCount_ = parseInt(xmlElement.getAttribute('elseif_count'), 10) || 0;
    this.hasElse_ = xmlElement.getAttribute('has_else') === 'true';
    this.updateShape();
  },
  decompose: function(workspace) {
    let containerBlock = workspace.newBlock('bart_if_container');
    containerBlock.initSvg();

    let connection = containerBlock.getInput('STACK').connection;

    for (let i = 1; i <= this.elseifCount_; i++) {
      let elseifBlock = workspace.newBlock('bart_if_elseif_clause');
      elseifBlock.initSvg();
      connection.connect(elseifBlock.previousConnection);
      connection = elseifBlock.nextConnection;
    }

    if (this.hasElse_) {
      let elseBlock = workspace.newBlock('bart_if_else_clause');
      elseBlock.initSvg();
      connection.connect(elseBlock.previousConnection);
    }

    return containerBlock;
  },
  compose: function(containerBlock) {
    let clauseBlock = containerBlock.getInputTargetBlock('STACK');

    let count = 0;
    let hasElse = false;

    while (clauseBlock) {
      if (clauseBlock.type === 'bart_if_elseif_clause') {
        count++;
      } else if (clauseBlock.type === 'bart_if_else_clause') {
        hasElse = true;
      }
      clauseBlock = clauseBlock.nextConnection && clauseBlock.nextConnection.targetBlock();
    }

    this.elseifCount_ = count;
    this.hasElse_ = hasElse;
    this.updateShape();
  },
  updateShape: function() {
    for (let i = 1; i <= Math.max(this.elseifCount_, 10); i++) {
      if (this.getInput('ELSEIF' + i)) {
        this.removeInput('ELSEIF' + i);
      }
      if (this.getInput('DO' + i)) {
        this.removeInput('DO' + i);
      }
    }

    for (let i = 1; i <= this.elseifCount_; i++) {
      this.appendValueInput('ELSEIF' + i)
          .setCheck('Boolean')
          .appendField('elseif');
      this.appendStatementInput('DO' + i)
          .appendField('do');
    }

    if (this.hasElse_) {
      if (!this.getInput('ELSE')) {
        this.appendStatementInput('ELSE')
            .appendField('else');
      }
    } else {
      if (this.getInput('ELSE')) {
        this.removeInput('ELSE');
      }
    }
      this.setCommentText('My comment');
  }

};

// Mutator container for if/else
Blockly.Blocks['bart_if_container'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('if container');
    this.appendStatementInput('STACK');
    this.setColour(120);
    this.setTooltip('');
    this.setHelpUrl('');
    this.contextMenu = false;
  this.setCommentText('My comment');
  }
};

Blockly.Blocks['bart_if_elseif_clause'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('else if');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip('');
    this.setHelpUrl('');
    this.contextMenu = false;
    this.setCommentText('My comment');
  }
};

Blockly.Blocks['bart_if_else_clause'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('else');
    this.setPreviousStatement(true, null);
    this.setNextStatement(false, null);
    this.setColour(120);
    this.setTooltip('');
    this.setHelpUrl('');
    this.contextMenu = false;
    this.setCommentText('My comment');
  }
};

// switch/case - mutator based
Blockly.Blocks['bart_switch_case'] = {
  init: function() {
    this.appendValueInput('VALUE')
        .appendField('switch');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip('Switch/case statement. Use mutator to add case clauses.');
    this.setHelpUrl('');
    this.caseCount_ = 0;
    this.hasDefault_ = false;
    this.setMutator(new Blockly.icons.MutatorIcon(['bart_switch_case_clause', 'bart_switch_default_clause'], this));
  },
  mutationToDom: function() {
    let container = document.createElement('mutation');
    container.setAttribute('case_count', this.caseCount_);
    container.setAttribute('has_default', this.hasDefault_ ? 'true' : 'false');
    return container;
  },
  domToMutation: function(xmlElement) {
    this.caseCount_ = parseInt(xmlElement.getAttribute('case_count'), 10) || 0;
    this.hasDefault_ = xmlElement.getAttribute('has_default') === 'true';
    this.updateShape();
  },
  decompose: function(workspace) {
    let containerBlock = workspace.newBlock('bart_switch_container');
    containerBlock.initSvg();

    let connection = containerBlock.getInput('STACK').connection;

    for (let i = 1; i <= this.caseCount_; i++) {
      let caseBlock = workspace.newBlock('bart_switch_case_clause');
      caseBlock.initSvg();
      connection.connect(caseBlock.previousConnection);
      connection = caseBlock.nextConnection;
    }

    if (this.hasDefault_) {
      let defaultBlock = workspace.newBlock('bart_switch_default_clause');
      defaultBlock.initSvg();
      connection.connect(defaultBlock.previousConnection);
    }

    return containerBlock;
  },
  compose: function(containerBlock) {
    let clauseBlock = containerBlock.getInputTargetBlock('STACK');

    let count = 0;
    let hasDefault = false;

    while (clauseBlock) {
      if (clauseBlock.type === 'bart_switch_case_clause') {
        count++;
      } else if (clauseBlock.type === 'bart_switch_default_clause') {
        hasDefault = true;
      }
      clauseBlock = clauseBlock.nextConnection && clauseBlock.nextConnection.targetBlock();
    }

    this.caseCount_ = count;
    this.hasDefault_ = hasDefault;
    this.updateShape();
  },
  updateShape: function() {
    for (let i = 1; i <= Math.max(this.caseCount_, 10); i++) {
      if (this.getInput('CASE' + i)) {
        this.removeInput('CASE' + i);
      }
      if (this.getInput('DO' + i)) {
        this.removeInput('DO' + i);
      }
    }

    for (let i = 1; i <= this.caseCount_; i++) {
      this.appendValueInput('CASE' + i)
          .appendField('case');
      this.appendStatementInput('DO' + i)
          .appendField('do');
    }

    if (this.hasDefault_) {
      if (!this.getInput('DEFAULT')) {
        this.appendStatementInput('DEFAULT')
            .appendField('default');
      }
    } else {
      if (this.getInput('DEFAULT')) {
        this.removeInput('DEFAULT');
      }
    }
    this.setCommentText('My comment');
  }
};

// Mutator container for switch/case
Blockly.Blocks['bart_switch_container'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('switch container');
    this.appendStatementInput('STACK');
    this.setColour(120);
    this.setTooltip('');
    this.setHelpUrl('');
    this.contextMenu = false;
    this.setCommentText('My comment');
  }
};

Blockly.Blocks['bart_switch_case_clause'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('case');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip('');
    this.setHelpUrl('');
    this.contextMenu = false;
    this.setCommentText('My comment');
  }
};

Blockly.Blocks['bart_switch_default_clause'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('default');
    this.setPreviousStatement(true, null);
    this.setNextStatement(false, null);
    this.setColour(120);
    this.setTooltip('');
    this.setHelpUrl('');
    this.contextMenu = false;
    this.setCommentText('My comment');
  }
};

// case block for use inside switch body
Blockly.Blocks['bart_case'] = {
  init: function() {
    this.appendValueInput('VALUE')
        .appendField('case');
    this.appendStatementInput('DO')
        .appendField('do');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip('A case clause for a switch statement.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};


/* ARGUMENTS */

/* STRINGS */

// string
Blockly.Blocks['bart_string'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('"')
        .appendField(new Blockly.FieldTextInput('Hello World'), 'VALUE')
        .appendField('"');
    this.setOutput(true, 'String');
    this.setColour(160);
    this.setTooltip('A literal string.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

// length of string
Blockly.Blocks['bart_len'] = {
  init: function() {
    this.appendValueInput('STR')
        .setCheck('String')
        .appendField('length');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.setColour(160);
    this.setTooltip('Returns the length of a string.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

// char at
Blockly.Blocks['bart_char_at'] = {
  init: function() {
    this.appendValueInput('STR')
        .setCheck('String')
        .appendField('char at');
    this.appendValueInput('INDEX')
        .setCheck('Number')
        .appendField('index');
    this.setInputsInline(true);
    this.setOutput(true, 'String');
    this.setColour(160);
    this.setTooltip('Gets the character at the given index in a string (0-based).');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

// substring
Blockly.Blocks['bart_substr'] = {
  init: function() {
    this.appendValueInput('STR')
        .setCheck('String')
        .appendField('substr');
    this.appendValueInput('START')
        .setCheck('Number')
        .appendField('start');
    this.appendValueInput('LEN')
        .setCheck('Number')
        .appendField('len');
    this.setInputsInline(true);
    this.setOutput(true, 'String');
    this.setColour(160);
    this.setTooltip('Extracts a substring from start with given length.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

// join [str] [str]
Blockly.Blocks['bart_join'] = {
  init: function() {
    this.appendValueInput('STR1')
        .setCheck('String')
        .appendField('join');
    this.appendValueInput('STR2')
        .setCheck('String');
    this.setInputsInline(true);
    this.setOutput(true, 'String');
    this.setColour(160);
    this.setTooltip('Joins two strings together.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

/* TYPE CONVERSIONS */

// to number
Blockly.Blocks['bart_to_number'] = {
  init: function() {
    this.appendValueInput('VALUE')
        .appendField('to number');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.setColour(160);
    this.setTooltip('Converts a value to a number.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

// to string
Blockly.Blocks['bart_to_string'] = {
  init: function() {
    this.appendValueInput('VALUE')
        .appendField('to string');
    this.setInputsInline(true);
    this.setOutput(true, 'String');
    this.setColour(160);
    this.setTooltip('Converts a value to a string.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

// to boolean
Blockly.Blocks['bart_to_boolean'] = {
  init: function() {
    this.appendValueInput('VALUE')
        .appendField('to boolean');
    this.setInputsInline(true);
    this.setOutput(true, 'Boolean');
    this.setColour(160);
    this.setTooltip('Converts a value to a boolean.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

/* NUMBERS */

// number
Blockly.Blocks['bart_number'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('1', Blockly.FieldTextInput.numberValidator), 'VALUE');
    this.setOutput(true, 'Number');
    this.setColour(230);
    this.setTooltip('A literal number.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

// add
Blockly.Blocks['bart_add'] = {
  init: function() {
    this.appendValueInput('A')
        .setCheck('Number');
    this.appendDummyInput()
        .appendField('+');
    this.appendValueInput('B')
        .setCheck('Number');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.setColour(230);
    this.setTooltip('Adds two numbers together.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

// subtract
Blockly.Blocks['bart_subtract'] = {
  init: function() {
    this.appendValueInput('A')
        .setCheck('Number');
    this.appendDummyInput()
        .appendField('-');
    this.appendValueInput('B')
        .setCheck('Number');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.setColour(230);
    this.setTooltip('Subtracts two numbers.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

// multiply
Blockly.Blocks['bart_multiply'] = {
  init: function() {
    this.appendValueInput('A')
        .setCheck('Number');
    this.appendDummyInput()
        .appendField('*');
    this.appendValueInput('B')
        .setCheck('Number');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.setColour(230);
    this.setTooltip('Multiplies two numbers.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

// divide
Blockly.Blocks['bart_divide'] = {
  init: function() {
    this.appendValueInput('A')
        .setCheck('Number');
    this.appendDummyInput()
        .appendField('/');
    this.appendValueInput('B')
        .setCheck('Number');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.setColour(230);
    this.setTooltip('Divides two numbers.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

// rand
Blockly.Blocks['bart_rand'] = {
  init: function() {
    this.appendValueInput('FROM')
        .setCheck('Number')
        .appendField('rand');
    this.appendValueInput('TO')
        .setCheck('Number')
        .appendField('to');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.setColour(230);
    this.setTooltip('Returns a random number between from and to.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

/* LOGIC */

// logical operators dropdown
Blockly.Blocks['bart_logic_op'] = {
  init: function() {
    this.appendValueInput('A')
        .setCheck('Boolean');
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['AND', 'AND'],
          ['OR', 'OR'],
          ['NOR', 'NOR'],
          ['XAND', 'XAND'],
          ['XOR', 'XOR'],
          ['XNOR', 'XNOR']
        ]), 'OP');
    this.appendValueInput('B')
        .setCheck('Boolean');
    this.setInputsInline(true);
    this.setOutput(true, 'Boolean');
    this.setColour(210);
    this.setTooltip('Logical operation between two boolean values.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

// NOT
Blockly.Blocks['bart_not'] = {
  init: function() {
    this.appendValueInput('VALUE')
        .setCheck('Boolean')
        .appendField('NOT');
    this.setInputsInline(true);
    this.setOutput(true, 'Boolean');
    this.setColour(210);
    this.setTooltip('Logical NOT operation.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

// equals
Blockly.Blocks['bart_equals'] = {
  init: function() {
    this.appendValueInput('A')
        .setCheck(null);
    this.appendDummyInput()
        .appendField('=');
    this.appendValueInput('B')
        .setCheck(null);
    this.setInputsInline(true);
    this.setOutput(true, 'Boolean');
    this.setColour(210);
    this.setTooltip('Checks if two values are equal.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

/* BOOLEAN LITERALS */

// true
Blockly.Blocks['bart_true'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('true');
    this.setOutput(true, 'Boolean');
    this.setColour(210);
    this.setTooltip('Boolean true value.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

// false
Blockly.Blocks['bart_false'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('false');
    this.setOutput(true, 'Boolean');
    this.setColour(210);
    this.setTooltip('Boolean false value.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

/* MEMORY */

// store
Blockly.Blocks['bart_store'] = {
  init: function() {
    this.appendValueInput('ADDR')
        .setCheck('Number')
        .appendField('store at');
    this.appendValueInput('VALUE')
        .appendField('=');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(330);
    this.setTooltip('Stores a value at memory address (0-511).');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

// load
Blockly.Blocks['bart_load'] = {
  init: function() {
    this.appendValueInput('ADDR')
        .setCheck('Number')
        .appendField('load');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(330);
    this.setTooltip('Loads a value from memory address (0-511).');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

// flush ram
Blockly.Blocks['bart_flush_ram'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('flush RAM');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(330);
    this.setTooltip('Resets all memory to empty.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
    this.setCommentText('My comment');
  }
};

/* SENSING */

// key pressed sensing
const KEY_OPTIONS = [
  ['space', ' '],
  ['up arrow', 'ArrowUp'],
  ['down arrow', 'ArrowDown'],
  ['left arrow', 'ArrowLeft'],
  ['right arrow', 'ArrowRight'],
  ['shift', 'Shift'],
  ['control', 'Control'],
  ['alt', 'Alt'],
  ['enter', 'Enter'],
  ['escape', 'Escape'],
  ['tab', 'Tab'],
  ['backspace', 'Backspace'],
  ['delete', 'Delete'],
  ['home', 'Home'],
  ['end', 'End'],
  ['page up', 'PageUp'],
  ['page down', 'PageDown'],
  ['caps lock', 'CapsLock'],
  ['a', 'a'],
  ['b', 'b'],
  ['c', 'c'],
  ['d', 'd'],
  ['e', 'e'],
  ['f', 'f'],
  ['g', 'g'],
  ['h', 'h'],
  ['i', 'i'],
  ['j', 'j'],
  ['k', 'k'],
  ['l', 'l'],
  ['m', 'm'],
  ['n', 'n'],
  ['o', 'o'],
  ['p', 'p'],
  ['q', 'q'],
  ['r', 'r'],
  ['s', 's'],
  ['t', 't'],
  ['u', 'u'],
  ['v', 'v'],
  ['w', 'w'],
  ['x', 'x'],
  ['y', 'y'],
  ['z', 'z'],
  ['0', '0'],
  ['1', '1'],
  ['2', '2'],
  ['3', '3'],
  ['4', '4'],
  ['5', '5'],
  ['6', '6'],
  ['7', '7'],
  ['8', '8'],
  ['9', '9']
];

Blockly.Blocks['bart_key_pressed'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('key')
        .appendField(new Blockly.FieldDropdown(KEY_OPTIONS), 'KEY')
        .appendField('pressed?');
    this.setOutput(true, 'Boolean');
    this.setColour(290);
    this.setTooltip('Returns true if the specified key is currently pressed.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

Blockly.Blocks['bart_last_key'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('last key pressed');
    this.setOutput(true, 'String');
    this.setColour(290);
    this.setTooltip('Returns the last key pressed as a string.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

Blockly.Blocks['bart_any_key'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('any key pressed?');
    this.setOutput(true, 'Boolean');
    this.setColour(290);
    this.setTooltip('Returns true if any key is currently pressed.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

// current time
Blockly.Blocks['bart_current_time'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('current')
        .appendField(new Blockly.FieldDropdown([
          ['time', 'full'],
          ['seconds', 'seconds'],
          ['minutes', 'minutes'],
          ['hours', 'hours'],
          ['day', 'day'],
          ['month', 'month'],
          ['year', 'year']
        ]), 'UNIT');
    this.setOutput(true, 'String');
    this.setColour(290);
    this.setTooltip('Returns the current date/time component as a string.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

// tracking
Blockly.Blocks['bart_track_start'] = {
  init: function() {
    this.appendValueInput('COL')
        .setCheck('Number')
        .appendField('begin tracking char at c:');
    this.appendValueInput('ROW')
        .setCheck('Number')
        .appendField('r:');
    this.appendDummyInput()
        .appendField('with alias')
        .appendField(new Blockly.FieldTextInput('char1'), 'ALIAS');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(195);
    this.setTooltip('Tracks the character at the given column and row with an alias name.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

Blockly.Blocks['bart_track_stop_all'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('stop tracking all chars');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(195);
    this.setTooltip('Stops tracking all characters.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

Blockly.Blocks['bart_track_stop'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('stop tracking')
        .appendField(new Blockly.FieldTextInput('char1'), 'ALIAS');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(195);
    this.setTooltip('Stops tracking the character with the given alias.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

Blockly.Blocks['bart_track_col'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('column of')
        .appendField(new Blockly.FieldDropdown(getAliases), 'ALIAS');
    this.setOutput(true, 'Number');
    this.setColour(195);
    this.setTooltip('Returns the column of the tracked character.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

Blockly.Blocks['bart_track_row'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('row of')
        .appendField(new Blockly.FieldDropdown(getAliases), 'ALIAS');
    this.setOutput(true, 'Number');
    this.setColour(195);
    this.setTooltip('Returns the row of the tracked character.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

/* FUNCTIONS */

Blockly.Blocks['bart_function'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('function')
        .appendField(new Blockly.FieldTextInput('myFunction'), 'NAME');
    this.appendStatementInput('BODY')
        .appendField('body');
    this.setInputsInline(false);
    this.setPreviousStatement(false, null);
    this.setNextStatement(true, null);
    this.setColour(20);
    this.setTooltip('Defines a function that can be called by name.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

Blockly.Blocks['bart_call_function'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('call')
        .appendField(new Blockly.FieldTextInput('myFunction'), 'NAME');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(20);
    this.setTooltip('Calls a function by name.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

Blockly.Blocks['bart_call_boolean'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('call')
        .appendField(new Blockly.FieldTextInput('myFunction'), 'NAME');
    this.setInputsInline(true);
    this.setOutput(true, 'Boolean');
    this.setColour(20);
    this.setTooltip('Calls a function and returns a boolean value.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

Blockly.Blocks['bart_call_value'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('call')
        .appendField(new Blockly.FieldTextInput('myFunction'), 'NAME');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(20);
    this.setTooltip('Calls a function and returns a string or number value.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};

Blockly.Blocks['bart_return'] = {
  init: function() {
    this.appendValueInput('VALUE')
        .appendField('return');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(false, null);
    this.setColour(20);
    this.setTooltip('Returns a value from a function.');
    this.setHelpUrl('');
    this.setCommentText('My comment');
  }
};


