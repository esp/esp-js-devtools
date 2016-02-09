import esp from 'esp-js';
import _ from 'lodash';
import moment from 'moment';
import UpdateType from './updateType';
import RegisteredModel from './registeredModel';
import DataPoint from './dataPoint';
import DataPointType from './dataPointType';

export default class DevToolsModel extends esp.model.DisposableBase {
    constructor(router) {
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
        this._shouldCaptureEvents = true;
        this._shouldLogToConsole = false;
        this._dataPointBufferSize = 200;
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
        this._updateType.push(UpdateType.eventsChanged);
        let registeredModel = this._registeredModels[event.modelId];
        if (!registeredModel) {
            this._addModel(event.modelId);
        }
        var dataPoint = new DataPoint(moment(), event.eventType, event.modelId, DataPointType.eventPublished);
        this._addDataPoint(dataPoint);
        if(this._shouldLogToConsole) {
            console.log(`[ESP-Event] ModelId:[${event.modelId}] EventType:[${event.eventType}]`, event.event);
        }
    }
    @esp.observeEvent('routerHalted')
    _onRouterHalted(event) {
        for (var i = 0; i < event.modelIds.length; i++) {
            var modelId = event.modelIds[i];
            let registeredModel = this._registeredModels[modelId];
            if(registeredModel) {
                var dataPoint = new DataPoint(moment(), event.err, modelId, DataPointType.routerHalted);
                registeredModel.haltingError = event.err;
                registeredModel.isHalted = true;
                this._addDataPoint(dataPoint);
            }
        }
        this._updateType.push(UpdateType.modelsChanged);
        this._updateType.push(UpdateType.eventsChanged);
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
}