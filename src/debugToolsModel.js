import esp from 'esp-js';
import _ from 'lodash';
import moment from 'moment';
import UpdateType from './updateType';
import RegisteredModel from './registeredModel';

export default class DebugToolsModel extends esp.model.DisposableBase {
    constructor(router) {
        super();
        this._router = router;
        this._registeredModels = {};
        this._registeredModels = {};
        this._lastEvent = null;
        this._updateType = UpdateType.none;
        this._eventCounter = 0;
        this._timerSubscription = null;
        this.addDisposable(() => {
            if(this._timerSubscription != null) {
                clearInterval(this._timerSubscription);
            }
        });
        this._now = moment();
    }
    static get modelId() {
        return 'esp-debugTools-modelId';
    }
    get updateType() {
        return this._updateType;
    }
    get registeredModels() {
        return _.values(this._registeredModels);
    }
    get lastEvent() {
        return this._lastEvent;
    }
    get now() {
        return this._now;
    }
    observeEvents() {
        this.addDisposable(this._router.observeEventsOn(this));
    }
    preProcess() {
        this._updateType = UpdateType.none;
        this._lastEvent = null;
    }
    @esp.observeEvent('initEvent')
    _onInitEvent(event, context, model) {
        this._startTimer();
    }
    @esp.observeEvent('modelAdded')
    _onModelAdded(event, context, model) {
        this._updateType = UpdateType.modelsChanged;
        this._addModel(event.modelId);
    }
    @esp.observeEvent('modelRemoved')
    _onModelRemoved(event, context, model) {
        this._updateType = UpdateType.modelsChanged;
        delete this._registeredModels[event.modelId];
    }
    @esp.observeEvent('eventPublished')
    _onEventPublished(event) {
        this._updateType = UpdateType.eventsChanged;
        let registeredModel = this._registeredModels[event.modelId];
        if (!registeredModel) {
            registeredModel = this._addModel(event.modelId);
        }
        this._eventCounter++;
        this._lastEvent = registeredModel.eventPublished(this._eventCounter, event.modelId, event.eventType);
    }
    _addModel(modelId) {
        this._updateType = UpdateType.modelsChanged;
        let registeredModel = this._registeredModels[modelId];
        if(registeredModel) {
            throw new Error(`model with id ${modelId} already registered`);
        }
        registeredModel = new RegisteredModel(modelId);
        this._registeredModels[modelId] = registeredModel;
        return registeredModel;
    }
    @esp.observeEvent('eventSelected')
    _onEventSelected(event, context, model) {

    }
    _startTimer() {
        // start a timer so we can keep moving the chart forward
        this._timerSubscription = setInterval(() => {
            this._router.runAction(() => {
                this._updateType = UpdateType.timeChanged;
                this._now = moment();
            });
        }, 1000);
    }
}