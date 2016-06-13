import React, {Component, PropTypes} from "react";
import {Link} from "react-router";
import Tree from "./../../components/tree";
//import Tree from "react-ui-tree";
import GeneralModal from "./settings/general-modal";
import Modal from '../../components/modal';
import NewPageModal from './settings/new-page-modal';

import './react-ui-tree.less';
import './main.less';

export default class Main extends Component {
  static contextTypes = {
    store: React.PropTypes.object,
    router: React.PropTypes.object,
    metaOptions: React.PropTypes.object
  };

  constructor() {
    super();
    this.state = {
      item: null,
      settings: null
    }
  }

  handleSort = ({tree}) => {
    const {page} = this.props;
    const {store} = this.context;
    store.cms.saveNavigation(tree).then(()=> {
      window.addNotification({
        message: "Navigation gespeichert.",
        level: "success",
        title: "Gespeichert"
      });
      if (page) {
        //loadOne(page.id);
      }
    });
  }

  renderTreeNode = node => {
    return (
      <div className="shortLink">
        <Link to={node.slug} activeClassName={'active'} className="hover-icon tree-node">
          {node.name}
        <span onClick={(e)=>this.setState({item: {parent: node.slug}})} className="icon" href="javascript:;">
           <i className="icon plus"/>
        </span>
        </Link>
      </div>
    )
  }

  save = (p) => {
    const {router, store} = this.context;
    const {savePage} = store.cms;
    savePage(p).then(page=> {
      window.addNotification({
        message: "Erfolgreich gespeichert.",
        level: "success",
        title: "Gespeichert"
      });
      router.push(page.slug);
      this.setState({item: false})
    });
  }

  saveMeta = (p) => {
    const {store} = this.context;
    const {saveMeta} = store.cms;
    saveMeta(p).then(page=> {
      window.addNotification({
        message: "Erfolgreich gespeichert.",
        level: "success",
        title: "Gespeichert"
      });
      this.setState({settings: false})
    });
  }

  updateNavigation = (menu, newTree) => {
    const {navigation, page} = this.props;
    const {store} = this.context;
    //const {updateNav, loadOne} = actions.page;

    if (!this.compareTrees(newTree.children, navigation[menu])) {
      var r = confirm('Soll die Navigation gespeichert werden?');
      if (r == true) {
        store.cms.saveNavigation(newTree.children).then(()=> {
          window.addNotification({
            message: "Navigation gespeichert.",
            level: "success",
            title: "Gespeichert"
          });
          if (page) {
            //loadOne(page.id);
          }
        });
      } else {
        store.cms.loadNavigation();
      }
    }
  }

  render() {
    const {navigation, children} = this.props;
    const {item, settings} = this.state;

    const {store} = this.context;
    const {meta} = store.cms;

    return (
      <div className="full">
        <Modal visible={item} close={()=>this.setState({item: null})} title="Neue Seite">
          <NewPageModal {...this.props} {...this.state} item={item} close={()=>this.setState({item: false})}
                                                        save={this.save}/>
        </Modal>
        <Modal visible={settings} close={()=>this.setState({settings: false})} title="Allgemeine Einstellungen">
          <GeneralModal {...this.props} {...this.context} meta={meta} close={()=>this.setState({settings: null})}
                                                          save={this.saveMeta}/>
        </Modal>
        <div className="pages-main sub-sidebar">
          <div className="ui segment basic no-margin" style={{paddingBottom: 0}}>
            <h1 style={{flex: "0 0 auto"}} className="ui header center aligned icon disabled">
              <i className="huge file text icon"></i>
              <a className="sub header" href="javascript:;" onClick={()=>this.setState({item: true})}>Neue Seite</a>
              <a className="sub header" href="javascript:;" onClick={()=>this.setState({settings: true})}>Meta-Einstellungen</a>
            </h1>
          </div>

          <div className="ui divider no-spacing-top"/>
          <div className="ui segment basic no-spacing-top">
            <h5 className="ui sub disabled header hover-icon" style={{marginBottom: '5px'}}>
              Hauptnavigation
              <a onClick={(e)=>this.setState({item: true})} className="icon" href="javascript:;" to={"/new"}>
                <i className="icon plus"/>
              </a>
            </h5>
            <h5 className="ui sub header" style={{marginBottom: '5px', marginTop: 0}}>
              <Tree onSort={this.handleSort} dynamic tree={navigation['main']} renderNode={this.renderTreeNode}
                    filter={x=>!x.computed}/>
            </h5>
            <h5 className="ui sub disabled header hover-icon" style={{marginBottom: '5px'}}>
              Fußnavigation
              <a onClick={(e)=>this.setState({item: {menu: 'foot'}})} className="icon" href="javascript:;"
                 to={"/new?menu=foot"}>
                <i className="icon plus"/>
              </a>
            </h5>
            <h5 className="ui sub header" style={{marginBottom: '5px', marginTop: 0}}>
              <Tree onSort={this.handleSort} dynamic tree={navigation['foot']} renderNode={this.renderTreeNode}
                    filter={x=>!x.computed}/>
            </h5>
          </div>
        </div>
        <div className="full with-sub-sidebar">
          {children}
        </div>
      </div>
    );
  }
}
