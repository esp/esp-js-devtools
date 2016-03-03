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

import esp from 'esp-js';
import _ from 'lodash';
import moment from 'moment';
import UpdateType from './updateType';
import RegisteredModel from './registeredModel';
import DataPoint from './dataPoint';
import DataPointType from './dataPointType';

export default class DevToolsModel extends esp.DisposableBase {
    constructor(router, options) {
        super();
        this._router = router;
        this._registeredModels = {};
        this._dataPointsById = {};
        this._dataPoints = [];
        this._newDataPoints = [];
        this._dataPointsIdsToRemove = [];
        this._selectedDataPoint = null;
        this._updateType = [];
        this._processedDataPointCount = 0;
        this._timerSubscription = null;
        this._now = moment();
        this._shouldAutoScroll = true;
        this._shouldCaptureEvents = typeof options.shouldCaptureEvents === 'undefined'
            ? true
            : options.shouldCaptureEvents === true;
        this._shouldLogToConsole = typeof options.logEventsToConsole === 'undefined'
            ? false
            : options.logEventsToConsole === true;
        this._dataPointBufferSize = typeof options.dataPointBufferSize === 'undefined' || isNaN(options.dataPointBufferSize)
            ? 500
            : options.dataPointBufferSize;
    }
    static get modelId() {
        return 'esp-debugTools';
    }
    get updateType() {
        return this._updateType;
    }
    get registeredModels() {
        return _.values(this._registeredModels);
    }
    get dataPoints() {
        return this._dataPoints;
    }
    get newDataPoints() {
        return this._newDataPoints;
    }
    get selectedDataPoint() {
        return this._selectedDataPoint;
    }
    get now() {
        return this._now;
    }
    get shouldAutoScroll() {
        return this._shouldAutoScroll;
    }
    get shouldLogToConsole() {
        return this._shouldLogToConsole;
    }
    get dataPointsIdsToRemove() {
        return this._dataPointsIdsToRemove;
    }
    get processedDataPointCount() {
        return this._processedDataPointCount;
    }
    get dataPointBufferSize() {
        return this._dataPointBufferSize;
    }
    observeEvents() {
        this.addDisposable(this._router.observeEventsOn(DevToolsModel.modelId, this));
    }
    preProcess() {
        this._updateType = [];
        this._newDataPoints = [];
        this._dataPointsIdsToRemove = [];
    }
    @esp.observeEvent('modelAdded', esp.ObservationStage.preview)
    @esp.observeEvent('modelRemoved', esp.ObservationStage.preview)
    @esp.observeEvent('eventPublished', esp.ObservationStage.preview)
    @esp.observeEvent('runAction', esp.ObservationStage.preview)
    @esp.observeEvent('executingEvent', esp.ObservationStage.preview)
    _previewEvents(event, context) {
        if(!this._shouldCaptureEvents || this.isDisposed) {
            context.cancel();
        }
    }
    @esp.observeEvent('initEvent')
    _onInitEvent() {
        this._startTimer();
    }
    @esp.observeEvent('modelAdded')
    _onModelAdded(event) {
        this._updateType.push(UpdateType.modelsChanged);
        this._addModel(event.modelId);
    }
    @esp.observeEvent('modelRemoved')
    _onModelRemoved(event) {
        this._updateType.push(UpdateType.modelsChanged);
        delete this._registeredModels[event.modelId];
    }
    @esp.observeEvent('eventPublished')
    _onEventPublished(event) {
        this._recordEvent(event.modelId, event.eventType, DataPointType.eventPublished, event.event);
    }
    @esp.observeEvent('broadcastEvent')
    _onBroadcastEvent(event) {

    }
    @esp.observeEvent('executingEvent')
    _onExecutingEvent(event) {

    }
    @esp.observeEvent('runAction')
    _onRunAction(event) {
        this._recordEvent(event.modelId, '__runAction', DataPointType.actionRan);
    }
    @esp.observeEvent('eventIgnored')
    _onEventIgnored(event) {

    }
    @esp.observeEvent('routerHalted')
    _onRouterHalted(event) {
        for (var i = 0; i < event.modelIds.length; i++) {
            var modelId = event.modelIds[i];
            let registeredModel = this._registeredModels[modelId];
            if(registeredModel) {
                var dataPoint = new DataPoint(moment(), modelId, null, event.err, null, DataPointType.routerHalted);
                registeredModel.haltingError = event.err;
                registeredModel.isHalted = true;
                this._addDataPoint(dataPoint);
            }
        }
        this._updateType.push(UpdateType.modelsChanged);
        this._updateType.push(UpdateType.eventsChanged);
    }
    @esp.observeEvent('pointSelected')
    _onPointSelected(event) {
        this._shouldAutoScroll = false;
        this._selectedDataPoint = this._dataPointsById[event.pointId];
    }
    @esp.observeEvent('disableAutoScroll')
    _onDisableAutoScroll(event) {
        this._shouldAutoScroll = false;
    }
    @esp.observeEvent('autoscrollToggled')
    _onAutoscrollToggled(event) {
        this._shouldAutoScroll = event.shouldAutoScroll;
    }
    @esp.observeEvent('captureEventsToggled')
    _onCaptureEventsToggled(event) {
        this._shouldCaptureEvents = event.shouldCaptureEvents;
    }
    @esp.observeEvent('logEventsConsoleToggled')
    _onLogEventsConsoleToggled(event) {
        this._shouldLogToConsole = event.shouldLogToConsole;
    }
    @esp.observeEvent('resetChart')
    _onResetChart() {
        this._reset();
    }
    @esp.observeEvent('ringBufferSizeInputChanged')
    _onRingBufferSizeInputChanged(value) {
        let newDataPointBufferSize = Number(value);
        if(!isNaN(newDataPointBufferSize)) {
            this._dataPointBufferSize = newDataPointBufferSize;
        }
    }
    dispose() {
        super.dispose();
        this._stopTimer();
    }
    _startTimer() {
        // start a timer so we can keep moving the chart forward
        this._timerSubscription = setInterval(() => {
            this._router.runAction(
                DevToolsModel.modelId, () => {
                    this._updateType.push(UpdateType.timeChanged);
                    this._now = moment();
                }
            );
        }, 5000);
    }
    _reset() {
        this._updateType.push(UpdateType.reset);
        this._registeredModels = {};
    }
    _stopTimer() {
        if(this._timerSubscription != null) {
            clearInterval(this._timerSubscription);
        }
    }
    _recordEvent(modelId, eventType, dataPointType, eventPayload) {
        this._updateType.push(UpdateType.eventsChanged);
        let registeredModel = this._registeredModels[modelId];
        if (!registeredModel) {
            this._addModel(modelId);
        }
        var dataPoint = new DataPoint(moment(), modelId, eventType, null, eventPayload, dataPointType);
        this._addDataPoint(dataPoint);
        if(this._shouldLogToConsole && typeof eventPayload !== 'undefined') {
            console.log(`[ESP-Event] ModelId:[${modelId}] EventType:[${eventType}]`, eventPayload);
        }
    }
    _addModel(modelId) {
        this._updateType.push(UpdateType.modelsChanged);
        let registeredModel = this._registeredModels[modelId];
        if(registeredModel) {
            throw new Error(`model with id ${modelId} already registered`);
        }
        registeredModel = new RegisteredModel(modelId);
        this._registeredModels[modelId] = registeredModel;
        return registeredModel;
    }
    _addDataPoint(dataPoint) {
        this._dataPointsById[dataPoint.pointId] = dataPoint;
        this._dataPoints.push(dataPoint);
        this._newDataPoints.push(dataPoint);
        this._processedDataPointCount++;
        if(this._processedDataPointCount > this._dataPointBufferSize) {
            let numberToRemove = this._dataPoints.length - this._dataPointBufferSize;
            let removedItems = this._dataPoints.splice(0, numberToRemove);
            for (let i = 0; i < removedItems.length; i++) {
                let dataPointToRemove = removedItems[i];
                this._dataPointsIdsToRemove.push(dataPointToRemove.pointId);
                delete this._dataPointsById[dataPointToRemove.pointId];
            }
        }
    }
}