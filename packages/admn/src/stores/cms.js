import {extendObservable, autorun, toJSON, observable, observe, transaction} from 'mobx';

class CmsStore {
  @observable navigation = null;
  @observable page = false;
  @observable meta = false;
  @observable templates = false;
  @observable collections = false;

  constructor(data) {
    Object.assign(this, data);
  }

  initialize = () => {
    return Promise.all([this.loadNavigation(), this.loadCollections(), this.loadMeta(), this.loadTemplates()]);
  }

  loadCollections = ()=> {
    return this.apiClient.get('/collection').then(result=> {
      this.collections = {
        asArray: result
      };
      result.forEach(item=> {
        this.collections[item.name] = item;
      });
      return result;
    }, (error)=> {
      console.error(error);
      //throw error;
    });
  }

  loadMeta = ()=> {
    return this.apiClient.get('/meta').then(result=> {
      this.meta = result;
      return result;
    }, (error)=> {
      console.error(error);
      //throw error;
    });
  }

  loadTemplates = ()=> {
    return this.apiClient.get('/template').then(result=> {
      this.templates = result;
      return result;
    }, (error)=> {
      console.error(error);
      //throw error;
    });
  }

  loadNavigation = () => {
    return this.apiClient.get('/pages/navigation').then(result=> {
      this.navigation = result;
      return result;
    }, (error)=> {
      console.error(error);
      //throw error;
    });
  }

  loadPage = (slug)=> {
    var query = slug[0] === '/'
      ? '/pages?query=' + JSON.stringify({slug})
      : '/page/' + slug;
    return this.apiClient.get(query).then(result=> {
      this.page = Array.isArray(result) ? result[0] : result;
      return this.page;
    }, (error)=> {
      console.error(error);
      //throw error;
    });
  }

  savePage = (item)=> {
    var op = item.id ? this.apiClient.put('/page/' + item.id, item) : this.apiClient.post('/page', item);
    return op.then((x)=> {
      this.page = x;
      this.loadNavigation();
      return x;
    });
  }

  deletePage = (item)=> {
    return this.apiClient.delete('/page/' + item.id, item).then(()=> {
      this.loadNavigation();
    });
  }

  saveNavigation = (tree)=> {
    return this.apiClient.put('/pages/navigation', tree).then(result=> {
      this.navigation = result;
      return result;
    });
  }

  saveMeta = (meta)=> {
    return this.apiClient.put('/meta', meta).then(result=> {
      this.meta = result;
      return result;
    });
  }

  savePageAsTemplate = (page, name)=> {
    return this.apiClient.post('/template', {
      json: page.templateData,
      template: page.templateName || 'default',
      name
    }).then(result=> {
      this.templates.push(result);
      return result;
    });
  }

  stringify = () => this;
}

export default CmsStore;
