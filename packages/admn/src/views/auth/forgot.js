import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {Link} from 'react-router';

export default class Forgot extends Component {
  static contextTypes = {
    store: PropTypes.object.isRequired,
    router: React.PropTypes.object.isRequired
  };

  componentDidMount() {
    var {location} = this.props;
    const {query} = location;
    if (query && query.email) {
      ReactDOM.findDOMNode(this.refs.email).value = query.email;
    }
  }

  handleClick(event) {
    const {store, router} = this.context;
    
    const email = ReactDOM.findDOMNode(this.refs.email);

    store.auth.forgot(email.value).then(user=> {
      router.push('/c/login');
      window.addNotification({
        message: "Ein Link zum Zurücksetzen Ihres Passwortes wurde an das angegebene Konto versandt!",
        level: "success",
        title: "Link versandt!"
      });
    }).catch(err=> {
      window.addNotification({
        message: "Das angegebene Konto konnte nicht gefunden werden!",
        level: "danger",
        title: "Konto nicht gefunden!"
      });
    });
  }

  render() {
    return (
      <div className="login">
        <h3 className="ui inverted header">
          Dein Passwort zurücksetzen.
        </h3>

        <form className="ui large form" action="javascript:void(0)" method="post" ng-submit="reset()">
          <div className="ui basic segment">
            <div className="field">
              <div className="ui left icon input">
                <i className="Mail icon"></i>
                <input type="text" placeholder="Deine E-Mail" ref="email"/>
              </div>
            </div>
            <div className="ui large submit button" type="submit" onClick={this.handleClick.bind(this)}>
              Zurücksetzen
            </div>
          </div>
          <div className="ui error message"></div>
        </form>
        <div className="ui center aligned segment basic">
          <div className="ui horizontal divided list">
            <Link to="/c/login" className="item" style={{color:"white", width:'170px'}}>
              Zurück zur Anmeldung
            </Link>
            <Link to="/c/register" className="item" style={{color:"white", width:'170px'}}>
              Neues Konto anmelden
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default Forgot;
