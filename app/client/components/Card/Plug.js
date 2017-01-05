import React, { PropTypes } from 'react';
import PlugOnIcon from '../Icons/PlugOnIcon';
import PlugOffIcon from '../Icons/PlugOffIcon';

const Plug = React.createClass({
    propTypes: {
        enable: PropTypes.bool.isRequired,
        value: PropTypes.bool.isRequired,
        onClick: PropTypes.func.isRequired,
        ieeeAddr: PropTypes.string.isRequired,
        epId: PropTypes.number.isRequired,
        cid: PropTypes.string.isRequired
    },

    handleClick: function () {
        let plugValue = !this.props.value;
        this.props.onClick(this.props, plugValue);
    },

    render: function () {
        let enable = this.props.enable;
        let cardBgColor = enable ? "#72E599" : "#BDBDBD";
        let onClick = enable ? this.handleClick : function () {};

        let icon = this.props.value ? <PlugOnIcon /> : <PlugOffIcon />;

        return (
            <div style={{width: '100%', height: '100%', backgroundColor: cardBgColor}}
                 onClick={onClick}>
                {icon}
            </div>
        );
    }
});

export default Plug
