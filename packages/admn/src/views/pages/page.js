import React, {Component, PropTypes} from 'react';
import {Helmet, ComposeMeta} from "powr/helmet";
import Draft from '../../edits/draft';
import SettingsPage from "./settings/page";
import LibraryView from "./blocks";
import {observer} from 'mobx-react';
import Portal from 'react-portal';

class EmptyTemplate extends Component {
  render() {
    return <div>{this.props.children}</div>;
  }
}

class Page extends Component {
  static contextTypes = {
    templates: React.PropTypes.object,
    blocks: React.PropTypes.object,
    store: React.PropTypes.object
  }

  static onEnter(next, replaceState, store, actions) {
    const {loadPage, meta} = store.cms;
    const slug = next.params.splat || meta.startPage || 'home';

    if (slug === 'new' || next.location.pathname.indexOf('/new', next.location.pathname.length - '/new'.length) !== -1 || next.location.pathname.indexOf('/new?') !== -1) {
      return activate({
        blocks: [], parent: next.location.query ? next.location.query.parent : null,
        menu: next.location.query ? next.location.query.menu : null
      });
    }
    else {
      // By id
      if (slug.length === 36 && slug.split('-').length === 5) {
        return loadPage(slug);
      }
      if (slug.indexOf('ref/') === 0) {
        return loadPage(slug.substring(4)).then(x=> {
          replaceState(x.slug);
        });
      }
      else if (next.params.revision) {
        return loadPage('/' + slug).then((data)=>loadRevision(data.result.id, next.params.revision));
      }
      else if (next.params.id) {
        return loadPage(next.params.id);
      }
      // By slug
      else {
        return loadPage('/' + slug).then(x=> {
          if (!x) {
            replaceState('/error?url=' + slug);
          }
        });
      }
    }
  }

  constructor() {
    super();
    this.state = {
      sidebarOpen: false
    }
  }

  update(patch) {
    const {page} = this.context.store.cms;
    const {user} = this.context.store.auth;

    if (user) {
      for (var key in patch) {
        page[key] = patch[key];
      }
    }
  }

  save() {
    const {page, savePage} = this.context.store.cms;
    savePage(page).then(page=> {
      window.addNotification({
        message: "Erfolgreich gespeichert.",
        level: "success",
        title: "Gespeichert"
      });
    });
  }

  delete() {
    const {page, deletePage} = this.context.store.cms;
    var r = confirm("Wollen Sie die Seite wirklich löschen?");
    if (r == true) {
      deletePage(page).then(page=> {
        window.addNotification({
          message: "Erfolgreich gelöscht.",
          level: "success",
          title: "Gespeichert"
        });
      });
    }
  }

  render() {
    const {actions, template} = this.props;
    const {templates} = this.context;
    const {page, navigation, savePage} = this.context.store.cms;

    const {user} = this.context.store.auth;

    // Template oder einfach ein <div>
    var templateName = page ? (page.templateName || 'default') : 'default';

    var Template;
    if (templates && templateName) {
      for(var key in templates){
        if(key.toLowerCase() === templateName.toLowerCase()) {
          Template = templates[key];
        }
      }
    }
    if (!Template) {
      Template = EmptyTemplate;
    }
    
    var templateData = {
      ...(page.template ? page.template.json : {}),
      ...page.templateData
    };

    const meta = ComposeMeta({title: page.name, author: 'bkniffler'});
    var value = page.blocks;
    if (!value || !value.blocks) value = null;
    return (
      <Template {...this.props} templateData={templateData} page={page} navigation={navigation} user={user}>
        <Helmet {...meta} />
        <Draft readOnly={!user || page.computed} value={value} updateValue={(v)=>this.update({blocks:v})}
               blockTypes={this.context.blocks}/>
        {user && !page.computed ? <Portal isOpened={true}>
          <div className="ui center aligned grid"
               style={{position: 'fixed', right:0, top:10, width:'240px', zIndex: 5}}>
            <div className="column sixteen wide no-margin">
              <div className="circular ui icon button simple dropdown item" href="javascript:;">
                <i className="icon block layout"></i>
                <div className="menu"
                     style={{zIndex: 3, right: 0, left: 'initial', width: '300px', maxHeight: '600px', overflowY: 'scroll'}}>
                  <div className="ui segment basic">
                    <LibraryView {...this.props}/>
                  </div>
                </div>
              </div>
              <div className="circular ui icon button simple dropdown item" href="javascript:;">
                <i className="icon setting"></i>
                <div className="menu" style={{zIndex: 3, right: 0, left: 'initial', width: '300px'}}>
                  <div className="ui segment basic">
                    <SettingsPage templates={templates} navigation={navigation} page={page} patch={::this.update}/>
                  </div>
                </div>
              </div>
              <div className="circular ui icon button" href="javascript:;" onClick={::this.save}>
                <i className="icon save"></i>
              </div>
              <div className="circular ui icon button" href="javascript:;" onClick={::this.delete}>
                <i className="icon trash"></i>
              </div>
            </div>
          </div>
        </Portal> : null}
      </Template>
    );
  }
}
export default observer(Page);
