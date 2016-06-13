import React, {Component, PropTypes} from 'react';
import moment from 'moment';
import {DataWrapper} from '../../../../src'

@DataWrapper({collection: 'event'})
export default class EventBlock extends Component {
   static title = 'Eregnisse';
   static icon = 'soundcloud';
   static category = 'Data';
   render() {
      const {data, edit} = this.props;
      return (
         <div style={{width: '100%'}}>
            {(data || []).map(x=>
               <p key={x.id}>
                 {`${x.name} - ${getDate(x.start)} - ${getLocation(x.location)}`} <a href="javascript:;" onClick={(e)=>{edit(x);e.stopPropagation()}}>Bearbeiten</a>
               </p>
            )}
         </div>
      );
   }
};

function getDate(date){
   return date
      ? moment(date).format()
      : 'Kein Datum';
}

function getLocation(location){
   return location
      ? location.address
      : 'Kein Ort';
}
