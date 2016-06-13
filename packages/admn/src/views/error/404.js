import React, {Component, PropTypes} from "react";

import './404.less';

export default class Error404 extends Component {
   render() {
      //var errorParam = router.getCurrentParams();
      //var {error, path} = router.getCurrentQuery();
      /*let error = "Fehler";
      let stack = null;
      var path = "/";

      const {query} = this.props.location;
      if(query && query.error){
         const errorObj = JSON.parse(query.error);
         if(errorObj){
            error = errorObj.message;
            stack = errorObj.stack;
         }
      }*/
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
