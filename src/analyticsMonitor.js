import DebugToolsModel from './debugToolsModel';

export default class AnalyticsMonitor {
    constructor(router) {
        this._router = router;
    }
    addModel(modelId) {
        if(modelId === DebugToolsModel.modelId) return;
        this._router.publishEvent('modelAdded', {modelId: modelId});
    }
    publishEvent(modelId, eventType, event) {
        if(modelId === DebugToolsModel.modelId) return;
        this._router.publishEvent('eventPublished', {modelId: modelId, eventType: eventType, event:event});
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
        this._router.publishEvent('halted', {modelIds: modelIds, err: err});
    }
    registerMonitor(devToolsDiagnosticMonitor) {

    }
    unregisterMonitor(devToolsDiagnosticMonitor) {

    }
}