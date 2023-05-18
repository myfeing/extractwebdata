import {getVariableByName} from "./workflowruntime.js";
import * as XLSX from './xlsx.mjs';

export class Activity {
    constructor(myParent) {
        this.target_ = '';
        this.targetElementVaribleName_ = '';
        this.parent_ = myParent;
        this.waitTimeBeforeRun_ = 0;
    }
    get target() { return this.target_; }
    set target(newVal) { this.target_ = newVal; }
    get targetElementVaribleName() {return this.targetElementVaribleName_;}
    set targetElementVaribleName(newVal) {this.targetElementVaribleName_ = newVal;}
    get parent() {return this.parent_;}
    set parent(newValue) {this.parent_ = newValue;}
    get waitTimeBeforeRun() {return this.waitTimeBeforeRun_}
    set waitTimeBeforeRun(newVal) {this.waitTimeBeforeRun_ = newVal;}
    getTargetElementVariable() {
        if (this.targetElementVaribleName_ !== '') {
            const varItem = getVariableByName(this.targetElementVaribleName_, this);
            return varItem;
        } else
            return undefined;
    }
    getChildList() {return undefined;}
    run() { }
    toJSON() {
        return {target: this.target_,
            targetElementVaribleName: this.targetElementVaribleName_,
            waitTimeBeforeRun: this.waitTimeBeforeRun_,
            className: this.constructor.name};
    }
    static fromJSON(value) {return value;}
}

export class GetElementAttribute extends Activity {
    constructor(myParent) {
        super(myParent);
        this.elementAttributeName_ = '';
        this.outputVariableName_ = ''
    }
    get elementAttributeName() {return this.elementAttributeName_;}
    set elementAttributeName(newVal) {this.elementAttributeName_ = newVal;}
    get outputVariableName() {return this.outputVariableName_;}
    set outputVariableName(newVal) {this.outputVariableName_ = newVal;}
    getOutputVariable() {
        if (this.outputVariableName_ !== '') {
            const varItem = getVariableByName(this.outputVariableName_, this);
            return varItem;
        } else return undefined;
    }
    run(bkmgr) {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            let tabId = tabs[0].id;
            let targetElement = this.getTargetElementVariable();
            chrome.tabs.sendMessage(
                tabId,
                {action: "get-element-attribute",
                args: {target: this.target_,
                    targetElement: targetElement,
                    attributeName: this.elementAttributeName_
                }},
                (response) => {
                    if (response.type === 'done') {
                        let varItem = this.getOutputVariable();
                        if (varItem !== undefined) varItem.value = response.result;
                        bkmgr.done(this);
                    }
                }
            );
        });
    }
    toJSON() {
        return {target: this.target_,
            targetElementVaribleName: this.targetElementVaribleName_,
            waitTimeBeforeRun: this.waitTimeBeforeRun_,
            className: this.constructor.name, 
            elementAttributeName: this.elementAttributeName_,
            outputVariableName: this.outputVariableName_};
    }
    static fromJSON(value) {
        let obj = new GetElementAttribute();
        obj.target_ = value.target;
        obj.targetElementVaribleName_ = value.targetElementVaribleName;
        obj.waitTimeBeforeRun_ = value.waitTimeBeforeRun;
        obj.elementAttributeName_ = value.elementAttributeName;
        obj.outputVariableName_ = value.outputVariableName;
        return obj;
    }
}

