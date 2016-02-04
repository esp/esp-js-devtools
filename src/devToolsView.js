import './devToolsView.less'

import $ from 'jquery';
import "jquery-ui/draggable";

import esp from 'esp-js';
import _ from 'lodash';
import moment from 'moment';
import vis from 'vis';
import 'vis/dist/vis.css';
import UpdateType from './updateType';

export default class DevToolsView extends esp.model.DisposableBase {

    constructor(router) {
        super();
        this._router = router;
        this._timelineGroups = new vis.DataSet();
        this._timelineData = new vis.DataSet();
        this._uiCreated = false;
    }

    start() {
        this._createDevToolsElements();
        this.addDisposable(
            this._router.getModelObservable()
                // .where(model => this._uiCreated)
                .observe(model => {
                    if (model.updateType === UpdateType.modelsChanged) {
                        for (var i = 0; i < model.registeredModels.length; i++) {
                            var registeredModel = model.registeredModels[i];
                            this._timelineGroups.update({
                                id: registeredModel.modelId,
                                content: `Model id [${registeredModel.modelId}]`
                            });
                        }
                    } else if (model.updateType === UpdateType.eventsChanged) {
                        this._timelineData.add({
                            id: model.lastEvent.eventNumber,
                            group: model.lastEvent.modelId,
                            //content: 'item ' + i +
                            //' <span style="color:#97B0F8;">(' + names[group] + ')</span>',
                            start: model.lastEvent.publishedTime,
                           // type: 'box'
                        });
                    }
                })
        );
        //var now = moment(); //.minutes(0).seconds(0).milliseconds(0);
        //var groupCount = 3;
        //var itemCount = 20;
        //
        //// create a data set with groups
        //var names = ['John', 'Alston', 'Lee', 'Grant'];
        //var groups = new vis.DataSet();
        //for (var g = 0; g < groupCount; g++) {
        //    groups.add({id: g, content: names[g]});
        //}

        // create a dataset with items
        //var items = new vis.DataSet();
        //for (var i = 0; i < itemCount; i++) {
        //    var start = moment(now).add(Math.random() * 200, 'hours');
        //    var group = Math.floor(Math.random() * groupCount);
        //    items.add({
        //        id: i,
        //        group: group,
        //        content: 'item ' + i +
        //        ' <span style="color:#97B0F8;">(' + names[group] + ')</span>',
        //        start: start,
        //        type: 'box'
        //    });
        //}

    }

    _createDevToolsElements() {
        $(() => {
            var container = $("<div id='esp-js-devtool-container'><div id='handle'>x</div></div>");
            var inner = $("<div class='inner'></div>");
            container.append(inner);
            container.draggable({
                cursor: "move",
                handle: "#handle"
            });
            var options = {
                groupOrder: 'content',
                showCurrentTime: true
            };
            var timeline = new vis.Timeline(inner[0]);
            timeline.setOptions(options);
            timeline.setGroups(this._timelineGroups);
            timeline.setItems(this._timelineData);
            $('body').append(container);
            this._uiCreated = true;
        });
    }
}