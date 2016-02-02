import React from 'react';

import './devToolsView.less'

export default class DevToolsView extends React.Component {
    constructor() {
        super();
        this.state = {

        };
    }

    shouldComponentUpdate(nextProps) {
       return true;
    }

    componentDidMount() {
    }

    componentDidUpdate() {
    }

    render() : React.Element {
        return (<div id='esp-js-devtool-container'>hi</div>);
    }
}

DevToolsView.propTypes = {
};
