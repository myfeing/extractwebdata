import {CallbackWrapper, BookmarkManager} from "./bookmark.js";
import {Break, IfElse, Sequence, While} from './workflowctrlflow.js';
import {ArrayConcat, Increase} from './workflowprog.js';
import {ClickElement, ScrollToBottom, ScrapeIntoArray, 
    ExportToWorkbook, GetElementAttribute} from "./workflowcore.js";
import {Condition, ConditionExpression} from './condition.js';

export class Argument {
    constructor(name='', direction='in', type='', value=null) {
        this.name = name;
        this.direction = direction;
        this.type = type;
        this.value = value;
    }
    toJSON() {
        return {className: this.constructor.name, name: this.name,
            direction: this.direction, type: this.type, value: this.value};
    }
    static fromJSON(value) {
        let obj = new Argument();
        obj.name = value.name;
        obj.direction = value.direction;
        obj.type = value.type;
        obj.value = value.value;
        return obj;
    }
}

export class WorkflowInstance {
    constructor(runtime, workflow) {
        this.bookmarkManager_ = new BookmarkManager();
        this.workflow_ = workflow;
        this.workflowRuntime_ = runtime;
    }
    get bookmarkManager() {return this.bookmarkManager_;}
    get workflow() {return this.workflow_;}
    get workflowRuntime() {return this.workflowRuntime_;}
    addArgument(newArg) {
        if (this.workflow_.arguments.indexOf(newArg) === -1)
            this.workflow_.arguments.push(newArg);
    }
    removeArgument(oldArg) {
        let pos = this.workflow_.arguments.indexOf(oldArg);
        if (pos !== -1) this.workflow_.arguments.splice(pos, 1);
    }
    updateArgument(oldArg, direction, type, value) {
        let pos = this.workflow_.arguments.indexOf(oldArg);
        if (pos !== -1) {
            this.workflow_.arguments[pos].direction = direction;
            this.workflow_.arguments[pos].type = type;
            this.workflow_.arguments[pos].value = value;
        }
    }
    runProgram() {
        if ((this.workflow_.activity !== undefined) || (this.workflow_.activity !== null)) {
            let callback = new CallbackWrapper(this, 'exitProgram');
            this.bookmarkManager_.runStatement(this.workflow_.activity, callback);
        }
    }
    exitProgram(resumed) {
        this.workflowRuntime_.clearEnviroment();
    }
}

export class WorkflowRuntime {
    constructor() {
        this.workflowInstance_ = [];
    }
    getInstance(index) {
        if (index >=0 && index <= this.workflowInstance_.length) 
            return this.workflowInstance_[index];
        return null;
    }
    createInstance(workflow) {
        let inst = new WorkflowInstance(this, workflow);
        this.workflowInstance_.push(inst);
        return inst;
    }
    removeInstance(inst) {
        let pos = this.workflowInstance_.indexOf(inst);
        if (pos !== -1) 
            this.workflowInstance_.splice(pos, 1);
    }
    clearEnviroment() {
        this.workflowInstance_ = [];
    }
}

export class Variable {
    constructor(name='', type='', value=null) {
        this.name = name;
        this.type = type;
        this.value = value;
    }
    toJSON() {
        return {className: this.constructor.name, name: this.name, type: this.type, 
            value: this.value};
    }
    static fromJSON(value) {
        let obj = new Variable();
        obj.name = value.name;
        obj.type = value.type;
        obj.value = value.value;
        return obj;
    }
}

export function getVariableByName(varName, container) {
    do {
        let descVar = Object.getOwnPropertyDescriptor(container, 'variables_');
        if (descVar !== undefined) {
            let varList = descVar.value;
            let values = varList.values();
            for (let item of values) {
                if (item.name === varName) return item;
            }
        }
        container = container.parent;
    } while (container !== undefined);
    return undefined;
}

