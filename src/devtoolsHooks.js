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
        let modelRouter = this._router.createModelRouter(DevToolsModel.modelId);
        this._model = new DevToolsModel(modelRouter);
        this._router.addModel(DevToolsModel.modelId, this._model);
        this._view = new DevToolsView(modelRouter);
        window.__espAnalyticsMonitor = new AnalyticsMonitor(modelRouter);
        this._view.start();
        this._model.observeEvents();
        this._router.publishEvent(DevToolsModel.modelId, 'initEvent', {});
    }
    dispose() {
        window.__espAnalyticsMonitor = null;
        this._router.dispose();
        this._model.dispose();
        this._view.dispose();
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

export function unregisterDevTools() {
    controller.dispose();
    controller = null;
    isRegistered = false;
}