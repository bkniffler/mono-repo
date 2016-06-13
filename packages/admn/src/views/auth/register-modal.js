import React, {Component, PropTypes} from "react";
import Modal from "../../components/modal";
import Register from "./register";
import {observer} from 'mobx-react';

class RegisterModal extends Component {
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
    const {user} = this.state;

    this.props.save(user);
  }

  render() {
    const {close} = this.props;

    return (
      <Modal
        save={::this.save}
        close={close}
        blank={false}
        visible={true}>
        <div className="ui vertical segment">
          <div className="ui middle aligned center aligned grid full" style={{margin: 0}}>
            <div className="column" style={{maxWidth: "500px"}}>
              <Register {...this.state.user} patch={::this.patch} />
            </div>
          </div>
        </div>
      </Modal>
    )
  }
}

export default observer(RegisterModal);
