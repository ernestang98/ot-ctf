import {Component, Input, OnInit} from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import {
    GaugeEvent,
    GaugeEventActionType,
    GaugeEventSetValueType,
    GaugeEventType,
    GaugeProperty,
    GaugeSettings,
    View
} from '../../../_models/hmi';
import { Script, ScriptParam, SCRIPT_PARAMS_MAP } from '../../../_models/script';

import { Utils } from '../../../_helpers/utils';


@Component({
    selector: 'flex-event',
    templateUrl: './flex-event.component.html',
    styleUrls: ['./flex-event.component.css']
})
export class FlexEventComponent implements OnInit {

    @Input() property: GaugeProperty;
    @Input() views: View[];
    @Input() inputs: GaugeSettings[];
    @Input() data: any;
    @Input() scripts: Script[];

    variablesMapping = 'variablesMapping';
    eventRunScript = Utils.getEnumKey(GaugeEventActionType, GaugeEventActionType.onRunScript);

    events: GaugeEvent[];
    eventType = GaugeEventType;
    setValueType = GaugeEventSetValueType;
    actionType = GaugeEventActionType;

    constructor(private translateService: TranslateService) {
    }

    ngOnInit() {
        Object.keys(this.eventType).forEach(key => {
            this.translateService.get(this.eventType[key]).subscribe((txt: string) => { this.eventType[key] = txt; });
        });
        Object.keys(this.actionType).forEach(key => {
            this.translateService.get(this.actionType[key]).subscribe((txt: string) => { this.actionType[key] = txt; });
        });
        Object.keys(this.setValueType).forEach(key => {
            this.translateService.get(this.setValueType[key]).subscribe((txt: string) => { this.setValueType[key] = txt; });
        });

        if (this.property) {
            this.events = this.property.events;
            // compatibility with <= 1.0.4
            this.events.forEach(element => {
                if (!element.actoptions || Object.keys(element.actoptions).length == 0) {
                    element.actoptions = {variablesMapping: []};
                }
            });
        }
        if (!this.events || this.events.length <= 0) {
            this.onAddEvent();
        }
    }

    getEvents() {
        let result = [];
        if (this.events) {
            this.events.forEach(element => {
                if (element.type) {
                    // clean unconfig
                    if (element.action === this.eventRunScript) {
                        delete element.actoptions[this.variablesMapping];
                    } else {
                        delete element.actoptions[SCRIPT_PARAMS_MAP];
                    }
                    result.push(element);
                }
            });
        }
        return result;
    }

    onAddEvent() {
        let ga: GaugeEvent = new GaugeEvent();
        this.addEvent(ga);
    }

    onRemoveEvent(index: number) {
        this.events.splice(index, 1);
    }

    onScriptChanged(scriptId, event) {
        if (event && this.scripts) {
            let script = this.scripts.find(s => s.id === scriptId);
            event.actoptions[SCRIPT_PARAMS_MAP] = [];
            if (script && script.parameters) {
                event.actoptions[SCRIPT_PARAMS_MAP] = JSON.parse(JSON.stringify(script.parameters));
            }
        }
    }

    withDestination(action) {
        let a = Object.keys(this.actionType).indexOf(action);
        let b = Object.values(this.actionType).indexOf(GaugeEventActionType.onpage);
        let c = Object.values(this.actionType).indexOf(GaugeEventActionType.onwindow);
        let d = Object.values(this.actionType).indexOf(GaugeEventActionType.ondialog);
        return a === b || a === c || a === d;
    }

    withSetValue(action) {
        let a = Object.keys(this.actionType).indexOf(action);
        let b = Object.values(this.actionType).indexOf(GaugeEventActionType.onSetValue);
        return a === b;
    }

    withToggleValue(action) {
        let a = Object.keys(this.actionType).indexOf(action);
        let b = Object.values(this.actionType).indexOf(GaugeEventActionType.onToggleValue);
        return a === b;
    }

    withSetInput(action) {
        let a = Object.keys(this.actionType).indexOf(action);
        let b = Object.values(this.actionType).indexOf(GaugeEventActionType.onSetInput);
        return a === b;
    }

    withAddress(action) {
        let a = Object.keys(this.actionType).indexOf(action);
        let b = Object.values(this.actionType).indexOf(GaugeEventActionType.oniframe);
        let c = Object.values(this.actionType).indexOf(GaugeEventActionType.oncard);
        return a === b || a === c;
    }

    withScale(action) {
        let a = Object.keys(this.actionType).indexOf(action);
        let b = Object.values(this.actionType).indexOf(GaugeEventActionType.oniframe);
        return a === b;
    }

    withRunScript(action) {
        return action === this.eventRunScript;
    }

    getView(viewId: any) {
        return this.views.find(function(item) {
            return item.id == viewId;
        });
    }

    setScriptParam(scriptParam: ScriptParam, event) {
        scriptParam.value = event.variableId;
    }

    private addEvent(ge: GaugeEvent) {
        if (!this.events) {
            this.events = [];
        }
        this.events.push(ge);
    }
}
