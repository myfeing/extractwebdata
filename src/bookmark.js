export class CallbackWrapper {
    constructor(obj, method_name) {
        this.object_ = obj;
        this.method_name_ = method_name;
    }
    get callbackObject() {return this.object_;}
    get callbackMethodName() {return this.method_name_;}
}

export class Bookmark {
    constructor(bkManager=null, name='') {
        this.bookmarkManager_ = bkManager;
        this.name_ = name;
        }
    get name() {return this.name_;}
    get bookmarkManager() {return this.bookmarkManager_;}
}

export class BookmarkManager {
    constructor() {
        this.bookmarks_ = new Map();
        this.statementObjects_ = new Map();
        this.defaultBookmark_ = new Bookmark(this, '');
    }
    add(bookmark, callbackWrapper) {
        if (!this.statementObjects_.has(callbackWrapper.callbackObject)) {
            throw new Error("This bookmark belonged to object which hasn't been put into BookmarkManager's dictionary(statementObjects_), can't add bookmark.");
        }
        if (!this.bookmarks_.has(bookmark)) {
            this.bookmarks_.set(bookmark, callbackWrapper);
        }
    }
    remove(bookmark) {
        if (this.bookmarks_.has(bookmark)) {
            this.bookmarks_.delete(bookmark);
        }
    }
    resume(bookmark) {
        if (this.bookmarks_.has(bookmark)) {
            let callback = this.bookmarks_.get(bookmark);
            setTimeout(() => {
                callback.callbackObject[callback.callbackMethodName](bookmark);
            }, 0);
        }
    }
    resumeAll(bookmarkName) {
        this.bookmarks_.forEach((val, key) => {
            if (key.name === bookmarkName) {
                setTimeout(()=> {
                    let callbackObject = val.callbackObject;
                    let callbackMethod = val.callbackMethodName;
                    callbackObject[callbackMethod](key);
                }, 0);
            }
        });
    }
    removeStatement(statementObject) {
        if (this.statementObjects_.has(statementObject))
            this.statementObjects_.delete(statementObject);
    }
    runStatement(statementObject, completeCallback) {
        if (!this.statementObjects_.has(statementObject)) {
            this.statementObjects_.set(statementObject, completeCallback);
        }
        setTimeout(() => {
            statementObject.run(this);
        }, statementObject.waitTimeBeforeRun);
    }
    done(statementObject) {
        if (!this.statementObjects_.has(statementObject)) {
            throw new Error("This object that to be done hasn't been put into BookmarkManager's dictionary(statementObjects_). "+statementObject.constructor.name);
        }
        let childList = statementObject.getChildList();
        if (childList !== undefined) {
            for (let child of childList) {
                if (this.statementObjects_.has(child)) {
                    throw new Error("This object that to be done has child activity not being done. ")+statementObject.constructor.name;
                }
            }
        }
        this.bookmarks_.forEach((val, key)=>{
            if (val.callbackObject === statementObject) {
                throw new Error("This object that to be done has bookmark unremoved. "+statementObject.constructor.name);
            }
        });
        let completeCallback = this.statementObjects_.get(statementObject);
        setTimeout(() => {
            completeCallback.callbackObject[completeCallback.callbackMethodName](this.defaultBookmark_);
        }, 0);
        this.statementObjects_.delete(statementObject);
    }
}
