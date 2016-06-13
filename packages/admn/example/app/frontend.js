import React, {Component} from "react";
import {Link} from "react-router";
import {Helmet, ComposeMeta} from 'powr/helmet';
import {AppWrapper} from '../../src';

class Frontend extends Component {
  static metaData = ComposeMeta({
    title: 'Welcome',
    template: '%s - admn',
    description: 'admn cms system is great!',
    author: 'bkniffler',
    image: 'https://placehold.it/200x200',
    keywords: ['awesome', 'stuff'],
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
  });

  render() {
    const {children, navigation, user} = this.props;

    var nav = navigation['main'].filter(item => item.slug !== "/home").map(item => {
      var secondLvl = (item.children || []).map(item => {
        var thirdLvl = (item.children || []).map(item => (
          <li key={item.id}>
            <Link to={item.slug} activeClassName="active">{item.name}</Link>
          </li>
        ));
        return (
          <li key={item.id}>
            <Link to={item.slug} activeClassName="active">{item.name}</Link>
            <ul className="subsubmenu hover">
                {thirdLvl}
            </ul>
          </li>
        );
      });
      return (
        <li key={item.slug}>
          <Link key={item.id} to={item.slug} activeClassName="active">{item.name}</Link>
          <ul nav="nav" className="submenu hover">
              {secondLvl}
          </ul>
        </li>
      );
    });

    return (
      <div style={{height: "100%"}} className="frontend">
        <Helmet {...Frontend.metaData} />
        <div className="ui container">
          <Link className="row logo" to="/">
            <img src="/img/logo.png" alt="Unser Logo"/>
          </Link>
          <ul className="nav navbar-nav menu">
              {nav}
          </ul>
             {children}
             {user ? null : <Link to="/c/login">Login</Link>}
        </div>
      </div>
    );
  }
}

export default AppWrapper(Frontend, {
  color: {
    type: 'color',
    options: {null: false},
    name: 'Farbe',
    default: '#DF86A8'
  },
  logoTitle: {
    type: 'text',
    options: {null: false, max: 50},
    name: 'Logo-Titel',
    default: 'Privatklinik'
  },
  logoText: {
    type: 'text',
    options: {null: false, max: 50},
    name: 'Logo-Text',
    default: 'im GesundheitsZentrum'
  }
});
