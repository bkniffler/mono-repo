import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';

import {Image, Tags} from '../../../edits';
import {Input, Select2, Json} from '../../../edits';
import {Helmet, ComposeMeta} from "powr/helmet";
import moment from "moment";

export default class MediaDetail extends Component {
  static contextTypes = {
    store: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.state = {
      item: null
    };
  }

  componentDidMount() {
    const {store} = this.context;
    store.media.loadOne(this.props.params.id).then(item=> {
      this.setState({item});
    });
  }

  componentDidUpdate(props) {
    if (this.props.params.id !== props.params.id) {
      this.componentDidMount();
    }
  }

  getLink(item) {
    let link = '/home';
    const id = item.documentId || item.id;
    if (item.model === 'page') {
      link = '/ref/' + id;
    }
    else if (item.model === 'media') {
      link = '/c/media/' + id;
    }
    else if (item.model === 'user') {
      link = '/c/user/' + id;
    }
    else if (item.model) {
      link = '/c/data/' + item.model + '/' + id;
    }
    return link;
  }

  save() {
    const {item} = this.state;
    const {save} = this.context.store.media;

    save(item).then(()=> {
      window.addNotification({
        message: "Datei wurde gespeichert.",
        level: "success",
        title: "Status"
      });
    });
  }

  remove = () =>{
    const {item} = this.state;
    const {push} = this.context.router;
    const {remove} = this.context.store.media;

    remove(item).then(x => {
      push("/c/media");
    });
  }

  render() {
    const {item} = this.state;

    if (!item) {
      return <div className="ui basic segment no-spacing-top loading" style={{minHeight:'500px'}}/>;
    }

    const _usages = (item.usages || []).map((item)=> {
      return (
        <li key={item.model+'-'+item.documentId}>
          <Link to={this.getLink(item)}>{item.model} - {item.documentId}</Link>
        </li>
      );
    });
    if (_usages.length === 0) {
      _usages.push(
        <li key={'nada'}>
          <a>Keine Nutzungen</a>
        </li>
      );
    }

    return (
      <div className="ui basic segment no-spacing-top" style={{minHeight:'500px'}}>
        <div className="full-wh">
          <Helmet {...ComposeMeta({title: item.comment})} />
          <div className="ui secondary menu no-spacing-top">
            <div className="item">
              <h1 className="ui header">Bild</h1>
            </div>
            <div className="right menu">
              <a className="item" onClick={::this.save} href="javascript:;">
                Speichern
              </a>
              <a className="item" onClick={()=>this.remove(item)} href="javascript:;">
                Löschen
              </a>
            </div>
          </div>
          <div className="ui form">
            <div className="field">
              <label>Author</label>
              <Input value={item.author} updateValue={(v)=>this.setState({item: {...item, author: v}})}/>
            </div>
            <div className="field">
              <label>Kommentar</label>
              <Input value={item.comment} updateValue={(v)=>this.setState({item: {...item, comment: v}})}/>
            </div>
            <div className="field">
              <label>Schlagworte</label>
              <Tags value={item.tags} updateValue={(v)=>this.setState({item: {...item, tags: v}})}/>
            </div>
            <div className="field">
              <label>Bild</label>
              <Image value={item} width={200} lightbox={true}/>
            </div>
            <div className="field">
              <label>Informationen</label>
              <ul className="dropdown-menu pos-stc inline">
                <li>Originalbezeichnung: {item.original}</li>
                <li>Auflösung (B x H): {item.width} x {item.height} px</li>
                <li>Größe: {(item.size / 1024).toFixed(2)} kB</li>
                <li>Letzte Änderung: {moment(item.updatedAt).format("D. MMMM YYYY, HH:mm")} Uhr</li>
              </ul>
            </div>
            <div className="field">
              <label>Nutzungen</label>
              <ul className="dropdown-menu pos-stc inline">
                {_usages}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
