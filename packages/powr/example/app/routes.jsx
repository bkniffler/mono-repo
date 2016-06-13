import React from 'react';
import {Route} from 'react-router';
import Container from './containers/container';
import Hello from './components/hello';
import Hallo from './components/hallo';
import Bonjour from './components/bonjour';
import Login from './components/login';
import Upload from './components/upload';

export default function (handler) {
   return (
      <Route component={Container}>
         <Route path="/" component={Hello} onEnter={handler.enter(Hello)}></Route>
         <Route path="/hallo" component={Hallo}></Route>
         <Route path="/bonjour" component={Bonjour}></Route>
         <Route path="/login" component={Login}></Route>
         <Route path="/ul" component={Upload}></Route>
      </Route>
   )
}
