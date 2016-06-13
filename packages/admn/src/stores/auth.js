import {extendObservable, autorun, toJSON, observable, observe, transaction} from 'mobx';

class AuthStore {
  @observable user = null;
  @observable users = false;

  constructor(data){
    Object.assign(this, data);
  }

  initialize = () => {
    return this.me();
  }

  // Auth API
  login = (email, password)=> {
    return this.apiClient.post('/auth/login', {email, password}).then((result)=> {
      this.user = result;
      return result;
    });
  };

  logout = ()=> {
    return this.apiClient.get('/auth/logout').then((result)=> {
      this.user = null;
      return null;
    });
  };

  me = ()=> {
    return this.apiClient.get('/auth/me').then((result)=> {
      this.user = result;
    }, (error)=> {
    });
  };

  forgot = (email)=> {
    return this.apiClient.post('/auth/request-new-password', {email}).then((result)=> {
      return null;
    });
  };

  register = (name, email, password, isActive)=> {
    return this.apiClient.post('/auth', {name, email, password, isActive}).then((result)=> {
      this.users = [...this.users, result];
    });
  };

  // User API
  loadUsers = ()=> {
    return this.apiClient.get("/users?query=" + JSON.stringify({order: 'name ASC'})).then(users => {
      this.users = users;
      return users;
    });
  };

  loadOne = (id)=> {
    return this.apiClient.get("/users/" + id);
  };

  save = (item)=> {
    var op = item.id ? this.apiClient.put('/user/' + item.id, item) : this.apiClient.post('/user', item);
    return op.then((x)=> {
      if (this.users) {
        this.users = this.users.map(y=> {
          return x.id === y.id ? x : y;
        });
      }
      return x;
    });
  };

  del = (id)=> {
    return this.apiClient.delete('/user/' + id).then((result)=> {
      this.users = this.users.filter(user => user.id !== result.id);
    });
  };

  stringify = () => this;
}

export default AuthStore;
