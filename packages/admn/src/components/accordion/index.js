import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';

import './accordion.less';

class AccordionItem extends Component {
   render(){
      const {name} = this.props;
      return (
         <span>&nbsp;&nbsp;{name}</span>
      );
   }
}

export default class Accordion extends Component {
   static Item = AccordionItem;
   static defaultProps = {
      items: []
   }
   constructor(props){
      super();
      this.state = {active: props.initialIndex || 0};
   }

   setActive(active){
      this.setState({active})
   }

   render() {
      const {active} = this.state;
      const {children} = this.props;

      const items = [];
      children.forEach((item, index)=>{
         items.push(
            <div key={index} onClick={()=>this.setActive(index)} className="title flex-item"
                 style={{marginTop: index !== 0 && index !== (active+1) ? '-1px' : null}}>
               {item}
            </div>
         );

         if(index === active){
            items.push(
               <div key={"a-"+index} className="content active flex-item-pane">
                  <div className="ui segment basic inner-pane">
                     {item.props.children}
                  </div>
               </div>
            );
         }
      });

      return (
         <div className="ui accordion flex-container" style={this.props.style}>
            {items}
         </div>
      );
   }
};
