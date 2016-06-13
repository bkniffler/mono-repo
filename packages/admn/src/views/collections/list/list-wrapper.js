import React, {Component, PropTypes} from "react";
import CollectionDetail from '../detail/detail-modal';
import View from './list';
import {toJSON} from 'mobx';
import {observer} from 'mobx-react';

class CollectionsWrapper extends Component {
  static contextTypes = {
    store: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired
  };

  constructor(props, context) {
    super();
    this.state = {selected: []};
  }

  componentDidMount() {
    this.collection = this.context.store.cms.collections[this.props.params.model];
    var type = this.props.location.query.type;
    this.store = this.context.store.rest.createStore(this.props.params.model);
    this.store.setCollection(this.collection);
    this.setState({inited: new Date()});
    this.store.applyQuery({scheduled: false, documentState: type || true}).then(x=> {
      this.setState({loaded: new Date()});
    });
  }

  componentDidUpdate(oldProps) {
    if (oldProps.params.model !== this.props.params.model) {
      this.componentDidMount();
    }
  }

  remove(id) {
    const {remove, data} = this.store;
    if (!id && id.map && id.forEach) {
      id = [id];
    }

    Promise.all(id.map(id=> {
      this.select(id, false);
      return remove(data.filter(item=>item.id === id)[0]);
    })).then(x=>
      this.store.load()
    ).then(x=>
      this.setState({loaded: new Date(), selected: []})
    );
  }

  patch(id, patch) {
    const {save, data} = this.store;
    if (!id && id.map && id.forEach) {
      id = [id];
    }

    Promise.all(id.map(id=> {
      var item = data.filter(item=>item.id === id)[0];
      for (var key in patch) {
        item[key] = patch[key];
      }
      this.select(id, false);
      return save(item)
    })).then(x=>
      this.store.load()
    ).then(x=>
      this.setState({loaded: new Date(), selected: []})
    );
  }

  select(id, check) {
    const {selected} = this.state;
    if (check === false || selected.indexOf(id) !== -1) {
      this.setState({selected: selected.filter(x=>x !== id)});
    }
    else {
      this.setState({selected: [...selected, id]});
    }
  }

  render() {
    const {params, save} = this.props;
    const {push} = this.context.router;

    if (!this.store) return null;
    var modal = params.id
      ? (params.id === 'new' ? this.store.create() : this.store.data.filter(item=>item.id === params.id)[0])
      : null;

    return (
      <View {...this.props} {...this.state} {...this.collection} {...this.context} {...this.store}
        store={this.store}
        schema={(this.collection.listView ? this.collection.listView.fields : this.collection.schema).map(field=> ({
                  ...this.collection.schema.filter(item=>item.name === field.name)[0],
                  ...field
            }))}
        remove={::this.remove} patch={::this.patch}
        select={this.select.bind(this)}
      >
        {modal ? <CollectionDetail {...this.context} {...this.props} {...this.collection} {...this.store}
          close={()=>push({pathname: '/c/data/'+this.collection.name, query: {...this.props.location.query}})}
          item={modal} collection={this.collection}/> : null}
      </View>
    );
  }
}

export default observer(CollectionsWrapper);
