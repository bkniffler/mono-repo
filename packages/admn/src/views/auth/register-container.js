import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import ReactDOM from 'react-dom';
import Register from './register';

export default class RegisterContainer extends Component {
  static contextTypes = {
    store: PropTypes.object.isRequired,
    router: React.PropTypes.object.isRequired
  };

  constructor() {
    super();
    this.state = {
      user: null
    };
  }

  patch(patch) {
    const {user} = this.state;

    this.setState({user: {...user, ...patch}});
  }

  save() {
    const {store, router} = this.context;
    const {user} = this.state;

    const name = user.name;
    const email = user.email;
    const password = user.password;
    const password2 = user.password2;

    if (password != password2) {
      window.addNotification({
        message: "Die Passwörter stimmen nicht überein.",
        level: "danger",
        title: "Fehler bei Registrierung"
      });
    } else if (!password) {
      window.addNotification({
        message: "Es wurde kein Passwort angegeben.",
        level: "danger",
        title: "Fehler bei Registrierung"
      });
    } else if (!email) {
      window.addNotification({
        message: "Es wurde keine E-Mail-Adresse angegeben.",
        level: "danger",
        title: "Fehler bei Registrierung"
      });
    } else if (!name) {
      window.addNotification({
        message: "Es wurde kein Name angegeben.",
        level: "danger",
        title: "Fehler bei Registrierung"
      });
    } else {
      store.auth.register(name, email, password).then(user=> {
        router.push('/c/login');
        window.addNotification({
          message: "Erfolgreich registriert. E-Mail-Adresse bitte Bestätigen!",
          level: "success",
          title: "Registrierung erfolgreich"
        });
      }).catch(err=> {
        window.addNotification({
          message: "Die Registrierung ist fehlgeschlagen, bitte erneut versuchen!",
          level: "danger",
          title: "Fehler bei Registrierung"
        });
      });
    }
  }

  render() {
    const {loading} = this.props;

    return (
      <div className="login">
        <h3 className="ui inverted header">
          Neuen Zugang anfordern.
        </h3>

        <Register {...this.state.user} patch={::this.patch}/>

        <button className={"ui large submit button" + (loading ? ' loading' : '')} onClick={::this.save}>
          Absenden
        </button>

        <div className="ui center aligned segment basic">
          <div className="ui horizontal divided list">
            <Link to="/c/login" className="item" style={{color:"white", width:'170px'}}>
              <small>Zurück zur Anmeldung.</small>
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default RegisterContainer;
