import DebugToolsModel from './devToolsModel';

export default class AnalyticsMonitor {
    constructor(devToolsModelId, router) {
        this._router = router;
        this._devToolsModelId = devToolsModelId;
    }
    addModel(modelId) {
        if(modelId === DebugToolsModel.modelId) return;
        this._router.publishEvent(this._devToolsModelId, 'modelAdded', {modelId: modelId});
    }
    publishEvent(modelId, eventType, event) {
        if(modelId === DebugToolsModel.modelId) return;
        this._router.publishEvent(this._devToolsModelId,'eventPublished', {modelId: modelId, eventType: eventType, event:event});
    }
    broadcastEvent(eventType) {
    }
    executingEvent(modelId) {
    }
    runAction(modelId) {
    }
    eventEnqueued(modelId, eventType) {
    }
    eventIgnored(modelId, eventType) {
    }
    dispatchLoopStart() {
    }
    startingModelEventLoop(modelId, initiatingEventType) {
    }
    preProcessingModel() {
    }
    dispatchingEvents() {
    }
    dispatchingAction() {
    }
    dispatchingEvent(eventType, stage) {
    }
    dispatchingViaDirective(functionName) {
    }
    dispatchingViaConvention(functionName) {
    }
    finishDispatchingEvent() {
    }
    postProcessingModel() {
    }
    endingModelEventLoop() {
    }
    dispatchingModelUpdates(modelId) {
    }
    dispatchLoopEnd() {
    }
    halted(modelIds, err) {
        if(modelIds.indexOf(DebugToolsModel.modelId) >=0 ) return;
        this._router.publishEvent(this._devToolsModelId, 'routerHalted', {modelIds: modelIds, err: err});
    }
    registerMonitor(devToolsDiagnosticMonitor) {

    }
    unregisterMonitor(devToolsDiagnosticMonitor) {

    }
}