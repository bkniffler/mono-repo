import React, {Component, PropTypes, Children} from 'react';
import './app.less';


export default class App extends Component {
   static onEnter(next, replaceState, store, actions) {
      //var state = store.getState();
      if (!store.auth || !store.auth.user) {
         replaceState({ pathname: '/c/login', query: { next: next.location.pathname } });
         //replaceState(null, '/c/login?next='+next.location.pathname);
      }
   }

   render() {
      const {children} = this.props;
      return Children.only(children);
   }
}
