import {CallbackWrapper} from "./bookmark.js";
import {Activity} from "./workflowcore.js";

export class Sequence extends Activity {
    constructor(myParent) {
        super(myParent);
        this.activities_ = [];
        this.currentIndex_ = 0;
        this.variables_ = [];
    }
    addChild(activity) { this.activities_.push(activity); }
    getChildList() {return this.activities_;}
    addVariable(newVar) {
        if (this.variables_.indexOf(newVar) === -1)
            this.variables_.push(newVar);
    }
    removeVariable(oldVar) {
        let pos = this.variables_.indexOf(oldVar);
        if (pos !== -1) this.variables_.splice(pos, 1);
    }
    updateVariable(oldVar, type, value) {
        let pos = this.variables_.indexOf(oldVar);
        if (pos !== -1) {
            this.variables_[pos].type = type;
            this.variables_[pos].value = value;
        }
    }
    getVarByName(varName) {
        const iter = this.variables_.values();
        for (const item of iter) {
            if (item.name === varName) return item;
        }
        return undefined;
    }
    run(bkmgr) {
        this.currentIndex_ = 0;
        if (this.currentIndex_ < this.activities_.length) {
            let completeCallback = new CallbackWrapper(this, "continueAt");
            bkmgr.runStatement(this.activities_[this.currentIndex_], completeCallback);
        } else
            bkmgr.done(this);
    }
    continueAt(resumed) {
        let mgr = resumed.bookmarkManager;
        this.currentIndex_++;
        if (this.currentIndex_ === this.activities_.length)
            mgr.done(this);
        else {
            let completeCallback = new CallbackWrapper(this, "continueAt");
            mgr.runStatement(this.activities_[this.currentIndex_], completeCallback);
        }
    }
    toJSON() {
        return {
            waitTimeBeforeRun: this.waitTimeBeforeRun_,
            activities: this.activities_,
            variables: this.variables_,
            className: this.constructor.name};
    }
    static fromJSON(value) {
        let obj = new Sequence();
        obj.activities_ = value.activities;
        obj.currentIndex_ = 0;
        obj.variables_ = value.variables;
        obj.waitTimeBeforeRun_ = value.waitTimeBeforeRun;
        return obj;
    }
}

export class While extends Activity {
    constructor(myParent) {
        super(myParent);
        this.expression_ = null;
        this.body_ = null;
    }
    get expression() {return this.expression_;}
    set expression(newVal) {this.expression_ = newVal;}
    get body() {return this.body_;}
    set body(newVal) {this.body_ = newVal;}
    run(bkmgr) {
        if (this.expression_.evaluate()) {
            let completeCallback = new CallbackWrapper(this, "continueAt");
            bkmgr.runStatement(this.body_, completeCallback);
        } else 
            bkmgr.done(this);
    }
    continueAt(resumed) {
        let mgr = resumed.bookmarkManager;
        if (this.expression_.evaluate()) {
            let completeCallback = new CallbackWrapper(this, "continueAt");
            mgr.runStatement(this.body_, completeCallback);
        } else
            mgr.done(this);
    }
    toJSON() {
        return {expression: this.expression_,
            body: this.body_,
            waitTimeBeforeRun: this.waitTimeBeforeRun_,
            className: this.constructor.name};
    }
    static fromJSON(value) {
        let obj = new While();
        obj.expression_ = value.expression;
        obj.body_ = value.body;
        obj.waitTimeBeforeRun_ = value.waitTimeBeforeRun;
        return obj;
    }
}

export class DoWhile extends Activity {
    constructor(myParent) {
        super(myParent);
        this.expression_ = null;
        this.body_ = null;
    }
    get expression() {return this.expression_;}
    set expression(newValue) {this.expression_ = newValue;}
    get body() {return this.body_;}
    set body(newValue) {this.body_ = newValue;}
    run(bkmgr) {
        if (this.body_ === null)
            throw new Error("activity body not defined in DoWhile loop.");
        let completeCallback = new CallbackWrapper(this, "continueAt");
        this.body_.runStatement(this.body_, completeCallback);
    }
    continueAt(resumed) {
        let mgr = resumed.bookmarkManager;
        if (this.expression_ === null)
            throw new Error("expression not defined in DoWhile loop.")
        if (this.expression_.evaluate()) {
            let completeCallback = new CallbackWrapper(this, "continueAt");
            mgr.runStatement(this.body_, completeCallback);
        } else
            mgr.done(this);
    }
    toJSON() {
        return {expression: this.expression_,
            body: this.body_,
            waitTimeBeforeRun: this.waitTimeBeforeRun_,
            className: this.constructor.name};
    }
    static fromJSON(value) {
        let obj = new DoWhile();
        obj.expression_ = value.expression;
        obj.body_ = value.body;
        obj.waitTimeBeforeRun_ = value.waitTimeBeforeRun;
        return obj;
    }
}

export class IfElse extends Activity {
    constructor(myParent) {
        super(myParent);
        this.expression_ = null;
        this.thenStmt_ = null;
        this.elseStmt_ = null;
    }
    get expression() {return this.expression_;}
    set expression(newValue) {this.expression_ = newValue;}
    get thenStatement() {return this.thenStmt_;}
    set thenStatement(newValue) {this.thenStmt_ = newValue;}
    get elseStatement() {return this.elseStmt_;}
    set elseStatement(newValue) {this.elseStmt_ = newValue;}
    run(bkmgr) {
        let completeCallback = new CallbackWrapper(this, "continueAt");
        if (this.expression_.evaluate())
            bkmgr.runStatement(this.thenStmt_, completeCallback);
        else if ((this.elseStmt_ !== undefined) && (this.elseStmt_ !== null))
            bkmgr.runStatement(this.elseStmt_, completeCallback);
        else
            bkmgr.done(this);
    }
    continueAt(resumed) {
        resumed.bookmarkManager.done(this);
    }
    toJSON() {
        return {expression: this.expression_,
            thenStmt: this.thenStmt_,
            elseStmt: this.elseStmt_,
            waitTimeBeforeRun: this.waitTimeBeforeRun_,
            className: this.constructor.name};
    }
    static fromJSON(value) {
        let obj = new IfElse();
        obj.expression_ = value.expression;
        obj.thenStmt_ = value.thenStmt;
        obj.elseStmt_ = value.elseStmt;
        obj.waitTimeBeforeRun_ = value.waitTimeBeforeRun;
        return obj;
    }
}

export class Break extends Activity {
    constructor(myParent) {
        super(myParent);
    }
    run(bkmgr) {
        let loopStmt = this;
        do {
            loopStmt = loopStmt.parent;
            if ((loopStmt instanceof DoWhile) || (loopStmt instanceof While)) {
                bkmgr.done(loopStmt);
                break;
            }
            else if (loopStmt === undefined)
                throw new Error("break statement not find loop statement.");
            else
                bkmgr.removeStatement(loopStmt);
        } while (true);
    }
    toJSON() {
        return {
            waitTimeBeforeRun: this.waitTimeBeforeRun_,
            className: this.constructor.name};
    }
    static fromJSON(value) {
        let obj = new Break();
        obj.waitTimeBeforeRun_ = value.waitTimeBeforeRun;
        return obj;
    }
}