import React, {Component, PropTypes} from "react";
import {Link} from "react-router";

export default class Container extends Component {
   static contextTypes = {
      apiClient: PropTypes.object
   }
   constructor(){
      super();
      this.state = {
         user: null
      }
   }
   componentDidMount(){
      const {apiClient} = this.context;
      apiClient.post('/user/login', {
         email: 'admin',
         password: 'asd'
      }).then(user=>{
         this.setState({
            user
         })
      });
   }
   render() {
      const {user} = this.state;
      const {children} = this.props;
      return (
         <div>
            {user ? `Logged in as ${user.email}` : null}
            <ul>
               <li>
                  <Link to="/">Hello</Link>
               </li>
               <li>
                  <Link to="/hallo">Hallo</Link>
               </li>
               <li>
                  <Link to="/bonjour">Bonjour</Link>
               </li>
               <li>
                  <Link to="/login">Login</Link>
               </li>
               <li>
                  <Link to="/ul">Upload</Link>
               </li>
            </ul>
            <br/>
            {children}
         </div>
      );
   }
}
