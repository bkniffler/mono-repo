import React, {Component, PropTypes} from 'react';
import {observer} from 'mobx-react';
//import CollectionDetailModal from '../views/collections/detail/detail-modal';
import BlockWrapper from './block-wrapper';

const getDisplayName = WrappedComponent => {
  const component = WrappedComponent.WrappedComponent || WrappedComponent;
  return component.displayName || component.name || 'Component';
};

// fetch: { collection: 'collection', query: {} }
export default (fetch, options) => WrappedComponent => {
  class DataWrapperBlock extends Component {
    static displayName = `DataWrapperBlock(${getDisplayName(WrappedComponent)})`;
    static WrappedComponent = WrappedComponent.WrappedComponent || WrappedComponent;
    static contextTypes = {
      store: PropTypes.object.isRequired
    };

    constructor() {
      super();
      this.state = {};
    }

    addCollection({collection, query}) {
      var store = this.context.store.rest.createStore(collection, query);

      store.setCollection(this.context.store.cms.collections[collection]);
      return store;
    }

    componentDidMount() {
      const {collection, query, ...rest} = fetch;

      this.stores = {};
      if (collection) {
        this.stores.data = this.addCollection(fetch);
      }
      for (const key in rest) {
        this.stores[key] = this.addCollection(fetch[key]);
      }

      Promise.all(
        Object.keys(this.stores).map(key => this.stores[key].load())
      ).then(x => this.setState({loaded: true})).catch(err => console.log(err));
    }

    add = key => {
      const {activate} = this.props.blockProps;
      activate(null);
      var item = this.stores[key || 'data'].create();
      this.setState({item});
    };

    edit = (key, item) => {
      if (!item) {
        item = key;
        key = 'data';
      }
      const {activate} = this.props.blockProps;
      activate(null);
      this.setState({item});
      setTimeout(()=> {
        activate(null);
      }, 10);
    };

    query = (key, criteria) => {
      if (!criteria) {
        criteria = key;
        key = 'data';
      }
      this.stores[key].applyQuery(criteria);
    };

    render() {
      if (!this.stores) return (
        <div className="ui active inverted dimmer">
          <div className="ui loader"></div>
        </div>
      );

      // Define actions for toolbar
      /*var sortAction = {
       // Set active state of button if 'DESC'
       active: this.store.order && this.store.order[0][1] === 'DESC',
       button: <span>SORT</span>,
       // Toggle sorting, using Sequelize sort syntax {order: [['name', 'ASC'], ['start', 'DESC']]}
       toggle: ()=>this.store.order && this.store.order[0][1] === 'DESC'
       ? this.sort([['name', 'ASC']])
       : this.sort([['name', 'DESC']]),
       label: 'Sortieren'
       };*/
      var addAction = {
        // Set active state of button if 'DESC'
        active: false,
        button: <span>+</span>,
        // Toggle sorting, using Sequelize sort syntax {order: [['name', 'ASC'], ['start', 'DESC']]}
        toggle: ::this.add,
        label: 'Erstellen'
      };

      /*if (this.state.item) {
       return (
       <div>
       <Comp {...this.store} {...this.props} dataActions={[addAction]} edit={::this.edit}/>
       <CollectionDetailModal
       close={()=>this.setState({item:null})}
       save={this.store.save}
       item={this.state.item}
       collection={this.collection}
       {...this.collection}/>
       </div>
       )
       }*/

      const data = {}
      for (var key in this.stores) {
        data[key] = this.stores[key].data || [];
      }

      return !this.state.loaded ? (
        <div className="ui active inverted dimmer">
          <div className="ui loader"></div>
        </div>
      ) : (
        <WrappedComponent {...this.props} loaded={this.state.loaded} dataActions={[addAction]} edit={this.edit}
                                          query={this.query} applyQuery={this.query} {...data}/>
      );
    }
  }

  var Wrapped = observer(DataWrapperBlock);
  Wrapped.title = WrappedComponent.title;
  Wrapped.icon = WrappedComponent.icon;
  Wrapped.category = WrappedComponent.category + ',Collections';
  Wrapped.WrappedComponent = WrappedComponent.WrappedComponent || WrappedComponent;
  Wrapped.displayName = `Observer(${getDisplayName(WrappedComponent)})`;
  return BlockWrapper(options)(Wrapped);
}


