import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import ReactDOM from 'react-dom';

export default class Login extends Component {
  static onEnter(next, transition, store) {
    if (store.auth && store.auth.user) {
      transition("/");
    }
  }

  static contextTypes = {
    store: PropTypes.object.isRequired,
    router: React.PropTypes.object.isRequired
  };

  componentDidMount() {
    const {query} = this.props.location;

    if (query && query.user) {
      ReactDOM.findDOMNode(this.refs.email).value = query.user;
    }
  }

  handleClick(event) {
    const {store, router} = this.context;
    const email = ReactDOM.findDOMNode(this.refs.email);
    const password = ReactDOM.findDOMNode(this.refs.password);

    store.auth.login(email.value, password.value).then(user=> {
      router.push('/');
      window.addNotification({
        message: "Erfolgreich eingeloggt.",
        level: "success",
        title: "Login erfolgreich"
      });
    }).catch(err=> {
      window.addNotification({
        message: "Die Zugangsdaten sind fehlerhaft.",
        level: "danger",
        title: "Login fehlgeschlagen"
      });
    });
  }

  render() {
    const {loading} = this.props;

    return (
      <div className="login">
        <h3 className="ui inverted header">
          Mit Deinen Benutzerdaten anmelden.
        </h3>

        <form className="ui large form" action="javascript:void(0)" method="post">
          <div className="ui basic segment">
            <div className="field">
              <div className="ui left icon input">
                <i className="mail icon"></i>
                <input type="text" name="email" placeholder="Deine E-Mail" ref="email"/>
              </div>
            </div>
            <div className="field">
              <div className="ui left icon input">
                <i className="lock icon"></i>
                <input type="password" name="password" placeholder="Dein Passwort" ref="password"/>
              </div>
            </div>
            <button className={"ui large submit button" + (loading ? ' loading' : '')} type="submit"
                    onClick={this.handleClick.bind(this)}>
              Anmelden
            </button>
          </div>
          <div className="ui error message"></div>
        </form>
        <div className="ui center aligned segment basic">
          <div className="ui horizontal divided list">
            <Link to="/c/forgot" className="item" style={{color:"white", width:'170px'}}>
              Passwort vergessen?
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

export default Login;
