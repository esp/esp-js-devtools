// notice_start
/*
 * Copyright 2015 Dev Shop Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// notice_end

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
import DataPointType from '../model/dataPointType';

export default class DevToolsView extends esp.model.DisposableBase {

    constructor(modelId, router) {
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
        this._ringBufferSizeInput = null;
        this._eventDetailsDescriptionP = null;
        this._footer = null;
        this._modelId = modelId;
    }

    start() {
        this._createDevToolsElements();
        let isStateOfTheWorld = true;
        this.addDisposable(
            this._router.getModelObservable(this._modelId)
                .observe(model => {
                    if (isStateOfTheWorld || model.updateType.indexOf(UpdateType.modelsChanged) >= 0) {
                        for (let i = 0; i < model.registeredModels.length; i++) {
                            let registeredModel = model.registeredModels[i];
                            let groupStyle = registeredModel.isHalted
                                ? 'background:red'
                                : '';
                            this._timelineGroups.update({
                                id: registeredModel.modelId,
                                content: registeredModel.modelId,
                                style:groupStyle
                            });
                        }
                    }
                    if (isStateOfTheWorld || model.updateType.indexOf(UpdateType.eventsChanged) >= 0) {
                        let points = isStateOfTheWorld
                            ? model.dataPoints
                            : model.newDataPoints;
                        for (var i = 0; i < points.length; i++) {
                            var dataPoint = points[i];
                            let pointStyle = dataPoint.pointType == DataPointType.routerHalted
                                ? 'background:red'
                                : '';
                            this._timelineData.add({
                                id: dataPoint.pointId,
                                group: dataPoint.modelId,
                                title: dataPoint.data,
                                start: dataPoint.publishedTime,
                                style: pointStyle
                            });
                        }
                        if(model.dataPointsIdsToRemove.length > 0) {
                            this._timelineData.remove(model.dataPointsIdsToRemove);
                        }
                    }
                    if (model.updateType.indexOf(UpdateType.reset) >= 0) {
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
                        if (this._logEventsConsoleCheckbox.prop('checked') !== model.shouldLogToConsole) {
                            this._logEventsConsoleCheckbox.prop('checked', model.shouldLogToConsole);
                        }
                        if (this._eventDetailsDescriptionP && model.selectedDataPoint) {
                            this._eventDetailsDescriptionP.html(JSON.stringify(model.selectedDataPoint));
                        }
                        if(this._ringBufferSizeInput && !this._ringBufferSizeInput.is(":focus")) {
                            this._ringBufferSizeInput.val(model.dataPointBufferSize);
                        }
                        this._footer.html(`Total events: ${model.processedDataPointCount}`);
                    }
                    isStateOfTheWorld = false;
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
                _this._router.publishEvent(_this._modelId, 'autoscrollToggled', {shouldAutoScroll: this.checked});
            });
            this.addDisposable(() => {this._autoscrollCheckbox.off();});

            this._captureEventsCheckbox = container.find('#captureEvents');
            this._captureEventsCheckbox.change(function () {
                _this._router.publishEvent(_this._modelId,'captureEventsToggled', {shouldCaptureEvents: this.checked});
            });
            this.addDisposable(() => {this._captureEventsCheckbox.off();});

            this._logEventsConsoleCheckbox = container.find('#logEventsConsole');
            this._logEventsConsoleCheckbox.change(function () {
                _this._router.publishEvent(_this._modelId,'logEventsConsoleToggled', {shouldLogToConsole: this.checked});
            });
            this.addDisposable(() => {this._logEventsConsoleCheckbox.off();});

            this._resetChartButton = container.find('#resetChart');
            this._resetChartButton.click(function () {
                _this._router.publishEvent(_this._modelId,'resetChart', {});
            });
            this.addDisposable(() => {this._resetChartButton.off();});

            this._closeButton = container.find('#closeButton');
            this._closeButton.click(function () {
                _this.dispose();
            });
            this.addDisposable(() => {this._closeButton.off();});

            this._eventDetailsDescriptionP = container.find('#eventDetailsDescription');
            this._footer = container.find('#footer');

            this._ringBufferSizeInput = container.find('#ringBufferSize');
            this._ringBufferSizeInput.change(function () {
                _this._router.publishEvent(_this._modelId,'ringBufferSizeInputChanged', this.value);
            });
            this.addDisposable(() => {this._ringBufferSizeInput.off();});

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
                this._modelId,
                'pointSelected', {
                    pointId: pointId
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
        this._router.publishEvent(this._modelId, 'disableAutoScroll', {});
    }
}