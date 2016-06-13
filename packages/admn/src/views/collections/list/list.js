import React, {Component, PropTypes} from "react";
import moment from "moment";
import Image from "../../../edits/image";
import {Link} from 'react-router';
import {observer} from 'mobx-react';
import * as Editors from '../../../edits';

function HandleHeader(props) {
  var style = {};
  var sortable = props.type ? props.type.toLowerCase() !== "image" && props.type.toLowerCase() !== "jsonb" && props.type.indexOf('(') === -1 : false;

  switch (props.type) {
    case 'image':
    {
      style.minWidth = '80px';
      style.maxWidth = '80px';
      style.width = '80px';
      break;
    }
  }

  return (
    <th style={style}>
      {sortable ? (
        <a href="javascript:;" onClick={()=>props.changeSort(props.name)}>
          {props.label}
          {props.sortBy == props.name ? <i className={"caret icon" + ( !props.sortAsc ? " up" : " down" )}></i> : null}
        </a>
      ) : props.label}
    </th>
  );
}

function HandleField(props) {
  var field = props.field;
  var item = props.item;
  var onClick = props.onClick;
  var inner;
  var style = {cursor: 'pointer'};
  var Editor = '';
  if (field.editor){
    for(var key in Editors){
      if (key.toLowerCase() === field.editor.toLowerCase()){
        Editor = Editors[key];
      }
    }
  }

  function str(x) {
    return x + '';
  }

  if (field.type && field.type.toLowerCase().indexOf("belongstomany") === 0) {
    inner = (item[field.name] || []).map(obj=>obj.name || obj.id).join(", ");
  } else if (field.editor && field.editor.toLowerCase() === 'color') {
    if (item[field.name]) inner = <i style={{color: item[field.name]}} className="icon square"/>;
  } else if (field.type) {

    // type
    switch (field.type.toLowerCase()) {
      case 'date':
      {
        var date = field.format ? moment(item[field.name]).format(field.format) : moment(item[field.name]).format('DD.MM.YYYY HH:mm');
        inner = str(date !== 'Invalid date' ? date : item[field.name]);
        break;
      }
      case 'image':
      {
        onClick = null;
        delete style.pointer;
        inner = item[field.name] ? <Image value={item[field.name]} height={60} readOnly={true}/> : '';
        break;
      }
      case 'jsonb':
      {
        inner = item[field.name] ? str((item[field.name].name || item[field.name].address || "")) : null;

        if (item[field.name] && item[field.name].blocks && item[field.name].blocks.length) {
          inner = item[field.name].blocks.map(block=>block.text).join("").substr(0, 100);
          inner = inner.length === 100 ? inner + "..." : inner;
        }

        break;
      }
      case 'boolean':
      {
        inner = item[field.name] && Editor ?
          <Editor {...field} readOnly={true} value={item[field.name]} updateValue={()=>{}}/> : null;
        break;
      }
      case 'text':
      {
        inner = item[field.name] && Editor ?
          field.editor.toLowerCase() == "richtext" ? <Editor {...field} readOnly={true} value={item[field.name]}
                                                                        updateValue={()=>{}}/> : str(item[field.name]) : null;
        break;
      }
      default:
      {
        if (typeof(item[field.name]) === 'object' && item[field.name]) {
          inner = item[field.name].name || item[field.name].id;
        } else {
          inner = str(item[field.name]);
        }
        break;
      }
    }

    // editor
    switch (field.editor.toLowerCase()) {
      case 'image':
      {
        onClick = null;
        delete style.pointer;
        inner = item[field.name] ? <Image value={item[field.name]} height={60} readOnly={true}/> : '';
        break;
      }
      case 'suggestion':
      {
        //        inner = item[field.name] ? (Array.isArray(item[field.name]) ? (item[field.name].length > 1 ? item[field.name].join(', ') : item[field.name][0]) : item[field.name]) : '';
        inner = item[field.name] && typeof item[field.name] === 'object' ? item[field.name].join(', ') : '';
        break;
      }
    }
  }

  return <td onClick={onClick} style={style}>{inner}</td>
}

