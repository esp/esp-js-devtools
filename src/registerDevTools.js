import esp from 'esp-js';
import AnalyticsMonitor from './analyticsMonitor';
import DebugToolsModel from './debugToolsModel';
import DevToolsView from './devToolsView';

let isRegistered = false;

export default function () {
    if(isRegistered) {
        return;
    }
    if(typeof window === 'undefined') {
        throw new Error('window is undefined. esp-devtools needs window to add a hook to window for all routers to interact with');
    }
    isRegistered = true;
    let router = new esp.Router();
    let modelRouter = router.createModelRouter(DebugToolsModel.modelId);
    var debugToolsModel = new DebugToolsModel(modelRouter);
    router.addModel(DebugToolsModel.modelId, debugToolsModel);
    var devToolsView = new DevToolsView(modelRouter);
    window.__espAnalyticsMonitor = new AnalyticsMonitor(modelRouter);
    devToolsView.start();
    debugToolsModel.observeEvents();
    modelRouter.publishEvent('initEvent', {});
}