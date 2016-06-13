import {extendObservable, autorun, toJSON, observable, observe, transaction} from 'mobx';

class MediaStore {
  constructor() {
    extendObservable(this, {
      files: []
    });
  }

  load = ()=> {
    return this.apiClient.get('/files').then((result)=> {
      this.files = result;
    }, (error)=> {
      console.error(error);
      //throw error;
    });
  }
  loadOne = id=> {
    return Promise.all([
      this.apiClient.get('/file/' + id),
      this.apiClient.get('/file-usage/' + id)
    ]).then(results=> {
      return {
        ...results[0],
        usages: results[1]
      }
    });
  }
  save = item=> {
    var op = item.id ? this.apiClient.put('/file/' + item.id, item) : this.apiClient.post('/file', item);
    return op.then((x)=> {
      this.files = this.files.map(y=> {
        return x.id === y.id ? x : y;
      })
    });
  }
  upload = (files, progress) => {
    this.progress = true;
    return this.apiClient.upload('./upload', {files}, {progress}).then(result=> {
      this.files = [...result, ...this.files];
      this.progress = false;
      return result;
    });
  }
  remove = (item)=> {
    return this.apiClient.delete('/file/' + item.id).then(()=> {
      this.files = this.files.filter(x => x.id !== item.id);
    });
  }
}

export default MediaStore;
