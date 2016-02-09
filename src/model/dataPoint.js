import DataPointType from './dataPointType';
let dataPointId = 1;

export default class DataPoint {
    constructor(publishedTime, data, modelId, pointType) {
        this._pointId = dataPointId++;
        this._data = data;
        this._publishedTime = publishedTime;
        this._devToolsModelId = modelId;
        this._pointType = pointType;
    }
    get pointId() {
        return this._pointId;
    }
    get data() {
        return this._data;
    }
    get publishedTime() {
        return this._publishedTime;
    }
    get modelId() {
        return this._devToolsModelId;
    }
    get pointType() {
        return this._pointType;
    }
}