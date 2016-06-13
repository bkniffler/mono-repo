import React, {Component} from "react";
import Portal from 'react-portal';

export default class ModalComponent extends Component{
   static defaultProps = {
      visible: true,
      blank: true
   }

   constructor(){
      super();
   }

   closeOnClick(e){
      let {close} = this.props;

      var left = e.button === 1 || e.button === 0;
      if(left && close){
         close();
      }
   }

   stopPropagation(e){
      var left = e.button === 1 || e.button === 0;
      if(left){
         e.stopPropagation();
      }
   }

   render() {
      let {children, title, close, save, visible, blank} = this.props;

      const titleComponent = title ? (
         <h1 className="ui left aligned header" style={{margin: 0}}>
            {title}
         </h1>
      ) : null;

      if(!visible){
         return null;
      }

      var inner;
      if(!blank){
         inner = (
            <div className="ui small test modal transition visible active scrolling modalWithoutBorderInner" style={{minHeight: "200px"}}>
               <div className="ui segment basic">
                  {titleComponent}
                  {children}
               </div>
               <div className="actions">
                  <div className={"ui blck deny right labeled icon button"} onClick={()=>close()}>
                     Abbruch
                     <i className="remove icon"></i>
                  </div>
                  <div className={"ui positive deny right labeled icon button"} onClick={()=>save()}>
                     Speichern
                     <i className="checkmark icon"></i>
                  </div>
               </div>
            </div>
         )
      }
      else{
         inner = children;
      }
      return (
         <Portal isOpened={true} closeOnEsc onClose={()=>close ? close() : null}>
            <div className="ui dimmer modals page transition visible active" onMouseDown={::this.closeOnClick}>
               <div className="ui small modal transition visible scrolling" onMouseDown={::this.stopPropagation}>
                  {inner}
               </div>
            </div>
         </Portal>
      );
   }
}

ModalComponent.Buttons = function(props){
   return (
      <div className="actions">
         {props.children}
      </div>
   )
}
ModalComponent.Button = function(props){
   return (
      <div className={"ui "+props.color+" deny right labeled icon button"} onClick={props.onClick}>
         {props.title || props.label || props.children}
         {props.icon ? <i className={props.icon + " icon"}></i> : null}
      </div>
   )
}
ModalComponent.Content = function(props){
   return (
      <div className="ui segment basic">
         {props.children}
      </div>
   )
}
ModalComponent.Container = function(props){
   return (
      <div className="ui small test modal transition visible active scrolling modalWithoutBorderInner" style={{minHeight: "200px"}}>
         {props.children}
      </div>
   )
}
