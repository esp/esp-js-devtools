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
                                content: `Model id <span style="color:#97B0F8;">[${registeredModel.modelId}]</span>`
                            });
                        }
                    } else if (model.updateType === UpdateType.eventsChanged) {
                        this._timelineData.add({
                            id: model.lastEvent.eventNumber,
                            group: model.lastEvent.modelId,
                            title: model.lastEvent.eventType,
                            start: model.lastEvent.publishedTime,
                        });
                    }
                })
        );
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
                showCurrentTime: true,
                selectable:true,
                stack: false,
                min: new Date(),                // lower limit of visible range
                //max: new Date(2013, 0, 1),                // upper limit of visible range
                zoomMin: 1000 * 60 * 60 * 24,             // one day in milliseconds
                zoomMax: 1000 * 60 * 60 * 24     // one day in milliseconds
            };
            var timeline = new vis.Timeline(inner[0]);
            timeline.setOptions(options);
            timeline.setGroups(this._timelineGroups);
            timeline.setItems(this._timelineData);
            this._wireUpTimelineEvents(timeline);
            $('body').append(container);
            this._uiCreated = true;
        });
    }
    _wireUpTimelineEvents(timeline) {
        timeline.on('select', properties =>{
            let pointId = properties.items[0];
            this._router.publishEvent(
                'eventSelected', {
                    eventNumber:pointId
                }
            );
        });
        timeline.on('select', properties =>{
            let pointId = properties.items[0];
            this._router.publishEvent(
                'eventSelected', {
                    eventNumber:pointId
                }
            );
        });
    }
}