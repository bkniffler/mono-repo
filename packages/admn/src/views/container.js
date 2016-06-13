import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {Helmet, ComposeMeta} from "powr/helmet";
import {Link} from 'react-router';
import Notification from '../components/notification';
import {sortBy, groupBy} from 'lodash';
import './container.less';


class Container extends Component {
  static metaData = ComposeMeta({
    title: 'Content Management',
    titleTemplate: '* -- Admn',
    description: 'Das neuartige Content-Management System \'Viola\'',
    author: 'bkniffler',
    image: 'https://placehold.it/200x200',
    keywords: ['awesome', 'stuff'],
    type: 'website'
  });
  static contextTypes = {store: PropTypes.object.isRequired, router: React.PropTypes.object.isRequired};

  state = {
    subMenu: null
  };

  getSubMenu(subMenu) {
    this.setState({subMenu: subMenu});
  }

  render() {
    const {children} = this.props;
    const {subMenu} = this.state;
    const {store, router} = this.context;

    var collections = store.cms.collections;

    if (!store.auth.user) {
      return (
        <div className="full">
          <Notification />
          <Helmet {...Container.metaData} />
          {children}
        </div>
      )
    }

    let _data = [];
    let _groups = !collections ? [] : groupBy(sortBy(collections.asArray, ['position', 'name']), collection=>collection.group);
    Object.keys(_groups).map(collectionGroup=> {

      if (collectionGroup === "undefined") {

        _groups[collectionGroup].map(collection=> {
          _data.push({
            name: collection.name,
            position: collection.position,
            element: (
              <NavbarItem key={collection.name} icon={collection.icon} href={'/c/data/' + collection.name}
                          label={collection.label}/>
            )
          })
        });

      } else {

        _data.push({
          name: collectionGroup,
          position: _groups[collectionGroup][0].position,
          element: (
            <NavbarItem key={collectionGroup} icon={_groups[collectionGroup][0].icon} label={collectionGroup}
                        getSubMenu={(subMenu)=>this.getSubMenu(subMenu)}>
              <div>
                {(_groups[collectionGroup] || []).map(collection=>
                  <NavbarItem key={collection.name} icon={collection.icon} href={'/c/data/' + collection.name}
                              label={collection.label}/>
                )}
              </div>
            </NavbarItem>
          )
        })
      }

    });

    _data = sortBy(_data, ['position', 'name']).map(collection=>collection.element);

    return (
      <div className="full">
        <Notification />
        <Helmet {...Container.metaData} />

        {subMenu}

        <div className="ui full inverted icon vertical sidebar menu visible cms-nav animated" style={{zIndex: 1}}>
          <div className="item" style={{padding:'7px!important', fontWeight: 100, height: 75}}>
            <img className="ui image" style={{display: "inline-block"}} src={"/img/logo-wf-white-notext.png"}/>
            ADMN
          </div>
          <NavbarItem icon="home" href="/home" label="Website"/>
          <div
            style={{ backgroundColor: "rgba(255, 255, 255, 0.15)", borderTop: "1px solid rgba(255, 255, 255, 0.18)",  borderBottom: "1px solid rgba(255, 255, 255, 0.18)" }}>
            {_data}
          </div>
          <NavbarItem icon="picture" href="/c/media" label="Mediathek"/>
          <NavbarItem icon="search" href="/c/search" label="Suche"/>
          {store.auth.user.isAdmin ? (
            <NavbarItem icon={"settings"} label={"Einstellungen"} getSubMenu={(subMenu)=>this.getSubMenu(subMenu)}>
              <NavbarItem icon="user" href={"/c/user"} label="Profil"/>
              <NavbarItem icon="users" href="/c/users" label="User-Management"/>
              <NavbarItem icon="area chart" href="/c/stats" label="Statistiken"/>
            </NavbarItem>
          ) :
            <NavbarItem icon="user" href={"/c/user"} label="Profil"/>
          }
          <NavbarItem icon="power off" onClick={()=>store.auth.logout().then(()=>router.push('/'))} label="Abmelden"/>
        </div>

        <div className="full with-cms-nav">
          {children}
        </div>
      </div>
    );
  }
}
export default Container;

class NavbarItem extends Component {
  state = {
    top: 0,
    left: 0
  };

  componentDidMount() {
    this.setPosition();
  }

  componentDidUpdate() {
    this.setPosition();
  }

  setPosition() {
    const {top, left} = this.state;
    const position = ReactDOM.findDOMNode(this.refs["parentLink"]).getBoundingClientRect();

    if (top != position.top || left != position.width) {
      this.setState({
        top: position.top,
        left: position.width
      });
    }
  }

  render() {
    const {children, getSubMenu, label, icon, href, onClick} = this.props;
    const {top, left} = this.state;

    const events = getSubMenu ? {
      onMouseEnter: ()=>subMenu(),
      onMouseLeave: ()=>getSubMenu()
    } : null;

    const subMenu = ()=>getSubMenu(
      <div className="menu_item cms_nav" style={{top: top, left: left}} {...events}>
        {children}
      </div>
    );

    const _children = (
      <div
        style={{ width: "100%", marginTop: ".5em", padding: "0 .5em", overflow: 'hidden', display: 'inline-block', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </div>
    );
    const _icon = <i className={"icon " + icon}></i>;
    const _props = {
      className: "item",
      style: {padding: ".5em 0", cursor: "pointer"},
      ref: "parentLink",
      ...events
    };

    if (href) {
      return (
        <Link {..._props} to={href} activeClassName="active">
          {_icon}
          {_children}
        </Link>
      )
    } else if (onClick) {
      return (
        <a {..._props} onClick={onClick} href="javascript:;">
          {_icon}
          {_children}
        </a>
      )
    } else {
      return (
        <div {..._props}>
          {_icon}
          {_children}
        </div>
      )
    }
  }
} 
