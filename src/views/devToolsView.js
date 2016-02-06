import $ from 'jquery';
import "jquery-ui/draggable";
import esp from 'esp-js';
import _ from 'lodash';
import moment from 'moment';
import vis from 'vis';
import 'vis/dist/vis.css';
import './devToolsView.less'
import UpdateType from '../model/updateType';
import template from './devToolsView.template.html';

export default class DevToolsView extends esp.model.DisposableBase {

    constructor(router) {
        super();
        this._router = router;
        this._timelineGroups = new vis.DataSet();
        this._timelineData = new vis.DataSet();
        this._timeline = null;
        this._autoscrollCheckbox = null;
        this._captureEventsCheckbox = null;
        this._logEventsConsoleCheckbox = null;
        this._resetChartButton = null;
        this._closeButton = null;
        this._eventDetailsDescriptionP = null;
        this._footer = null;
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
                                content: registeredModel.modelId
                            });
                        }
                    } else if (model.updateType === UpdateType.eventsChanged) {
                        this._timelineData.add({
                            id: model.lastEvent.eventNumber,
                            group: model.lastEvent.modelId,
                            title: model.lastEvent.eventType,
                            start: model.lastEvent.publishedTime
                        });
                    } else if (model.updateType === UpdateType.reset) {
                        this._timelineGroups.clear();
                        this._timelineData.clear();
                    }

                    if (this._timeline) {
                        this._timeline.setOptions({max: moment().add(2, 'm')})
                        if (model.shouldAutoScroll) {
                            this._setTimelineWindow();
                        }
                        if (this._autoscrollCheckbox.prop('checked') !== model.shouldAutoScroll) {
                            this._autoscrollCheckbox.prop('checked', model.shouldAutoScroll);
                        }

                        if (this._eventDetailsDescriptionP && model.selectedEvent) {
                            this._eventDetailsDescriptionP.html(JSON.stringify(model.selectedEvent));
                        }
                        this._footer.html(`Total events: ${model.totalEventCount}`);
                    }
                })
        );
    }
    _createDevToolsElements() {
        let _this = this;
        $(() => {
            let container = $(template);

            // note use of function so 'this' is the checkbox
            this._autoscrollCheckbox = container.find('#autoscrollCheckbox');
            this._autoscrollCheckbox.change(function () {
                _this._router.publishEvent('autoscrollToggled', {shouldAutoScroll: this.checked});
            });
            this.addDisposable(() => {this._autoscrollCheckbox.off();});

            this._captureEventsCheckbox = container.find('#captureEvents');
            this._captureEventsCheckbox.change(function () {
                _this._router.publishEvent('captureEventsToggled', {shouldCaptureEvents: this.checked});
            });
            this.addDisposable(() => {this._captureEventsCheckbox.off();});

            this._logEventsConsoleCheckbox = container.find('#logEventsConsole');
            this._logEventsConsoleCheckbox.change(function () {
                _this._router.publishEvent('logEventsConsoleToggled', {shouldLogToConsole: this.checked});
            });
            this.addDisposable(() => {this._logEventsConsoleCheckbox.off();});

            this._resetChartButton = container.find('#resetChart');
            this._resetChartButton.click(function () {
                _this._router.publishEvent('resetChart', {});
            });
            this.addDisposable(() => {this._resetChartButton.off();});

            this._closeButton = container.find('#closeButton');
            this._closeButton.click(function () {
                _this._router.publishEvent('close', {});
            });
            this.addDisposable(() => {this._closeButton.off();});

            this._eventDetailsDescriptionP = container.find('#eventDetailsDescription');
            this._footer = container.find('#footer');

            let chartContainer = container.find('#chartContainer');
            let options = {
                groupOrder: 'content',
                showCurrentTime: true,
                selectable: true,
                stack: false,
                min: moment().subtract(1, 'm'),
                max: moment().add(10, 'm')
            };
            this._timeline = new vis.Timeline(chartContainer[0]);
            this.addDisposable(() => {this._timeline.destroy();}); // also cleans up event listeners
            this._timeline.setOptions(options);
            this._timeline.setGroups(this._timelineGroups);
            this._timeline.setItems(this._timelineData);
            this._wireUpTimelineEvents(this._timeline);
            this._setTimelineWindow();
            $('body').append(container);
            // need to do this after it's been appended to the dome, else it addes a relative styling
            container.draggable({
                cursor: 'move',
                handle: '#header'
            });
            this.addDisposable(() => {
                container.remove();
            });
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
        timeline.on('click', properties => {
            this._disableAutoScroll()
        });
        timeline.on('doubleClick', properties => {
            this._disableAutoScroll()
        });
        timeline.on('timechanged', properties => {
            this._disableAutoScroll()
        });
        timeline.on('groupDragged', properties => {
            this._disableAutoScroll()
        });
    }

    _disableAutoScroll() {
        this._router.publishEvent('disableAutoScroll', {});
    }
}