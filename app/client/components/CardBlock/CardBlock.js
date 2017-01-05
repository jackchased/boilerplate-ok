import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import GridLayout from 'react-grid-layout';
import {WidthProvider} from 'react-grid-layout';

import {Temperature, Plug} from '../Card/Card';

var ReactGridLayout = WidthProvider(GridLayout);

var keyCounter,
    layoutDataGrids;

var CardBlock = React.createClass({
    propTypes: {
        devs: PropTypes.object.isRequired
    },
    // 123
    getGads: function(epInfo) {
        var props = [];

        switch (epInfo.devId) {
            case 81:   // smartPlug
                if (epInfo.clusters.genOnOff) {
                    props.push({
                        type: 'plug',
                        epId: epInfo.epId,
                        cid: 'genOnOff',
                        value: !!epInfo.clusters.genOnOff.attrs.onOff
                    });
                }
                break;
            case 770:  // temperatureSensor
                if (epInfo.clusters.msTemperatureMeasurement) {
                    props.push({
                        type: 'temperature',
                        epId: epInfo.epId,
                        cid: 'msTemperatureMeasurement',
                        value: epInfo.clusters.msTemperatureMeasurement.attrs.measuredValue / 100
                    });
                }
                break;
            default:
                return;
        }

        return props;
    },

    getCard: function (ieeeAddr, status, gad) {
        var enable = (status === 'online') ? true : false,
            card,
            cardProps = {};

        switch (gad.type) {
            case 'temperature':
                cardProps.key = 'bigCard0';
                cardProps.dataGrid = {x: 3, y: 0, w: 2, h: 2};
                card = (<Temperature enable={enable} ieeeAddr={ieeeAddr} epId = {gad.epId} cid={gad.cid} value={gad.value} />);
                break;
            case 'plug':
                cardProps.key = 'smallCard0';
                cardProps.dataGrid = {x: 5, y: 0, w: 1, h: 2};
                card = (<Plug enable={enable} ieeeAddr={ieeeAddr} epId = {gad.epId} cid={gad.cid} value={gad.value} onClick={this.props.onClick} />);
                break;
            default:
                return;
        }

        return (
            <div key={cardProps.key} data-grid={cardProps.dataGrid}>
                {card}
            </div>
        );
    },

    getRowHeight: function () {
        var rowHeight;

        if (window.matchMedia("(min-width: 1800px)").matches) {
            rowHeight = 70;
        } else if (window.matchMedia("(min-width: 1400px)").matches) {
            rowHeight = 60;
        } else if (window.matchMedia("(min-width: 1000px)").matches) {
            rowHeight = 45;
        } else if (window.matchMedia("(min-width: 600px)").matches) {
            rowHeight = 35;
        } else {
            rowHeight = 20;
        }

        return rowHeight;
    },

    render: function () {
        var self = this,
            allCards = [],
            rowHeight = this.getRowHeight(),
            devs = this.props.devs;

        for (var ieeeAddr in devs) {
            var devInfo = devs[ieeeAddr];

            devInfo.epList.forEach(function (epId) {
                var gads = self.getGads(devInfo[epId]);

                gads.forEach(function (gad) {
                    var card = self.getCard(ieeeAddr, devInfo.status, gad);
                    if (card) allCards.push(card);
                })
            });
        }

        return (
            <div style={{margin:'1% 0%'}}>
                <ReactGridLayout cols={9} rowHeight={rowHeight} isDraggable={false}>
                    {allCards}
                </ReactGridLayout>
            </div>
        );
    }
});

export default CardBlock
