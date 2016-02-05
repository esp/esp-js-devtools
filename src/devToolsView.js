import './devToolsView.less'

import $ from 'jquery';
import "jquery-ui/draggable";

import esp from 'esp-js';
import _ from 'lodash';
import moment from 'moment';
import vis from 'vis';
import 'vis/dist/vis.css';
import UpdateType from './updateType';
import template from './devToolsView.template.html';

export default class DevToolsView extends esp.model.DisposableBase {

    constructor(router) {
        super();
        this._router = router;
        this._timelineGroups = new vis.DataSet();
        this._timelineData = new vis.DataSet();
        this._timeline = null;
        this._autoscrollCheckbox = null;
        this._eventDetailsDescriptionP = null;
    }

    start() {
        this._createDevToolsElements();
        this.addDisposable(
            this._router.getModelObservable()
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

                    if (this._timeline && this._autoscrollCheckbox) {
                        this._timeline.setOptions({max: moment().add(2, 'm')})
                        if (model.shouldAutoScroll) {
                            this._setTimelineWindow();
                        }
                        if(this._autoscrollCheckbox.prop('checked') !== model.shouldAutoScroll) {
                            this._autoscrollCheckbox.prop('checked', model.shouldAutoScroll);
                        }

                        if(this._eventDetailsDescriptionP && model.selectedEvent) {
                            this._eventDetailsDescriptionP.html(JSON.stringify(model.selectedEvent));
                        }
                    }
                })
        );
    }

    _createDevToolsElements() {
        let _this = this;
        $(() => {
            let container = $(template);
            this._autoscrollCheckbox = container.find('#autoscrollCheckbox');
            this._autoscrollCheckbox.change(function () { // note use of function so 'this' is the checkbox
                _this._router.publishEvent('autoscrollToggled', {shouldAutoScroll: this.checked});
            });
            this._eventDetailsDescriptionP = container.find('#eventDetailsDescription');

            let inner = $("<div class='inner'></div>");
            container.append(inner);
            container.draggable({
                cursor: 'move',
                handle: '#header'
            });
            let options = {
                groupOrder: 'content',
                showCurrentTime: true,
                selectable: true,
                stack: false,
                min: moment().subtract(1, 'm'),
                max: moment().add(10, 'm'),
                //min: new Date(),                // lower limit of visible range
                ////max: new Date(2013, 0, 1),                // upper limit of visible range
                // zoomMin: 1000 * 60 * 60 * 24,             // one day in milliseconds
                //zoomMax: 1000 * 60 * 60 * 24     // one day in milliseconds
            };
            this._timeline = new vis.Timeline(inner[0]);
            this._timeline.setOptions(options);
            this._timeline.setGroups(this._timelineGroups);
            this._timeline.setItems(this._timelineData);
            this._wireUpTimelineEvents(this._timeline);
            this._setTimelineWindow();
            $('body').append(container);
        });
    }

    _setTimelineWindow() {
        this._timeline.setWindow(moment().subtract(1, 'm'), moment().add(20, 's'))
    }

    _wireUpTimelineEvents(timeline) {
        timeline.on('select', properties => {
            let pointId = properties.items[0];
            this._router.publishEvent(
                'eventSelected', {
                    eventNumber: pointId
                }
            );
        });
        timeline.on('click', properties => { this._disableAutoScroll() });
        timeline.on('doubleClick', properties => { this._disableAutoScroll() });
        timeline.on('timechanged', properties => { this._disableAutoScroll() });
        timeline.on('groupDragged', properties => { this._disableAutoScroll() });
    }

    _disableAutoScroll() {
        this._router.publishEvent('disableAutoScroll', {});
    }
}