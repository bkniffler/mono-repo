import React, {Component, PropTypes} from 'react';
import {ChromePicker, CompactPicker, MaterialPicker, PhotoshopPicker, SketchPicker, SliderPicker, SwatchesPicker} from 'react-color';

export default class ColorEdit extends Component {
   static contextTypes = {
      colorPicker: React.PropTypes.object
   }
   render() {
      var Picker = SliderPicker;
      if(this.context.colorPicker && this.context.colorPicker.type){
         switch(this.context.colorPicker.type){
            case 'compact':
               Picker = CompactPicker;
               break;
            case 'chrome':
               Picker = ChromePicker;
               break;
            case 'material':
               Picker = MaterialPicker;
               break;
            case 'photoshop':
               Picker = PhotoshopPicker;
               break;
            case 'slider':
               Picker = SliderPicker;
               break;
            case 'swatches':
               Picker = SwatchesPicker;
               break;
         }
      }
      var colors = this.context.colorPicker && this.context.colorPicker.colors ? this.context.colorPicker.colors : undefined;
      return (
         <Picker color={this.props.value ? this.props.value : undefined} onChange={(v)=>{this.props.updateValue(v.hex)}} colors={colors}/>
      );
   }
};
