import React, {Component, PropTypes} from "react";
import MediaList from './list';
import {Helmet, ComposeMeta} from "powr/helmet";

class MediaContainer extends Component {
   static metaData = ComposeMeta({
      title: 'Mediathek',
      meta: [
         {property: 'og:site_name', content: 'Just another Admn Website'},
         {property: 'og:title', content: 'Just another Admn Website'},
         {property: 'twitter:title', content: 'Just another Admn Website'}
      ]
   });

   // Context Types
   static contextTypes = {
      router: PropTypes.object.isRequired
   };

   // Render
   render() {
      const {push} = this.context.router;

      return (
         <div className="ui divided equal height grid full-h" style={{margin: 0}}>
            <Helmet {...MediaContainer.metaData} />
            <div className="ten wide column" style={{padding: 0, height: '100%'}}>
               <MediaList onClick={item=>push("/c/media/" + item.ref)}/>
            </div>
            <div className="six wide column" style={{overflowY:'scroll', height: '100%', backgroundColor: '#F6F7F9'}}>
               {this.props.children}
            </div>
         </div>
      );
   }

   save() {
      const {pushPath} = this.context.actions.router;
      const {save} = this.context.actions.media;
      const {item} = this.state;

      save(item).then((data)=>{
         pushPath('/c/media/' + data.result.ref);
      });
   }

   remove() {
      const {pushPath} = this.context.actions.router;
      const {remove} = this.context.actions.media;
      const {item} = this.state;

      remove(item).then((data)=>{
         pushPath('/c/media/');
      });
   }

   patch(patch) {
      const {item} = this.state;

      this.setState({
         item: {
            ...item,
            ...patch
         }
      });
   }
}

export default MediaContainer;
/*export default connect(state => ({
   data: state.media.data,
   loading: state.media.loading
}))(MediaContainer);*/
