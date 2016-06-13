import React, {Component} from 'react';
import Editor from 'draft-wysiwyg';

import './index.less';

class DraftEditor extends Component {
  static contextTypes = {
    store: React.PropTypes.object,
    blocks: React.PropTypes.object
  };

  render() {
    let value = this.props.value;
    if (typeof value === 'string') value = null;
    return (
      <Editor value={value} readOnly={this.props.readOnly} blockTypes={this.context.blocks}
              onChange={this.props.updateValue} cleanupTypes="*"/>
    );
  }
}

export default DraftEditor;
