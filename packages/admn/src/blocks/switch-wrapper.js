import React, {Component, PropTypes} from 'react';
import {DataWrapper} from 'admn';

export default (filterProp, fetch, options) => WrappedComponent => {
  class SwitchWrapperBlock extends Component {
    static contextTypes = {
      store: PropTypes.object.isRequired
    };

    getGroups() {
      const {data} = this.props;

      let groups = [];
      data.map(item=> {
        if (item[filterProp] && typeof item[filterProp] === 'object') {
          item[filterProp].map(x=> {
            if (!groups[x]) {
              groups[x] = [];
            }

            groups[x].push(item)
          });
        } else {
          let name = item[filterProp] ? item[filterProp] : 'Standart';

          if (!groups[name]) {
            groups[name] = [];
          }

          groups[name].push(item);
        }
      });

      return groups;
    }

    getKeys() {
      let keys = [];
      Object.keys(this.getGroups()).map((key, index)=>keys[index] = key);

      return keys;
    }

    getActions() {
      const {actions, setEntityData, currentIdentifier} = this.props;
      const keys = this.getKeys();

      const currentIdentifierIndex = currentIdentifier ? keys.indexOf(currentIdentifier) : 0;
      const prevIdentifier = keys[currentIdentifierIndex ? currentIdentifierIndex - 1 : keys.length - 1];
      const nextIdentifier = keys[keys.length > currentIdentifierIndex + 1 ? currentIdentifierIndex + 1 : 0];

      return [
        {
          button: <i className="angle double left icon"></i>,
          label: prevIdentifier,
          active: false,
          toggle: ()=>setEntityData({currentIdentifier: prevIdentifier})
        },
        //...(actions || []), // fügt Align Center... mehrfach ein
        {
          button: <i className="angle double right icon"></i>,
          label: nextIdentifier + ' ', // Leerzeichen ist wichtig, da bei nur zwei verschiedenen Gruppen prevIdentifier === nextIdentifier und er sonst key-Probleme beim mappen hat
          active: false,
          toggle: ()=>setEntityData({currentIdentifier: nextIdentifier})
        }
      ]
    }

    render() {
      const {currentIdentifier} = this.props;

      return <WrappedComponent {...this.props} data={this.getGroups()[currentIdentifier || this.getKeys()[0]]}
                                               actions={this.getActions()}/>;
    }
  }

  var Wrapped = SwitchWrapperBlock;
  Wrapped.title = WrappedComponent.title;
  Wrapped.icon = WrappedComponent.icon;
  Wrapped.category = WrappedComponent.category;
  return DataWrapper(fetch, options)(Wrapped);
}
