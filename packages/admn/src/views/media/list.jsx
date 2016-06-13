import React, {Component, PropTypes} from "react";
import Dropzone from "../../components/dropzone";
import {observer} from 'mobx-react';

class MediaList extends Component {
   static contextTypes = {
      store: PropTypes.object.isRequired
   }

   constructor() {
      super();
      this.state = {
         color: null,
         tag: null,
         text: null
      }
   }

   componentDidMount(){
      const {store} = this.context;
      store.media.load();
   }

   // Get [{color, count}] from array of images
   getColors(data) {
      let colors = {};
      (data || []).forEach((file)=> {
         (file.colorsGoogle || []).forEach((color)=> {
            if (!colors[color]) {
               colors[color] = 0;
            }
            colors[color] = colors[color] + 1;
         })
      });
      return Object.keys(colors).map(function (color) {
         return {
            color: color,
            count: colors[color]
         }
      });
   }
   onUploadClick() {
      const {dropzone} = this.refs;
      dropzone.open();
   }
   render() {
      const {upload, params, onClick} = this.props;
      const {color, text, tag} = this.state;
      const {store} = this.context;
      const data = store.media.files;

      // Compose list of images
      var _images = [];
      var _tags = {};
      data.forEach((item)=> {
         (item.tags || []).forEach(item=> {
            if (!_tags[item]) {
               _tags[item] = 0;
            }
            _tags[item] += 1;
         });

         if (color && ((item.colorsGoogle || []).indexOf(color) === -1))
            return;
         if (tag && (item.tags || []).indexOf(tag) === -1)
            return;
         if (text && ((!item.comment || item.comment.toLowerCase().indexOf(text.toLowerCase()) === -1) &&
            (!item.tags || !item.tags.filter((item)=>item.toLowerCase().indexOf(text.toLowerCase()) !== -1).length))) {
            return;
         }

         var active = params && params.id === item.ref;
         var url = item.url.replace("upload/", "upload/c_fill,g_center,h_200,w_200/");
         _images.push(
            <div key={item.name} className={"card" + (active ? ' active' : '')} style={{border: 0}}>
               <a href="javascript:;" onClick={()=>onClick(item)} className="image">
                  <img src={url}/>
               </a>
               {/*<div className="ui pointing basic label" style={{textAlign: 'center'}}>
                  Test
               </div>*/}
            </div>
         );
      });

      /*const tagImages = Object.keys(_tags).map(key=>
         <div key={key} className="card" style={{border: 0}}>
            <a href="javascript:;" onClick={()=>onClick(item)} className="image">
               <img src="/img/200x200.jpg"/>
            </a>
            <div className="ui pointing basic label" style={{textAlign: 'center'}}>
               {key} ({_tags[key]})
            </div>
         </div>
      );*/

      return (
         <div className="ui divided equal height grid full-h" style={{margin: 0}}>
            <div className="four wide column full-h sub-sidebar" style={{padding: 0, backgroundColor: '#F6F7F9', left: 0}}>
               <div className="ui basic segment full-h">
                  <h1 style={{flex: "0 0 auto"}} className="ui header center aligned icon disabled" onClick={this.onUploadClick.bind(this)}>
                     <i className="huge cloud upload icon" style={{cursor:'pointer'}}></i>
                     <a className="sub header" href="javascript:;">Hochladen</a>
                  </h1>
                  {/*<div className="ui center aligned grid">
                     <div className="column twelve wide no-margin">
                        <div className="circular ui icon button" onClick={this.onUploadClick.bind(this)}>
                           <i className="cloud upload icon"></i>
                        </div>
                     </div>
                  </div>*/}
                  <div className="ui icon input" style={{width:'100%'}}>
                     <input type="text" placeholder="Suche ..." onChange={(e)=>{this.setState({text:e.target.value})}}/>
                     <i className="search icon"></i>
                  </div>

                  <div className="ui divider"/>
                  <h5 className="ui sub disabled header" style={{marginBottom:'5px'}}>
                     Farben{'  '}
                     {color ? <a href="javascript:;" onClick={()=>this.setState({color: null})}>
                        <i className="remove circle outline icon"></i>{color}
                     </a> : null}
                  </h5>
                  {this.getColors(data).map(item=> {
                     let color = (item.color == "white") ? "#000" : "#FFF";

                     return <a key={item.color} href="javascript:;" className="ui circular label"
                               style={{backgroundColor:item.color, color: color}}
                               onClick={()=>this.setState({color: item.color})}>{item.count}</a>;
                  })}
                  <h5 className="ui sub disabled header" style={{marginBottom:'5px'}}>
                     Schlagworte
                     {tag ? <a href="javascript:;" onClick={()=>this.setState({tag: null})}>
                        <i className="remove circle outline icon"></i>{tag}
                     </a> : null}
                  </h5>
                  {Object.keys(_tags).map(key=>
                     <a key={key} className="ui image label" href="javascript:;"
                        style={{margin:'2px'}} onClick={()=>this.setState({tag: key})}>
                        {key}
                        <div className="detail">{_tags[key]}</div>
                     </a>
                  )}
               </div>
            </div>
            <div className="twelve wide column no-spacing full-h" style={{padding: 0, overflowY:'scroll'}}>
               <Dropzone onDrop={::this.upload} ref="dropzone">
                  <div className={"ui basic segment "} style={{margin: 0}}>
                     <div className="ui six doubling cards">
                        {_images}
                     </div>
                  </div>
               </Dropzone>
            </div>
         </div>
      );
   }

   upload(x) {
      const {onClick} = this.props;
      const {store} = this.context;

      store.media.upload(x).then((f)=> {
         if (f.length > 0) {
            onClick(f[0]);
         }
      })
   }
}

export default observer(MediaList);
