import React, {Component, PropTypes} from "react";

export default class BlockEmptyContainer extends Component {
   static onEnter(next, transition, store, actions) {
      const {activate} = actions.page;
      activate(null);
   }
   render() {
      return null;
      return (
         <h2 className="ui icon header center aligned" style={{marginTop:'40px'}}>
            <i className="plus icon"></i>
            <div className="content">
               Neue Seite erstellen
               <div className="sub header">oder links wählen.</div>
            </div>
         </h2>
      );
   }
}
