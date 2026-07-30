export const toolboxXML = `
<xml id="toolbox" style="display: none">
  <category name="Events" colour="290">
    <block type="bart_on_run"></block>
    <block type="bart_key_pressed"></block>
    <block type="bart_last_key"></block>
    <block type="bart_any_key"></block>
    <block type="bart_current_time"></block>
  </category>
  <category name="Tracking" colour="195">
    <block type="bart_track_start"></block>
    <block type="bart_track_stop_all"></block>
    <block type="bart_track_stop"></block>
    <block type="bart_track_col"></block>
    <block type="bart_track_row"></block>
  </category>
  <category name="Screen" colour="160">
    <block type="bart_put"></block>
    <block type="bart_clear"></block>
    <block type="bart_move"></block>
  </category>
  <category name="Control" colour="120">
    <block type="bart_wait">
      <value name="SECONDS">
        <block type="bart_number">
          <field name="VALUE">1</field>
        </block>
      </value>
    </block>
    <block type="bart_wait_until">
      <value name="CONDITION">
        <block type="bart_true"></block>
      </value>
    </block>
    <block type="bart_repeat"></block>
    <block type="bart_while"></block>
    <block type="bart_if_else"></block>
    <block type="bart_switch_case"></block>
  </category>
  <category name="Strings" colour="160">
    <block type="bart_string"></block>
    <block type="bart_join"></block>
    <block type="bart_char_at"></block>
    <block type="bart_len"></block>
    <block type="bart_substr"></block>
  </category>
  <category name="Numbers" colour="230">
    <block type="bart_number"></block>
    <block type="bart_add"></block>
    <block type="bart_subtract"></block>
    <block type="bart_multiply"></block>
    <block type="bart_divide"></block>
    <block type="bart_rand">
      <value name="FROM">
        <block type="bart_number">
          <field name="VALUE">1</field>
        </block>
      </value>
      <value name="TO">
        <block type="bart_number">
          <field name="VALUE">10</field>
        </block>
      </value>
    </block>
  </category>
  <category name="Conversions" colour="160">
    <block type="bart_to_number"></block>
    <block type="bart_to_string"></block>
    <block type="bart_to_boolean"></block>
  </category>
  <category name="Logic" colour="210">
    <block type="bart_logic_op"></block>
    <block type="bart_not"></block>
    <block type="bart_equals"></block>
    <block type="bart_true"></block>
    <block type="bart_false"></block>
  </category>
  <category name="Memory" colour="330">
    <block type="bart_store">
      <value name="ADDR">
        <block type="bart_number">
          <field name="VALUE">0</field>
        </block>
      </value>
      <value name="VALUE">
        <block type="bart_number">
          <field name="VALUE">0</field>
        </block>
      </value>
    </block>
    <block type="bart_flush_ram"></block>
    <block type="bart_load">
      <value name="ADDR">
        <block type="bart_number">
          <field name="VALUE">0</field>
        </block>
      </value>
    </block>
  </category>
  <category name="Functions" colour="20">
    <block type="bart_function">
      <field name="NAME">myFunction</field>
    </block>
    <block type="bart_call_function">
      <field name="NAME">myFunction</field>
    </block>
    <block type="bart_call_boolean">
      <field name="NAME">myFunction</field>
    </block>
    <block type="bart_call_value">
      <field name="NAME">myFunction</field>
    </block>
    <block type="bart_return">
      <value name="VALUE">
        <block type="bart_number">
          <field name="VALUE">0</field>
        </block>
      </value>
    </block>
  </category>
</xml>
`;