export class TypeIntoValue extends Activity {
    constructor(myParent) {
        super(myParent);
        this.targetValue_ = '';
    }
    set targetValue(newValue) { this.targetValue_ = newValue; }
    get targetValue() { return this.targetValue_; }
    run(bkmgr) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            //console.log(tabs[0]);
            let tabId = tabs[0].id;
            let targetElement = this.getTargetElementVariable();
            chrome.tabs.sendMessage(
                tabId, 
                {action: "type-into-value", 
                args: {target: this.target_,
                    targetElement: targetElement,
                    value: this.targetValue_
                }},
                (response) => {
                    if (response.type === 'done') bkmgr.done(this);
                }
            );
        });
    }
    toJSON() {
        return {target: this.target_,
            targetElementVaribleName: this.targetElementVaribleName_,
            waitTimeBeforeRun: this.waitTimeBeforeRun_,
            className: this.constructor.name,
            targetValue: this.targetValue_};
    }
    static fromJSON(value) {
        let obj = new TypeIntoValue();
        obj.target_ = value.target;
        obj.targetElementVaribleName_ = value.targetElementVaribleName;
        obj.waitTimeBeforeRun_ = value.waitTimeBeforeRun;
        obj.targetValue_ = value.targetValue;        
        return obj;
    }
}

function injectedClickEvent(target, targetElement) {
    let event = new MouseEvent("click", { "bubbles": true, "cancelable": true });
    let ele = targetElement;
    if ((ele === null) || (ele === undefined))
        ele = document.querySelector(target);
    if ((ele !== null) && (ele !== undefined)) 
        ele.dispatchEvent(event);
    return {type: 'done'};
}

export class ClickElement extends Activity {
    constructor(myParent) {
        super(myParent);
    }
    run(bkmgr) {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            //console.log(tabs[0]);
            let tabId = tabs[0].id;
            let targetElement = this.getTargetElementVariable();
            if (targetElement === undefined) targetElement = null;
            chrome.scripting.executeScript({
                world: 'MAIN',
                target: {tabId: tabId, allFrames: true},
                func: injectedClickEvent,
                args: [this.target_, targetElement],
            },
            (injectionResults) => {
                for (const frameResult of injectionResults)
                    if (frameResult.result.type === 'done') {
                        bkmgr.done(this);
                        break;
                    }
            })
            /*chrome.tabs.sendMessage(
                tabId, 
                {action: "click-element", 
                args:{target: this.target_,
                    targetElement: targetElement
                }},
                (response) => {
                    if (response.type === 'done') 
                        bkmgr.done(this);
                }
            );*/
        });
    }
    toJSON() {
        return {target: this.target_,
            targetElementVaribleName: this.targetElementVaribleName_,
            waitTimeBeforeRun: this.waitTimeBeforeRun_,
            className: this.constructor.name};
    }
    static fromJSON(value) {
        let obj = new ClickElement();
        obj.target_ = value.target;
        obj.targetElementVaribleName_ = value.targetElementVaribleName;
        obj.waitTimeBeforeRun_ = value.waitTimeBeforeRun;
        return obj;
    }
}

export class ScrollToBottom extends Activity {
    constructor(myParent) {
        super(myParent);
    }
    run(bkmgr) {
        if (this.target_ === 'window') {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                //console.log("class ScrollToBottom: ");
                //console.log(tabs[0]);
                let tabId = tabs[0].id;
                chrome.tabs.sendMessage(
                    tabId, 
                    {action: "scroll-to-win-bottom"},
                    (response) => {
                        if (response.type === 'done') bkmgr.done(this);
                    }
                );
            });
        }
    }
    toJSON() {
        return {target: this.target_,
            targetElementVaribleName: this.targetElementVaribleName_,
            waitTimeBeforeRun: this.waitTimeBeforeRun_,
            className: this.constructor.name};
    }
    static fromJSON(value) {
        let obj = new ScrollToBottom();
        obj.target_ = value.target;
        obj.targetElementVaribleName_ = value.targetElementVaribleName;
        obj.waitTimeBeforeRun_ = value.waitTimeBeforeRun;
        return obj;
    }
}

