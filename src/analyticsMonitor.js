import DebugToolsModel from './debugToolsModel';

export default class AnalyticsMonitor {
    constructor(router) {
        this._router = router;
    }

    modelAdded(modelId) {
        if(modelId === DebugToolsModel.modelId) return;
        this._router.publishEvent('modelAdded', {modelId: modelId});
    }
    eventPublished(modelId, eventType) {
        if(modelId === DebugToolsModel.modelId) return;
        this._router.publishEvent('eventPublished', {modelId: modelId, eventType: eventType});
    }
}