import React, {Component, PropTypes} from 'react';
import {Toolbar} from 'draft-wysiwyg';
import {DataWrapper} from '../../../../src'

@DataWrapper({collection: 'location2'})
export default class EventBlock extends Component {
  static title = 'Orte';
  static icon = 'soundcloud';
  static category = 'Data';

  render() {
    return (
      <div style={{width: '100%'}}>
        {this.props.data.map(x=><p key={x.id}>{x.name} <a href="javascript:;">Bearbeiten</a></p>)}
      </div>
    );
  }
}


