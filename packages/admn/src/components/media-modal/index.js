import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import MediaList from '../../views/media/list';
import MediaCrop from './modal-crop';
import ModalComponent from '../modal';

export default class MediaModal extends Component {
   constructor(props) {
      super();
      this.state = {value: props.value ? JSON.parse(JSON.stringify(props.value)) : null};
   }

   update(item) {
      this.setState({value: item})
   }

   save() {
      const {value} = this.state;
      const {updateValue} = this.props;
      updateValue(value);
   }

   empty() {
      const {updateValue} = this.props;
      updateValue(null);
   }

   render() {
      const {value} = this.state;

      var inner;
      if (value) {
         inner = <MediaCrop format={this.props.format} image={value} update={this.update.bind(this)}/>;
      }
      else {
         inner = <MediaList onClick={item=>this.setState({value: item})}/>;
      }
      return (
         <ModalComponent.Container>
            <div>
               {inner}
            </div>
            <ModalComponent.Buttons>
               <ModalComponent.Button icon="save" color="primary" onClick={this.save.bind(this)}>
                  Speichern
               </ModalComponent.Button>
               {value ? <ModalComponent.Button icon="minus square outline" color="yellow" onClick={this.empty.bind(this)}>
                  Kein Bild
               </ModalComponent.Button> : null}
               <ModalComponent.Button icon="remove" color="black" onClick={this.props.close}>
                  Abbruch
               </ModalComponent.Button>
            </ModalComponent.Buttons>
         </ModalComponent.Container>
      );
   }
};
