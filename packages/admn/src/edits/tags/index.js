import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import Select2 from '../../edits/select2';

export default class TagsCompoent extends Component {
   static contextTypes = {
      apiClient: PropTypes.object.isRequired
   };

   render() {
      const {value, updateValue} = this.props;
      const {apiClient} = this.context;
      return (
         <Select2 value={value ? value.map(x=>({id:x,name:x})) : null}
                  allowCreate={true}
                  addLabelText="'{label}' hinzufügen ..."
                  updateValue={(v)=>updateValue(v ? v.map(x=>x.id) : null)}
                  multi={true}
                  fetch={()=>apiClient.get("/tags").then(data=>data.map(x=>({id:x.name,name:x.name})))}/>
      );
   }
};
