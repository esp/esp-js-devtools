export default class EventRecord {
    constructor(eventNumber, publishedTime, eventType, modelId) {
        this._eventNumber = eventNumber;
        this._eventType = eventType;
        this._publishedTime = publishedTime;
        this._modelId = modelId;
    }
    get eventNumber() {
        return this._eventNumber;
    }
    get eventType() {
        return this._eventType;
    }
    get publishedTime() {
        return this._publishedTime;
    }
    get modelId() {
        return this._modelId;
    }
}