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
    removeModel(modelId) {
        if(modelId === DebugToolsModel.modelId) return;
        this._router.publishEvent(this._devToolsModelId, 'modelRemoved', {modelId: modelId});
    }
    publishEvent(modelId, eventType, event) {
        if(modelId === DebugToolsModel.modelId) return;
        this._router.publishEvent(this._devToolsModelId,'eventPublished', {modelId: modelId, eventType: eventType, event:event});
    }
    broadcastEvent(eventType) {
        // TODO this might cause some infinite loop issues, need to be careful when it's wired up
    }
    executingEvent(eventType) {
       this._router.publishEvent(this._devToolsModelId, 'executingEvent', {eventType: eventType});
    }
    runAction(modelId) {
        if(modelId === DebugToolsModel.modelId) return;
        this._router.publishEvent(this._devToolsModelId, 'runAction', {modelId: modelId});
    }
    eventEnqueued(modelId, eventType) {
    }
    eventIgnored(modelId, eventType) {
        if(modelId === DebugToolsModel.modelId) return;
        this._router.publishEvent(this._devToolsModelId,'eventIgnored', {modelId: modelId, eventType: eventType});
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
        if(modelIds.indexOf(DebugToolsModel.modelId) >= 0) return;
        this._router.publishEvent(this._devToolsModelId, 'routerHalted', {modelIds: modelIds, err: err});
    }
    registerMonitor(devToolsDiagnosticMonitor) {

    }
    unregisterMonitor(devToolsDiagnosticMonitor) {

    }
}