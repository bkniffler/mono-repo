import React, {Component, PropTypes} from "react";
import ToolbarPage from "./page";
import ModalComponent from '../../../components/modal';

export default class NewPageModal extends Component{
   constructor(props){
      super();
      this.state = {
         page: {blocks:[], ...(props.item||{})}
      }
   }

   patch(patch){
      this.setState({
         page: {
            ...this.state.page,
            ...patch
         }
      })
   }

   render() {
      const {children, title, close, save, visible} = this.props;

      return (
         <ModalComponent.Container>
            <ModalComponent.Content>
               <ToolbarPage {...this.props} page={this.state.page} patch={::this.patch} isNew={true} />
            </ModalComponent.Content>
            <ModalComponent.Buttons>
               <ModalComponent.Button icon="checkmark" color="primary" onClick={()=>save(this.state.page)}>
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