export function parseJSON(jsonText) {
    let wf = JSON.parse(jsonText, (key, value) => {
        if (typeof value === 'object') {
            if (value !== null) {
                let descriptor = Object.getOwnPropertyDescriptor(value, 'className');
                if ((descriptor !== undefined) && (descriptor !== null)) {
                    switch (descriptor.value) {
                        case 'GetElementAttribute':
                            return GetElementAttribute.fromJSON(value);
                        case 'TypeIntoValue':
                            return TypeIntoValue.fromJSON(value);
                        case 'ClickElement':
                            return ClickElement.fromJSON(value);
                        case 'ScrollToBottom':
                            return ScrollToBottom.fromJSON(value);
                        case 'ScrapeIntoArray':
                            return ScrapeIntoArray.fromJSON(value);
                        case 'ExportToWorkbook':
                            return ExportToWorkbook.fromJSON(value);
                        case 'Sequence':
                            return Sequence.fromJSON(value);
                        case 'While' :
                            return While.fromJSON(value);
                        case 'DoWhile':
                            return DoWhile.fromJSON(value);
                        case 'IfElse':
                            return IfElse.fromJSON(value);
                        case 'Break':
                            return Break.fromJSON(value);
                        case 'Increase':
                            return Increase.fromJSON(value);
                        case 'ArrayConcat':
                            return ArrayConcat.fromJSON(value);
                        case 'Condition':
                            return Condition.fromJSON(value);
                        case 'ConditionExpression':
                            return ConditionExpression.fromJSON(value);
                        case 'Variable':
                            return Variable.fromJSON(value);
                        case 'Argument':
                            return Argument.fromJSON(value);
                        default:
                            throw new Error(`${key, value} is not recognized during JSON.parse.`);
                    }
                }
            }
        }
        return value;
    });
    setParent(wf.activity);
    return wf;
}

function setOwner(root) {
    let descCond = Object.getOwnPropertyDescriptor(root, 'expression_');
    if (descCond !== undefined) {
        let cond = descCond.value;
        cond.owner = root;
    }
}

function setParent(root){
    let descSeq = Object.getOwnPropertyDescriptor(root, 'activities_');
    let descWhileAndDoWhile = Object.getOwnPropertyDescriptor(root, 'body_');
    let descThen = Object.getOwnPropertyDescriptor(root, 'thenStmt_');
    let descElse = Object.getOwnPropertyDescriptor(root, 'elseStmt_');
    if (descSeq !== undefined) {
        let vals = descSeq.value;
        for (let child of vals) {
            child.parent = root;
            setParent(child);
        }
    } else if (descWhileAndDoWhile !== undefined) {
        setOwner(root);
        let child = descWhileAndDoWhile.value;
        if (child !== null) {
            child.parent = root;
            setParent(child);
        }
    } else if ((descThen !== undefined) || (descElse !== undefined)) {
        setOwner(root);
        if (descThen !== undefined) {
            let child = descThen.value;
            if (child !== null) {
                child.parent = root;
                setParent(child);
            }
        }
        if (descElse !== undefined) {
            let child = descElse.value;
            if (child !== null) {
                child.parent = root;
                setParent(child);
            }
        }
    }
}

