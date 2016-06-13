import React, {Component, PropTypes} from 'react';
import Main from "./main";
import {observer} from 'mobx-react';

export default function WrapApp(App, templates, options){
   const redirectUrl = '';

   class AppWrapper extends Component {
      getChildContext() {
         return {
            templates: templates,
            metaOptions: options||{}
         };
      }

      static childContextTypes = {
         metaOptions: PropTypes.object,
         templates: PropTypes.object
      };

      static contextTypes = {
         store: PropTypes.object.isRequired
      };

      render() {
         const {children} = this.props;
         const {user} = this.context.store.auth;
         const {meta} = this.context.store.cms;

         if(user){
            return (
               <Main {...this.props} {...this.context} navigation={this.context.store.cms.navigation} user={user}>
                  <App {...this.props} {...this.context} navigation={this.context.store.cms.navigation} meta={meta} user={user}>
                     {children}
                  </App>
               </Main>
            );
         }
         else{
            return (
               <App {...this.props} {...this.context} navigation={this.context.store.cms.navigation} meta={meta} user={user}>
                  {children}
               </App>
            );
         }
      }

      save() {
         const {actions} = this.context;
         const {pushPath} = actions.router;
         const {page} = this.props;
         const {save} = actions.page;

         save(page).then((data)=> {
            pushPath(redirectUrl + data.result.slug);
         });
      }
   }

   return observer(AppWrapper);
}
