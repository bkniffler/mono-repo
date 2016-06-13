import React, { Component, PropTypes } from "react";
import Router from "react-router";

export default class Login extends Component {
   render() {
      return (
         <form action="/api/user/login" method="post">
            <input type="text" name="email" />
            <input type="password" name="password" />
            <button type="submit" />
         </form>
      );
   }
}
