import React, {Component, PropTypes} from "react";
import BlockWrapper from '../block-wrapper';

var defaultVideo = 'https://www.youtube.com/embed/zalYJacOhpo';

@BlockWrapper({
  resizeable: {
    resizeSteps: 10,
    ratio: 2 / 3,
    vertical: 'auto',
    handles: true
  }
})
export default class YoutubeBlock extends Component {
  static title = 'Youtube';
  static icon = 'youtube';
  static category = 'Media';

  setUrl() {
    var url = window.prompt("URL", this.props.url || defaultVideo);
    if (url) {
      const {setEntityData} = this.props;
      setEntityData({url: url});
    }
  }

  componentDidMount() {
    const { addActions } = this.props;
    if (addActions) {
      addActions([{
        button: <span>URL</span>,
        label: 'URL hinzufügen',
        active: false,
        toggle: () => this.setUrl()
      }]);
    }
  }

  render() {
    const {style, className, uniqueId, url} = this.props;

    var styles = {
      width: '100%',
      height: '100%',
      position: 'relative',
      ...style
    };

    return (
      <div id={uniqueId} style={styles} className={className}>
        <iframe width="100%" height="100%" src={url||defaultVideo} frameBorder="0"
                allowFullScreen/>
      </div>
    );
  }
}
