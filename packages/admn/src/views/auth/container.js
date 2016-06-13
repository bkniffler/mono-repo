import React, {Component, PropTypes} from 'react';
import './container.less';


export default class App extends Component {
    render() {
        const {children} = this.props;

        return (
            <div className="ui middle aligned center aligned grid full animatedBG" style={{margin: 0}}>
                <div className="column" style={{ maxWidth: "500px"}}>
                    <img src={"/img/logo-wf-white-notext.png"}
                         width="178" height="auto" className="image"
                         style={{marginTop:"-100px", paddingBottom:'30px'}}/>
                    {children}
                </div>
            </div>
        );
    }
};
