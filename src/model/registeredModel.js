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
}