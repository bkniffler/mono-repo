import React, {Component, PropTypes} from 'react';

export default class MediaDetailEmpty extends Component {
   static onEnter(next, transition, store, actions) {
      const {activate} = actions.media;
      activate(null);
   }

   render() {
      return null;
      return (
         <h2 className="ui icon header center aligned">
            <i className="circular arrow left icon"></i>
            <div className="content">
               Wähle ein Bild zum bearbeiten.
               <div className="sub header">oder zieh' etwas hierher zum Hochladen.</div>
            </div>
         </h2>
      );
   }
}
