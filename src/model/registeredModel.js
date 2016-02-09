import moment from 'moment';
import DataPoint from './dataPoint';

export default class RegisteredModel {
    constructor(modelId) {
        this._devToolsModelId = modelId;
        this._isHalted = false;
        this._haltingError = null;
    }
    get modelId() {
        return this._devToolsModelId;
    }
    get isHalted() {
        return this._isHalted;
    }
    set isHalted(isHalted) {
        this._isHalted = isHalted;
    }
    get haltingError() {
        return this._haltingError;
    }
    set haltingError(err) {
        this._haltingError = err;
    }
    //createEventPublishedDataPoint(eventNumber, modelId, eventType) {
    //    var dataPoint = new DataPoint(eventNumber, moment(), eventType, modelId);
    //    this._events.push(dataPoint);
    //    return eventRecord;
    //}
    //halted(eventNumber, modelId, eventType) {
    //
    //}
}