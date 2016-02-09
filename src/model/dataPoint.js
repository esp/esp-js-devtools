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