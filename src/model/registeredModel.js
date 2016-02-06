import moment from 'moment';
import EventRecord from './eventRecord';

export default class RegisteredModel {
    constructor(modelId) {
        this._modelId = modelId;
        this._events = [];
    }
    get modelId() {
        return this._modelId;
    }
    get events() {
        return this._events;
    }
    eventPublished(eventNumber, modelId, eventType) {
        var eventRecord = new EventRecord(eventNumber, moment(), eventType, modelId);
        this._events.push(eventRecord);
        return eventRecord;
    }
}