import {getVariableByName} from './workflowruntime.js';
import {Activity} from "./workflowcore.js";

export class Increase extends Activity {
    constructor(myParent, variName = '', incr = 0) {
        super(myParent);
        this.variableName_ = variName;
        this.increment_ = incr;
    }
    get variableName() {return this.variableName_;}
    set variableName(newVal) {this.variableName_ = newVal;}
    get increment() {return this.increment_;}
    set increment(newVal) {this.increment_ = newVal;}
    getVariable() {
        if (this.variableName_ !== '') {
            const varItem = getVariableByName(this.variableName_, this);
            return varItem;
        } else
            return undefined;
    }
    run(bkmgr) {
        let varItem = this.getVariable();
        if (varItem !== undefined)
            varItem.value = ((varItem.value === undefined) ? 0 : varItem.value) + this.increment_;
        bkmgr.done(this);
    }
    toJSON() {
        return {variableName: this.variableName_,
            increment: this.increment_,
            waitTimeBeforeRun: this.waitTimeBeforeRun_,
            className: this.constructor.name};
    }
    static fromJSON(value) {
        let obj = new Increase();
        obj.variableName_ = value.variableName;
        obj.increment_ = value.increment;
        obj.waitTimeBeforeRun_ = value.waitTimeBeforeRun;
        return obj;
    }
}

export class ArrayConcat extends Activity {
    constructor(myParent) {
        super(myParent);
        this.inputArrayVariableName1_ = '';
        this.inputArrayVariableName2_ = '';
        this.outputArrayVariableName_ = '';
    }
    get inputArrayVariableName1() {return this.inputArrayVariableName1_;}
    set inputArrayVariableName1(newVal) {this.inputArrayVariableName1_ = newVal;}
    get inputArrayVariableName2() {return this.inputArrayVariableName2_;}
    set inputArrayVariableName2(newVal) {this.inputArrayVariableName2_ = newVal;}
    get outputArrayVariableName() {return this.outputArrayVariableName_;}
    set outputArrayVariableName(newVal) {this.outputArrayVariableName_ = newVal;}
    getVariable(varName) {
        if (this.varName_ !== '') {
            const varItem = getVariableByName(varName, this);
            return varItem;
        } else
            return undefined;
    }
    run(bkmgr) {
        if ((this.inputArrayVariableName1_ === '')||(this.inputArrayVariableName2_ === '')||(this.outputArrayVariableName_ === ''))
            throw new Error('ArrayConcat input variable and outputvariable must be specified.');
        let inputVar1 = this.getVariable(this.inputArrayVariableName1_);
        if (inputVar1 === undefined)
            throw new Error('ArayConcat.inputVariableName1 is error.');
        if (!inputVar1.value instanceof Array)
            throw new Error('ArrayConcat inputVariable1 must be Array.');
        let inputVar2 = this.getVariable(this.inputArrayVariableName2_);
        if (inputVar2 === undefined)
            throw new Error('ArayConcat.inputVariableName2 is error.');
        if (!inputVar2.value instanceof Array)
            throw new Error('ArrayConcat inputVariable2 must be Array.');
        let outputVar = this.getVariable(this.outputArrayVariableName_);
        if (outputVar === undefined)
            throw new Error('ArayConcat.outputVariableName is error.');
        if (!outputVar.value instanceof Array)
            throw new Error('ArrayConcat outputVariable must be Array.');
        outputVar.value = inputVar1.value.concat(inputVar2.value);
        bkmgr.done(this);
    }
    toJSON() {
        return {inputArrayVariableName1: this.inputArrayVariableName1_,
            inputArrayVariableName2: this.inputArrayVariableName2_,
            outputArrayVariableName: this.outputArrayVariableName_,
            waitTimeBeforeRun: this.waitTimeBeforeRun_,
            className: 'ArrayConcat'};
    }
    static fromJSON(value) {
        let obj = new ArrayConcat();
        obj.inputArrayVariableName1_ = value.inputArrayVariableName1;
        obj.inputArrayVariableName2_ = value.inputArrayVariableName2;
        obj.outputArrayVariableName_ = value.outputArrayVariableName;
        obj.waitTimeBeforeRun_ = value.waitTimeBeforeRun;
        return obj;
    }
}