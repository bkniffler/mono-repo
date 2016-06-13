import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import ReactDOM from 'react-dom';

export default class Register extends Component {
  static contextTypes = {
    actions: PropTypes.object.isRequired
  };

  componentDidMount() {
    const {params} = this.props;

    if (params && params.key) {
      ReactDOM.findDOMNode(this.refs.key).value = params.key;
    }
  }

  handleClick(event) {
    var {router, actions} = this.context;

    var key = ReactDOM.findDOMNode(this.refs.key).value;

    console.log(actions);

    actions.auth.activateMail(key);
  }

  render() {
    const {loading} = this.props;

    return (
      <div className="login">
        <h3 className="ui inverted header">
          Neuen Zugang anfordern.
        </h3>

        <form className="ui large form" action="javascript:void(0)" method="post">
          <div className="ui basic segment">
            <div className="field">
              <div className="ui left icon input">
                <i className="key icon"></i>
                <input type="text" placeholder="Dein Aktivierungscode" ref="key"/>
              </div>
            </div>
            <div className={"ui large submit button" + (loading ? ' loading' : '')} type="submit"
                 onClick={this.handleClick.bind(this)}>
              Bestätigen
            </div>
            <div className="ui large submit button" type="submit">
              Bestätigung erneut anfordern
            </div>
          </div>
          <div className="ui error message"></div>
        </form>
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
};

export default Register;
