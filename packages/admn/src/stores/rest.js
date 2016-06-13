import {extendObservable, autorun, toJSON, observable, observe, transaction} from 'mobx';

class RestStore {
  constructor(apiClient, model, query) {
    this.apiClient = apiClient;
    this.model = model;
    this.query = {
      ...query
    };
    this.emptyItem = {};
    extendObservable(this, {
      data: []
    });
  }

  setCollection = collection => {
    this.collection = collection;
    this.emptyItem = {};
    collection.schema.forEach((property)=> {
      this.emptyItem[property.name] = property.defaultValue || undefined;
    });
  }
  load = () => {
    var query = {
      ...this.query
    };
    if (query.includeDeleted) {
      query.paranoid = false;
    }
    return this.apiClient.get(`/${this.model}?query=${JSON.stringify(query)}`).then(x=> {
      this.data = x.map(x=>({...this.emptyItem, ...x}));
      return this.data;
    });
  }
  applyQuery = (query, replaceQuery) => {
    this.query = replaceQuery ? query : {...this.query, ...query};
    return this.load();
  }
  remove = (items)=> {
    if (!Array.isArray(items)) items = [items];
    return Promise.all(
      items.map(x=>this.apiClient.delete(`/${this.model}/${x.id}`))
    );
  }
  loadOne = id=> {
    return this.apiClient.get(`/${this.model}/${id}`).then(x=>({...this.emptyItem, ...x}));
  }
  save = item => {
    var isNew = !item.id;
    var op = isNew ? this.apiClient.post(`/${this.model}`, item) : this.apiClient.put(`/${this.model}/${item.id}`, item);
    return op.then(x=> {
      if (isNew) {
        this.data.push(x)
      }
      else {
        this.data = this.data.map(y=>x.id === y.id ? {...this.emptyItem, ...x} : y);
      }
      return x;
    });
  }
  create = ()=> {
    return {...this.emptyItem};
  }
  createStore = (model, criteria, order)=> {
    return new RestStore(this.apiClient, model, criteria, order);
  }
}

export default RestStore;

