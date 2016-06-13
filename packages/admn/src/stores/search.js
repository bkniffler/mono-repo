import {extendObservable, autorun, toJSON, observable, observe, transaction} from 'mobx';

class SearchStore {
   constructor(apiClient){
      this.apiClient = apiClient;
      extendObservable(this, {
         data: [],
         term: null
      });
   }
   search = (term)=>{
      this.term = term;
      if(!term){
         this.data = [];
         return;
      }
      return this.apiClient.get(`/trace/${term}`).then(x=>{
         this.data = x;
         return this.data;
      });
   }
   createStore = ()=>{
      return new SearchStore(this.apiClient);
   }
}

export default SearchStore;
