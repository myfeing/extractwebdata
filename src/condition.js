import {getVariableByName, valueRegExp} from "./workflowruntime.js";

export class ConditionEvaluateMap {
    /*static boolEvaluateMap = new Map([
        ["==", (varVal, val) => (varVal === val)],
        ["!=", (varVal, val) => (varVal !== val)]
    ])
    static numberEvaluateMap = new Map([
        ["==", (varVal, val) => (varVal === val)],
        ["!=", (varVal, val) => (varVal !== val)],
        [">", (varVal, val) => (varVal > val)],
        [">=", (varVal, val) => (varVal >= val)],
        ["<", (varVal, val) => (varVal < val)],
        ["<=", (varVal, val) => (varVal <= val)]
    ])
    static stringEvaluateMap= new Map([
        ["==", (varVal, val) => (varVal === val)],
        ["!=", (varVal, val) => (varVal !== val)],
        ["startsWith", (varVal, val) => (varVal.startsWith(val))],
        ["endsWith", (varVal, val) => (varVal.endsWith(val))],
        ["includes", (varVal, val) => (varVal.includes(val))]
    ])
    static dateEvaluateMap = new Map([
        ["==", (varVal, val) => (varVal === val)],
        ["!=", (varVal, val) => (varVal !== val)],
        [">", (varVal, val) => (varVal > val)],
        [">=", (varVal, val) => (varVal >= val)],
        ["<", (varVal, val) => (varVal < val)],
        ["<=", (varVal, val) => (varVal <= val)]
    ])
    static varEveluateMap = new Map([
        ["==", (varVal, val) => (varVal === val)],
        ["!=", (varVal, val) => (varVal !== val)],
        [">", (varVal, val) => (varVal > val)],
        [">=", (varVal, val) => (varVal >= val)],
        ["<", (varVal, val) => (varVal < val)],
        ["<=", (varVal, val) => (varVal <= val)],
        ["startsWith", (varVal, val) => (varVal.startsWith(val))],
        ["endsWith", (varVal, val) => (varVal.endsWith(val))],
        ["includes", (varVal, val) => (varVal.includes(val))]
    ])*/
    static rowEvaluate(rowOperator, lastValue, value) {
        if (rowOperator === '') 
            throw new Error("Row operator for row must be selected!");
        else 
            return (rowOperator.toLowerCase() === 'or') ? lastValue || value : lastValue && value;
    }
}

ConditionEvaluateMap.boolEvaluateMap = new Map([
    ["==", (varVal, val) => (varVal === val)],
    ["!=", (varVal, val) => (varVal !== val)]
]);

ConditionEvaluateMap.generalEvaluateMap = new Map([
    ["==", (varVal, val) => (varVal === val)],
    ["!=", (varVal, val) => (varVal !== val)],
    [">", (varVal, val) => (varVal > val)],
    [">=", (varVal, val) => (varVal >= val)],
    ["<", (varVal, val) => (varVal < val)],
    ["<=", (varVal, val) => (varVal <= val)]
]);

ConditionEvaluateMap.stringEvaluateMap = new Map([
    ["==", (varVal, val) => (varVal === val)],
    ["!=", (varVal, val) => (varVal !== val)],
    [">", (varVal, val) => (varVal > val)],
    [">=", (varVal, val) => (varVal >= val)],
    ["<", (varVal, val) => (varVal < val)],
    ["<=", (varVal, val) => (varVal <= val)],
    ["startsWith", (varVal, val) => (varVal.startsWith(val))],
    ["not startsWith", (varVal, val) => (!varVal.startsWith(val))],
    ["endsWith", (varVal, val) => (varVal.endsWith(val))],
    ["not endsWith", (varVal, val) => (!varVal.endsWith(val))],
    ["includes", (varVal, val) => (varVal.includes(val))],
    ["not includes",(varVal, val) => (!varVal.includes(val))]
]);

