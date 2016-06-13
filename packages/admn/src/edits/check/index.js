import React from "react";

export default React.createClass({
   getDefaultProps: function () {
      return {
         yes: "Ja",
         no: "Nein",
         defaultValue: null,
         value: null,
         info: null,
         style: {},
         disabled: false
      }
   },

   onChecked: function (e) {
      var {updateValue, value} = this.props;

      var v;
      if (typeof e === 'undefined') {
         v = !value;
      }
      else {
         v = e.target.checked;
      }
      console.log(v);
      //console.log('Changed', v);

      updateValue(v);
   },

   render: function () {
      const {value, text, label, title, info, description, yes, no, style, disabled, defaultValue} = this.props;

      var v = typeof value === 'undefined' || value === null || value === undefined ? defaultValue : value;
      var checked = !!v;

      var word = (text || title || label)
         ? (text || title || label)
         : (checked ? yes : no)
      + (description ? (" - " + description) : "");
      var infoLabel = info && checked
         ? <span style={{color: "red", fontStyle: "italic", fontSize: "80%"}}>{info}</span>
         : null;

      return (
         <div className="ui checkbox" onClick={()=>this.onChecked()} style={{cursor: 'pointer'}}>
            <input type="checkbox" checked={checked} onChange={()=>{}}/>
            <label>{word}</label>
            {infoLabel}
         </div>
      );
   }
});
