import React, { Component, PropTypes } from "react";
import Router from "react-router";

export default class Hello extends Component {
   // Fetch something i
   static onEnter(){
      console.log('Working on something important...');
      return new Promise((resolve, reject)=>{
         setTimeout(()=>{
            console.log('Done synchronously!');
            resolve();
         }, 500);
      });
      new Promise((resolve, reject)=>{
         setTimeout(()=>{
            console.log('Done asynchronously!');
            resolve();
         }, 500);
      });
   }
   render() {
      return (
         <div>
            Hello my friend!
         </div>
      );
   }
}
