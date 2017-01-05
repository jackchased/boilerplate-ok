import React, {PropTypes} from 'react';
import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton';
import LinearProgress from 'material-ui/LinearProgress';

var defaultJoinTime = 60;

var NavBar = React.createClass({
    propTypes: {
        title: PropTypes.string.isRequired,
        timeLeft: PropTypes.number.isRequired,
        onClick: PropTypes.func.isRequired,
    },

    render: function () {
        let permitTimeLeft = this.props.timeLeft;
        let iconRight = permitTimeLeft !== 0 ?
            <LinearProgress style={{position: "absolute", top: "50%", bottom: "0", left: "85%", right: "0", margin: "0", width: '120px'}} color='#F2784B' mode="determinate" max={defaultJoinTime} value={permitTimeLeft}/> : 
            <FlatButton style={{position: "absolute", top: "10%", bottom: "0", left: "85%", right: "0", margin: "0", fontFamily: 'sans-serif'}} label="Permit join" onClick={this.props.onClick}/>;

        return (
            <AppBar
                title={this.props.title}
                titleStyle={{fontFamily: 'sans-serif', textAlign: 'center'}}
                iconElementLeft={<div/>}
                iconElementRight = {iconRight}
                style={{backgroundColor: '#CC0000'}}
            />
        );
    }
});

export default NavBar
