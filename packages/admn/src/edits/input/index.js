import React from "react";

export default React.createClass({
   getDefaultProps: function () {
      return {
         type: "text",
         lines: 1,
         placeholder: null,
         onChange: null,
         required: false,
         value: null,
         prepend: null
      }
   },
   changed: function (e) {
      const {updateValue} = this.props;
      updateValue(e.target.value);
   },
   render: function () {
      const {lines, placeholder, description, value, required, type, icon, defaultValue, children} = this.props;
      // <div class="input-group m-b">
      //    <span class="input-group-addon">@</span>
      //    <input type="text" class="form-control" placeholder="Username">
      // </div>

      const input = (lines > 1) ? (
         <textarea type={type}
                   rows={lines}
                   placeholder={defaultValue || placeholder || description}
                   onChange={this.changed}
                   value={value||''}
                   required={required}>
                </ textarea>
      ) : (
         <input type={type}
                placeholder={defaultValue || placeholder || description}
                onChange={this.changed}
                value={value||''}
                required={required}/>
      );

      if (icon) {
         return (
            <div className="ui icon input">
               <i className={icon + " icon"}></i>
               {input}
               {children}
            </div>
         )
      }
      if (children) {
         return (
            <div className="ui action input">
               {input}
               {children}
            </div>
         )
      }
      return input;
   }
});