export function generateCode() {
    let extractArray = new Variable('extractArray', 'array', []);
    let extractArray2 = new Variable('extractArray2', 'array', []);
    let lastPageFlag = new Variable('lastPageFlag', 'string', '');
    let counter = new Variable('counter', 'number', 1);

    let seq = new Sequence(undefined);
//    let typeIntoValue = new TypeIntoValue(seq);
//    let clickElement = new ClickElement(seq);
    let scrapeData = new ScrapeIntoArray(seq);
    let saveToExcel = new ExportToWorkbook(seq);
    let scrollToBottom = new ScrollToBottom(seq);
    //let getNextPageAttr = new GetElementAttribute();
    seq.addVariable(extractArray);
    seq.addVariable(extractArray2);
    seq.addVariable(lastPageFlag);
    seq.addVariable(counter);
  
 //   seq.add(typeIntoValue);
 //   seq.add(clickElement);
    seq.addChild(scrapeData);
    seq.addChild(scrollToBottom);
    //seq.addChild(getNextPageAttr);
  
//    typeIntoValue.target = '#search_keyword_txt';
//    typeIntoValue.targetValue = 'solidworks';
//    clickElement.target = '.search-people-btn';
//    scrollToBottom.waitTimeBeforeRun = 3000;
    scrapeData.rowSelector = 'div.virtual_list > div > div';
    scrapeData.colSelectors = [
        'div.item div.content > ul > li:nth-child(1) > span.name',
        'div.item div.content > ul > li:nth-child(2) > span.name'];
    scrapeData.waitTimeBeforeRun = 1000;
    scrapeData.resultVariableName = 'extractArray';
    scrollToBottom.target = 'window';
    //getNextPageAttr.target = '#pagerBottomNew_nextButton';
    //getNextPageAttr.elementAttributeName = 'class';
    //getNextPageAttr.outputVariableName ='lastPageFlag';
    saveToExcel.arrayName = 'extractArray';
    saveToExcel.fileName = '51jobEnt.xlsx';

    //let condExpr = new ConditionExpression();
    //condExpr.variableName = 'lastPageFlag';
    //condExpr.operator = 'not includes';
    //condExpr.value = '"Disabled"';
    //let cond = new Condition();
    //cond.add(condExpr);

    let condExpr2 = new ConditionExpression();
    condExpr2.variableName = 'counter';
    condExpr2.operator = '<=';
    condExpr2.value = '3';
    let cond2 = new Condition();
    cond2.add(condExpr2);
  
    let whileStmt = new While(seq);
    let seq2 = new Sequence(whileStmt);
    //let clickNextPage = new ClickElement(seq2);
    let scrollToBottom2 = new ScrollToBottom(seq2);
    let scrapeData2 = new ScrapeIntoArray(seq2);
    let arrayConcat = new ArrayConcat(seq2);
    //let getNextPageAttr2 = new GetElementAttribute(seq2);
    let incr = new Increase(seq2);
    //let ifElse = new IfElse(seq2);
    //let breakStmt = new Break(ifElse);

    whileStmt.expression = cond2;
    cond2.owner = whileStmt;
    whileStmt.body = seq2;

    //ifElse.expression = cond2;
    //cond2.owner = ifElse;
    //ifElse.thenStatement = breakStmt;

    //seq2.addChild(clickNextPage);
    seq2.addChild(scrapeData2); 
    seq2.addChild(arrayConcat);
    //seq2.addChild(getNextPageAttr2);
    seq2.addChild(scrollToBottom2);
    seq2.addChild(incr);
    //seq2.addChild(ifElse);

    seq.addChild(whileStmt);
    seq.addChild(saveToExcel);

    //clickNextPage.target = "#pagerBottomNew_nextButton";
    scrapeData2.rowSelector = 'div.virtual_list > div > div';
    scrapeData2.colSelectors = [
        'div.item div.content > ul > li:nth-child(1) > span.name',
        'div.item div.content > ul > li:nth-child(2) > span.name'];
    scrapeData2.waitTimeBeforeRun = 2000;
    scrapeData2.resultVariableName = 'extractArray2';
    arrayConcat.inputArrayVariableName1 = 'extractArray';
    arrayConcat.inputArrayVariableName2 = 'extractArray2';
    arrayConcat.outputArrayVariableName = 'extractArray';
    scrollToBottom2.target = 'window';
    //getNextPageAttr2.target = '#pagerBottomNew_nextButton';
    //getNextPageAttr2.elementAttributeName = 'class';
    //getNextPageAttr2.outputVariableName ='lastPageFlag';
    incr.increment = 1;
    incr.variableName = 'counter';

    return {arguments: [], activity: seq};
}

const valueRegExp = /^(?<bool>(true|false))$|^(?<num>[0-9]+\.?[0-9]*)$|^(?<str>(?<qm>['"])(?<strVal>.*)\k<qm>)$|^(?<date>[Dd]\((?<dateVal>\d{4}-\d{1,2}-\d{1,2})\))$|^(?<varName>[a-zA-Z][0-9a-zA-Z]*)$/

export {valueRegExp};
