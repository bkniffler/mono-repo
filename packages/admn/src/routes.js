import React from 'react';
import {Route} from 'react-router';

import {Container, App, Empty} from './views';
import {ErrorContainer, Error404} from "./views/error";

import {
  AuthContainer,
  AuthLogin,
  AuthForgot,
  AuthRegister,
  AuthRegisterStatus
} from "./views/auth";
import {Media, MediaDetail} from './views/media';
import {
  UserList,
  UserContainer
} from "./views/user";
import {Page} from './views/pages';
import {Collection} from './views/collections';
import Search from './views/search';
import Stats from './views/stats';

export default (_routes, templates, Frontend) => handler => (
  <Route component={Container} onEnter={handler.enter(Container)} key="0">
    <Route component={ErrorContainer}>
      <Route path="/error" component={Error404}/>
    </Route>
    <Route component={AuthContainer}>
      <Route path="/c/login" component={AuthLogin} onEnter={handler.enter(AuthLogin)}/>
      <Route path="/c/forgot" component={AuthForgot} onEnter={handler.enter(AuthLogin)}/>
      <Route path="/c/register" component={AuthRegister} onEnter={handler.enter(AuthLogin)}/>
      <Route path="/c/register/:key" component={AuthRegisterStatus} onEnter={handler.enter(AuthLogin)}/>
    </Route>
    <Route component={App} onEnter={handler.enter(App)}>
      <Route path="/c/media" component={Media} onEnter={handler.enter(Media)}>
        <Route path="/c/media/new" component={MediaDetail}/>
        <Route path="/c/media/:id" component={MediaDetail}/>
      </Route>
      <Route path="/c/users" component={UserList} onEnter={handler.enter(UserList)}>
        <Route path="/c/users/:id"/>
      </Route>
      <Route path="/c/user" component={UserContainer} onEnter={handler.enter(UserContainer)}/>
      <Route path="/c/data/:model" component={Collection} onEnter={handler.enter(Collection)}>
        <Route path="/c/data/:model/:id"/>
      </Route>
      <Route path="/c/search" component={Search}/>
      <Route path="/c/stats" component={Stats}/>
    </Route>
   {_routes ? _routes(handler) : null}
    <Route component={Frontend} onEnter={handler.enter(Frontend)}>
      <Route path="/" component={Page} onEnter={handler.enter(Page)} onLeave={handler.leave(Page)}/>
      <Route path="/*" component={Page} onEnter={handler.enter(Page)} onLeave={handler.leave(Page)}/>
    </Route>
    <Route component={ErrorContainer}>
      <Route path="*" component={Error404}/>
    </Route>
  </Route>
);
