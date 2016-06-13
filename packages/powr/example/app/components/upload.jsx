import React, { Component, PropTypes } from "react";
import Router from "react-router";

export default class Upload extends Component {
   static contextTypes = {
      apiClient: PropTypes.object
   }
   onChange(e){
      console.log(e.files, e.target.files);
      const {apiClient} = this.context;
      apiClient.upload('./upload', {files: e.target.files}).then(x=>{
         console.log(x);
      });
   }
   render() {
      return (
         <form action="/upload" method="post" encType="multipart/form-data">
            Datei:<br/>
            <input type="file" name="file" onChange={::this.onChange} />
            <br/><br/>
            <input type="submit" value="Absenden" />
         </form>
      );
   }
}