class Collections extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      sortBy: undefined,
      sortAsc: true,
      search: ''
    }
  }

  filter(_state) {
    const {applyQuery} = this.props;


    if (_state === 'archive') {
      applyQuery({documentState: 'archive'});
    }
    else if (_state === 'trash') {
      applyQuery({documentState: 'trash'});
    }
    else {
      applyQuery({documentState: true});
    }
  }

  sort() {
    const {applyQuery} = this.props;

    applyQuery({
      order: [[this.state.sortBy ? this.state.sortBy : 'updatedAt', this.state.sortAsc ? 'ASC' : 'DESC']]
    });
  }

  changeSort(field) {
    const {sortBy, sortAsc} = this.state;

    this.setState({
      sortBy: field,
      sortAsc: sortBy != field ? true : !sortAsc
    });
  }

  componentDidMount() {
    this.sort();
  }

  componentDidUpdate(prevProps, prevState) {
    const {sortBy, sortAsc} = this.state;

    if (sortBy != prevState.sortBy || sortAsc != prevState.sortAsc) {
      this.sort();
    }
  }

  onSearch = (e) => {
    const search = e.target.value;
    this.setState({
      search
    })
  };

  render() {
    var {children, data, select, selected, remove, patch, router, name, plural, schema} = this.props;
    var {push} = router;
    var {search} = this.state;
    var criteria = this.props.location.query.type;
    //console.log(JSON.parse(JSON.stringify(data)));

    return (
      <div className="full">
        <div className="ui segment basic full-w">
          <div className="ui secondary  menu">
            <div className="item">
              <h1 className="ui header">{plural}</h1>
            </div>
            <Link className="item" to={{pathname:'/c/data/'+name, query:{type:undefined}}} onClick={()=>this.filter()}
                  activeClassName="active">
              {plural}
            </Link>
            <Link className="item" to={{pathname:'/c/data/'+name, query:{type:'archive'}}}
                  onClick={()=>this.filter('archive')} activeClassName="active">
              Archiv
            </Link>
            <Link className="item" to={{pathname:'/c/data/'+name, query:{type:'trash'}}}
                  onClick={()=>this.filter('trash')} activeClassName="active">
              Papierkorb
            </Link>
            <div className="right menu">
              {selected.length > 0 && criteria !== 'archive' ?
                <a className="ui item" onClick={()=>patch(selected, {isPublished: false, _restore: true})}>
                  Archivieren ({selected.length})
                </a> : null}
              {selected.length > 0 && criteria ?
                <a className="ui item" onClick={()=>patch(selected, {isPublished: true, _restore: true})}>
                  Veröffentlichen ({selected.length})
                </a> : null}
              {selected.length > 0 && criteria !== 'trash' ? <a className="ui item" onClick={()=>remove(selected)}>
                Löschen ({selected.length})
              </a> : null}
              <div className="item">
                <div className="ui icon input">
                  <input type="text" placeholder="Search..." value={search} onChange={this.onSearch}/>
                  <i className="search link icon"></i>
                </div>
              </div>
              <Link className="ui item" to={"/c/data/"+name+"/new"}>
                Hinzufügen
              </Link>
            </div>
          </div>
          <table className="ui selectable compact celled striped definition table">
            <thead>
            <tr>
              <th style={{background: 'white',boxShadow: '0 -1px 0 1px white'}}></th>
              {schema.map(field=><HandleHeader key={field.name}
                                               changeSort={::this.changeSort} {...field} {...this.state}/>)}
            </tr>
            </thead>
            <tbody>
            {data.filter(x => !search || JSON.stringify(x).toLowerCase().indexOf(search) !== -1).map(item=>
              <tr key={item.id}>
                <td className="collapsing">
                  <div className="ui fitted slider checkbox">
                    <input type="checkbox" checked={selected.indexOf(item.id)!==-1}
                           onChange={(e)=>select(item.id)}/>
                    <label style={{overflow: 'visible'}}></label>
                  </div>
                </td>
                {schema.map(field=>
                  <HandleField field={field} item={item} key={field.name}
                               onClick={()=>push({pathname: "/c/data/"+name+"/"+item.id, query: {...this.props.location.query}})}/>)}
              </tr>)}
            </tbody>
          </table>
        </div>
        {children}
      </div>
    )
  }
}

export default observer(Collections);
