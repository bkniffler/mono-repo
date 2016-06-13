import React, {Component, PropTypes} from "react";
import General from "./general";
import ModalComponent from '../../../components/modal';

export default class GeneralModal extends Component{
   constructor(props){
      super();
      this.state = {
         meta: {...props.meta}
      }
   }

   patch(patch){
      this.setState({
         meta: {
            ...this.state.meta,
            ...patch
         }
      })
   }

   save(){
      let {close, save} = this.props;
      save(this.state.meta);
   }

   render() {
      const {close, meta} = this.props;

      return (
         <ModalComponent.Container>
            <ModalComponent.Content>
               <General {...this.props} meta={this.state.meta} patch={::this.patch}/>
            </ModalComponent.Content>
            <ModalComponent.Buttons>
               <ModalComponent.Button icon="checkmark" color="primary" onClick={this.save.bind(this)}>
                  Speichern
               </ModalComponent.Button>
               <ModalComponent.Button icon="remove" color="black" onClick={()=>close()}>
                  Abbruch
               </ModalComponent.Button>
            </ModalComponent.Buttons>
         </ModalComponent.Container>
      );
   }
};