export class ConditionExpression {
    constructor(rowOpr='', varName='', opr='', val='') {
        this.rowOperator_ = rowOpr;
        this.variableName_ = varName;
        this.operator_ = opr;
        this.value_ = val;
    }
    get rowOperator() {return this.rowOperator_;}
    set rowOperator(newVal) {this.rowOperator_ = newVal;}
    get variableName() {return this.variableName_;}
    set variableName(newVal) {this.variableName_ = newVal;}
    get operator() {return this.operator_;}
    set operator(newVal) {this.operator_ = newVal;}
    get value() {return this.value_;}
    set value(newVal) {this.value_ = newVal;}
    evaluate(lastValue, pattern, owner) {
        const varItem = getVariableByName(this.variableName_, owner);
        if (varItem === undefined) 
            throw new Error(`${this.variableName_} is not found in variable table.`)
        let varVal = varItem.value;
        let matches = pattern.exec(this.value_);
        if (matches === null)
            throw new Error(`value: ${this.value_}, no matches found, wrong expression.`);
        let groupItem = matches.groups.bool
        if (groupItem !== undefined) {
            if (typeof varVal !== "boolean") 
                throw new Error(`variable ${this.variableName_} value must be boolean.`);
            let itemVal = (groupItem.toLocaleLowerCase() === 'true') ? true: false;
            return this.internalEval(ConditionEvaluateMap.boolEvaluateMap, lastValue, varVal, itemVal);
        }
        groupItem = matches.groups.num;
        if (groupItem !== undefined) {
            if (typeof varVal !== "number") 
                throw new Error(`variable ${this.variableName_} value must be number.`);
            let itemVal = groupItem.indexOf(".") >= 0 ? parseFloat(groupItem) : parseInt(groupItem);
            if (isNaN(itemVal))
                throw new Error(`value ${groupItem} must be number.`);
            return this.internalEval(ConditionEvaluateMap.generalEvaluateMap, lastValue, varVal, itemVal);
        }
        groupItem = matches.groups.str;
        if (groupItem !== undefined) {
            if (typeof varVal !== "string") 
                throw new Error(`variable ${this.variableName_} value must be string.`);
            let itemVal = matches.groups.strVal;
            return this.internalEval(ConditionEvaluateMap.stringEvaluateMap, lastValue, varVal, itemVal);
        }
        groupItem = matches.groups.date;
        if (groupItem !== undefined) {
            if (!varVal instanceof Date) 
                throw new Error(`variable ${this.variableName_} value must be Date.`);
            let itemVal = new Date(matches.groups.dateVal);
            if (isNaN(itemVal.getTime()))
                throw new Error(`value ${matches.groups.dateVal} must be date.`)
            return this.internalEval(ConditionEvaluateMap.generalEvaluateMap, lastValue, varVal, itemVal);
        }
        groupItem = matches.groups.varName;
        if (groupItem !== undefined) {
            const varItem2 = getVariableByName(groupItem, owner);
            if (varItem2 === undefined) 
                throw new Error(`variable ${groupItem} value must be a valid variable name.`);
            let itemVal = varItem2.value;
            return this.internalEval(ConditionEvaluateMap.generalEvaluateMap, lastValue, varVal, itemVal);
        }
        throw new Error("Value entered error!");
    }
    internalEval(evalMap, lastValue, varVal, itemVal) {
        if (!evalMap.has(this.operator_))
           throw new Error("Value must match its operator list.");
        let func = evalMap.get(this.operator_);
        let result = func(varVal, itemVal);
        if (lastValue !== undefined) 
            result = ConditionEvaluateMap.rowEvaluate(this.rowOperator_, lastValue, result);
        return result;
    }
    toJSON() {
        return {className: this.constructor.name,
            rowOperator: this.rowOperator_,
            variableName: this.variableName_,
            operator: this.operator_,
            value: this.value_
        }
    }
    static fromJSON(value) {
        let obj = new ConditionExpression();
        obj.rowOperator_ = value.rowEvaluate;
        obj.variableName_ = value.variableName;
        obj.operator_ = value.operator;
        obj.value_ = value.value;
        return obj;
    }
}

export class Condition {
    constructor(owner) {
        this.conditionExpressions_ = [];
        this.owner_ = owner;
    }
    get owner() {return this.owner_;}
    set owner(newVal) {this.owner_ = newVal;}
    add(condExpr) {
        this.conditionExpressions_.push(condExpr);
    }
    clear() {
        this.conditionExpressions_ = [];
    }
    evaluate() {
        return this.conditionExpressions_.reduce((lastValue, curr, index, array) => curr.evaluate(lastValue, valueRegExp, this.owner_), undefined);
    }
    toJSON() {
        return {conditionExpressions: this.conditionExpressions_,
            className: this.constructor.name
        }
    }
    static fromJSON(value) {
        let obj = new Condition();
        obj.conditionExpressions_ = value.conditionExpressions;
        return obj;
    }
}
