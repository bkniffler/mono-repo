import React, {Component, PropTypes} from "react";
import Modal from "../../../components/modal";
import AutoForm from "../../../components/auto-form";
import {observer} from 'mobx-react';

class DetailContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      item: JSON.parse(JSON.stringify(props.item))
    }
  }

  patch = (patch) => {
    var item = this.state.item;
    for (var key in patch) {
      item[key] = patch[key];
    }
    this.setState({item: item});
  }

  save = () => {
    this.props.save(this.state.item);
    this.close();
  }

  close = () => {
    const {close} = this.props;
    close();
  }

  render() {
    const {name, label, collection} = this.props;

    var schema = {};
    this.props.schema.forEach(x=> {
      schema[x.name] = x;
    });

    return (
      <Modal save={this.save} close={this.close} blank={false} visible={true}>
        <AutoForm onChange={this.patch} plugins={collection.plugins} schema={schema} name={name} title={label} subTitle={'Bearbeiten'}
                  value={this.state.item}/>
      </Modal>
    )
  }
}

export default observer(DetailContainer);
