import React, {Component, PropTypes} from 'react';
import {Input} from '../../edits';

export default class Register extends Component {
  render() {
    const {name, email, password, password2, patch} = this.props;

    return (
      <form className="ui large form" action="javascript:void(0)" method="post">
        <div className="ui basic segment">
          <div className="ui horizontal divider">Persönliche Daten</div>
          <div className="field">
            <div className="ui left icon input">
              <i className="user icon"></i>
              <Input type="text" placeholder="Name" value={name} updateValue={v=>patch({name: v})}/>
            </div>
          </div>
          <div className="ui horizontal divider">Zugangsdaten</div>
          <div className="field">
            <div className="ui left icon input">
              <i className="mail icon"></i>
              <Input type="email" placeholder="E-Mail-Adresse" value={email} updateValue={v=>patch({email: v})}/>
            </div>
          </div>
          <div className="field">
            <div className="ui left icon input">
              <i className="lock icon"></i>
              <Input type="password" placeholder="Passwort" value={password} updateValue={v=>patch({password: v})}/>
            </div>
          </div>
          <div className="field">
            <div className="ui left icon input">
              <i className="lock icon"></i>
              <Input type="password" placeholder="Passwort wiederholen" value={password2} updateValue={v=>patch({password2: v})}/>
            </div>
          </div>
        </div>
      </form>
    );
  }
}

export default Register;
