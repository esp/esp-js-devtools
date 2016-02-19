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

import $ from 'jquery';
import esp from 'esp-js';
import AnalyticsMonitor from './model/analyticsMonitor';
import DevToolsModel from './model/devToolsModel';
import DevToolsView from './views/devToolsView';

class Controller {
    constructor(options) {
        this._model = null;
        this._view = null;
        this._router = null;
        this._options = options;
    }
    start() {
        this._router = new esp.Router();
        this._model = new DevToolsModel(this._router, this._options);
        this._router.addModel(DevToolsModel.modelId, this._model);
        window.__espAnalyticsMonitor = new AnalyticsMonitor(DevToolsModel.modelId, this._router);
        this._model.observeEvents();
        this._router.publishEvent(DevToolsModel.modelId, 'initEvent', {});
        $(document).keyup(this._openDevToolsOnKeyboardShortcut.bind(this));
    }
    dispose() {
        window.__espAnalyticsMonitor = null;
        $(document).unbind('keyup', this._openDevToolsOnKeyboardShortcut);
        this._router.dispose();
        this._model.dispose();
        this._view.dispose();
    }
    _openDevToolsOnKeyboardShortcut(event) {
        event = event || window.event;
        if(event.keyCode== 68 && event.ctrlKey && event.altKey) {
            this.tryOpenDevTools();
        }
    }
    tryOpenDevTools() {
        if(this._view === null) {
            this._view = new DevToolsView(DevToolsModel.modelId, this._router);
            this._view.start();
            this._view.addDisposable(
                () => {
                    this._view = null;
                }
            );
        }
    }
}

let isRegistered = false;
let controller;

export function registerDevTools(options) {
    if (isRegistered) {
        return;
    }
    if (typeof window === 'undefined') {
        throw new Error('window is undefined. esp-devtools needs window to add a hook to window for all routers to interact with');
    }
    let devToolsOptions = options || {};
    isRegistered = true;
    controller = new Controller(devToolsOptions);
    controller.start();
    if(devToolsOptions.displayOnStartup) {
        controller.tryOpenDevTools();
    }
}