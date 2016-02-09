import $ from 'jquery';
import esp from 'esp-js';
import AnalyticsMonitor from './model/analyticsMonitor';
import DevToolsModel from './model/devToolsModel';
import DevToolsView from './views/devToolsView';

class Controller {
    constructor() {
        this._model = null;
        this._view = null;
        this._router = null;
    }
    start() {
        this._router = new esp.Router();
        this._model = new DevToolsModel(this._router);
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
}

let isRegistered = false;
let controller;

export function registerDevTools() {
    if (isRegistered) {
        return;
    }
    if (typeof window === 'undefined') {
        throw new Error('window is undefined. esp-devtools needs window to add a hook to window for all routers to interact with');
    }
    isRegistered = true;
    controller = new Controller();
    controller.start();
}