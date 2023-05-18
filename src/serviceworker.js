import {parseJSON, WorkflowRuntime, generateCode} from "./workflowruntime.js";

let wfRuntime = new WorkflowRuntime();

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request.action) {
            case 'run':
                setTimeout(()=>{run()},0);
                sendResponse({type:"done"});
                break;
            case 'get-root':
                sendResponse({type:'done', result: wfRuntime.getInstance(0).workflow});
                break;
            case 'generate-code':
                wfRuntime.createInstance(generateCode());
                sendResponse({type:'done'});
                break;
            case 'load-and-run':
                wfRuntime.clearEnviroment();
                setTimeout(()=>{loadAndRun(request.jsonText);})
                sendResponse({type: 'done'});
                break;
            default:
                sendResponse({type:"no-action-executed"});
        }
        return true;
    }
);

function loadAndRun(jsonText) {
    let inst = wfRuntime.createInstance(parseJSON(jsonText));
    inst.runProgram();
}

function run() {
    let inst = wfRuntime.createInstance(generateCode());
    inst.runProgram();
}
