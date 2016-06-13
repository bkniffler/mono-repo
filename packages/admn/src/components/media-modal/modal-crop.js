import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';

import Cropper from 'cropperjs';
import Select from '../../edits/select';
import './modal-cropjs.less';

var options = {
   'Freie Auswahl': 0,
   'Postkarte': 3 / 2,
   'Portrait': 2 / 3,

   'Quadratisch': 1,
   'Landschaft': 19 / 7,
   'Kino': 16 / 9
}

export default class MediaCrop extends Component {
   static defaultProps = {
      image: {
         url: "http://placehold.it/350x150"
      },
      imageWidth: 12,
      format: 0
   }

   constructor(props) {
      super();
      const {format} = props;
      this.state = {
         format
      }
   }

   render() {
      const {image} = this.props;
      const {format} = this.state;

      return (
         <div style={{minHeight: '500px', maxHeight: '500px'}}>
            <div className="ui text menu no-spacing" style={{marginLeft:'15px', marginRight:'15px'}}>
               {!this.props.format ? <div className="item">
                  <div className="ui icon input">
                     <Select value={format} updateValue={this.setFormat.bind(this)}
                             options={Object.keys(options).map(i=>({value:options[i],name:i}))}/>
                  </div>
               </div> : null}
               {!this.props.format ?
                  <a href="javascript:;" className="item" onClick={this.setSelectAll.bind(this)}>
                     Alles auswählen
                  </a> : null}
               <div className="right menu">
                  <a className="item" href="javascript:;" onClick={()=>this.props.update(null)}>
                     <i className="arrow left icon"></i> Zur Mediathek
                  </a>
               </div>
            </div>
            <img src={image.url} ref="image" id="cropImage"/>
         </div>
      );
   }

   mountJcrop() {
      const {image} = this.props;
      const {params} = image;
      const {format} = this.props;

      const data = params && params.cropX != undefined && params.cropY != undefined && params.cropW != undefined && params.cropH != undefined
         ? {x: params.cropX, y: params.cropY, width: params.cropW, height: params.cropH} : null;

      var first = true;
      this.cropper = new Cropper(ReactDOM.findDOMNode(this.refs.image), {
         viewMode: 2,
         zoomable: false,
         responsive: false,
         movable: false,
         autoCrop: !!params || format,
         data: data
      });
      this.refs.image.addEventListener('crop', (e) => {
         if (first) {
            first = false;
            return;
         }
         this.setPreview(e);
      });

      if (format) {
         this.cropper.setAspectRatio(format === 0 || format === "0" ? null : format);
      }
   }

   componentDidMount() {
      this.mountJcrop();
   }

   shouldComponentUpdate(newProps, newState) {
      return false;
   }

   setFormat(format) {
      this.setState({format});
      this.cropper.setAspectRatio(format === 0 || format === "0" ? null : format);
   }

   setSelectAll() {
      const {image} = this.state;
      this.cropper.clear();
      this.setState({image: {...image, params: null}});
   }

   setPreview(e) {
      console.log('SET PREV')
      var c = e.detail;

      if (!c.x && !c.y && !c.width && !c.height) {
         return;
      }

      const {update} = this.props;
      update({
         ...this.props.image,
         params: {
            cropX: Math.round(c.x),
            cropY: Math.round(c.y),
            cropW: Math.round(c.width),
            cropH: Math.round(c.height)
         }
      });
   }
}
