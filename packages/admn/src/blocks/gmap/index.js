import React, {Component, PropTypes} from 'react';
import Gmap from '../../edits/gmap/map';
import BlockWrapper from '../block-wrapper';

const defaultAddress = {
  address: 'Bitte eingeben',
  lat: 50.1109221,
  lng: 8.6821267,
  zoom: 14
};

@BlockWrapper({
  resizeable: {
    resizeSteps: 10,
    //ratio: 2/3,
    //vertical: 'absolute',
    handles: true
  }, alignment: false
})
export default class GmapBlock extends Component {
  static defaultProps = {
    address: null,
    small: false
  };
  static title = 'Google Maps';
  static category = 'Mehr';
  static icon = 'marker';

  setAddress() {
    var address = window.prompt("URL", this.props.address ? this.props.address.address : defaultAddress.address);
    if (address) {
      const {setEntityData} = this.props;
      Gmap.helpers().search(address).then((addresses)=> {
        setEntityData({address: addresses[0]});
      }).catch(err=> {
        console.error(err);
      });
    }
  }

  componentDidMount() {
    const {addActions} = this.props;
    if (addActions) {
      addActions([{
        button: <span>Adresse</span>,
        label: 'Adresse hinzufügen',
        active: false,
        toggle: () => this.setAddress()
      }]);
    }
  }

  render() {
    const {style, className, uniqueId, address} = this.props;
    const value = address || defaultAddress;

    var styles = {
      width: '100%',
      height: '100%',
      position: 'relative',
      ...style
    };

    return (
      <div id={uniqueId} className={className} style={styles}>
        <Gmap value={value} fill={true}/>
      </div>
    );
  }
}
