import './devToolsView.less'

import $ from 'jquery';
import "jquery-ui/draggable";

import moment from 'moment';
import vis from 'vis';
import 'vis/dist/vis.css';


export default function () {

    var now = moment(); //.minutes(0).seconds(0).milliseconds(0);
    var groupCount = 3;
    var itemCount = 20;

    // create a data set with groups
    var names = ['John', 'Alston', 'Lee', 'Grant'];
    var groups = new vis.DataSet();
    for (var g = 0; g < groupCount; g++) {
        groups.add({id: g, content: names[g]});
    }

    // create a dataset with items
    var items = new vis.DataSet();
    for (var i = 0; i < itemCount; i++) {
        var start = moment(now).add(Math.random() * 200, 'hours');
        var group = Math.floor(Math.random() * groupCount);
        items.add({
            id: i,
            group: group,
            content: 'item ' + i +
            ' <span style="color:#97B0F8;">(' + names[group] + ')</span>',
            start: start,
            type: 'box'
        });
    }

    $(() => {
        var container = $( "<div id='esp-js-devtool-container'><div id='handle'>x</div></div>" );
        var inner =  $( "<div class='inner'></div>" );
        container.append(inner);
        container.draggable({
            cursor: "move",
            handle: "#handle"
        });
        var options = {
            groupOrder: 'content'
        };
        var timeline = new vis.Timeline(inner[0]);
        timeline.setOptions(options);
        timeline.setGroups(groups);
        timeline.setItems(items);

        $( 'body' ).append( container  );

    })
}