export class ScrapeIntoArray extends Activity {
    constructor(myParent) {
        super(myParent);
        this.rowSelector_ = '';
        this.colSelectors_ = [];
        this.resultVariableName_ = '';
    }
    set rowSelector(newVal) { this.rowSelector_ = newVal; }
    get rowSelector() { return this.rowSelector_; }
    set colSelectors(newVal) { this.colSelectors_ = newVal; }
    get colSelectors() { return this.colSelectors_; }
    get resultVariableName() {return this.resultVariableName_;}
    set resultVariableName(newVal) {this.resultVariableName_ = newVal;}
    getResultVariable() {
        if (this.resultVariableName_ !== '') {
            const varItem = getVariableByName(this.resultVariableName_, this);
            return varItem;
        } else
            return undefined;
    }
    run(bkmgr) {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            //console.log('class ScrapeIntoArray: ');
            //console.log(tabs[0]);
            let tabId = tabs[0].id;
            chrome.tabs.sendMessage(
                tabId, 
                {action: "scrape-into-array", 
                args:{rowSelector: this.rowSelector_, 
                    colSelectors: this.colSelectors_}},
                (response) => {
                    if (response.type === 'done') {
                        let varItem = this.getResultVariable();
                        if (varItem !== undefined) varItem.value = response.result;
                        bkmgr.done(this);
                    }
                }
            );
        });
    }
    toJSON() {
        return {target: this.target_,
            targetElementVaribleName: this.targetElementVaribleName_,
            waitTimeBeforeRun: this.waitTimeBeforeRun_,
            className: this.constructor.name,
            rowSelector: this.rowSelector_,
            colSelectors: this.colSelectors_,
            resultVariableName: this.resultVariableName_};
    }
    static fromJSON(value) {
        let obj = new ScrapeIntoArray();
        obj.target_ = value.target;
        obj.targetElementVaribleName_ = value.targetElementVaribleName;
        obj.waitTimeBeforeRun_ = value.waitTimeBeforeRun;
        obj.rowSelector_ = value.rowSelector;
        obj.colSelectors_ = value.colSelectors;
        obj.resultVariableName_ = value.resultVariableName;
        return obj;
    }
}

export class ExportToWorkbook extends Activity {
    constructor(myParent) {
        super(myParent);
        this.arrayName_ = '';
        this.sheetName_ = 'sheet1';
        this.fileName_ = '';
    }
    get arrayName() {return this.arrayName_;}
    set arrayName(newVal) {this.arrayName_ = newVal;}
    get sheetName() {return this.sheetName_;}
    set sheetName(newVal) {this.sheetName_ = newVal;}
    get fileName() {return this.fileName_;}
    set fileName(newVal) {this.fileName_ = newVal;}
   run(bkmgr) {
        const varItem = getVariableByName(this.arrayName_, this);
        if (varItem === undefined)
            throw new Error("Exported to xlsx file must be array of arrays!");
        let ws = XLSX.utils.aoa_to_sheet(varItem.value);
        let wb = XLSX.utils.book_new();;
        XLSX.utils.book_append_sheet(wb, ws, this.sheetName_);
        let wOpts = {
            bookType: 'xlsx',
            type: 'binary'
        }
        let wOut = XLSX.write(wb, wOpts);
        chrome.runtime.sendMessage({
            action:'add-download-link',
            workbookObject: {fileName: this.fileName_,
            objectStream: wOut}},
            (response)=>{
                if (response.type === 'done') bkmgr.done(this);
            }
        );
    }
    toJSON() {
        return {target: this.target_,
            targetElementVaribleName: this.targetElementVaribleName_,
            waitTimeBeforeRun: this.waitTimeBeforeRun_,
            className: this.constructor.name,
            arrayName: this.arrayName_,
            sheetName: this.sheetName_,
            fileName: this.fileName_};
    }
    static fromJSON(value) {
        let obj = new ExportToWorkbook();
        obj.target_ = value.target;
        obj.targetElementVaribleName_ = value.targetElementVaribleName;
        obj.waitTimeBeforeRun_ = value.waitTimeBeforeRun;
        obj.arrayName_ = value.arrayName;
        obj.sheetName_ = value.sheetName;
        obj.fileName_ = value.fileName;
        return obj;
    }
}