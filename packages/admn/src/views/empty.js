import React, {Component, PropTypes} from "react";


export default class Empty extends Component {
   render() {
      return (
         <div className="ui vertical masthead center aligned segment">
            <div className="ui text container center">
               <h1 className="ui inverted header" style={{marginTop:'50px'}}>
                  404
               </h1>
               <h4>Die gesuchte Seite wurde nicht gefunden.</h4>
            </div>
         </div>
      );
   }
}
