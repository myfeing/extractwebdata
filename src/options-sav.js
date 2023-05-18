import {stringToArrayBuffer} from './utils.js';

let page = document.getElementById("downloadLink");
let extractData = document.getElementById("extractData");
let generateCode = document.getElementById("generate-code");
let exportJson = document.getElementById("export-json");
let loadJsonAndRun = document.getElementById("load-json-and-run");
let importJson = document.getElementById("importJson");
let wLink;
let pageUrl = 'https://ehire.51job.com/Revision/talent/search?rt=1662687686528';

extractData.addEventListener("click", () => {
    chrome.tabs.query({url: pageUrl},(tabs)=>{
        let tabIdx = tabs[0].index;
        chrome.tabs.highlight({tabs: tabIdx}, (win)=>{
            if (wLink !== undefined) {
                wLink.remove();
            }
            chrome.runtime.sendMessage({action: 'run'});
        });
    });
});

generateCode.addEventListener('click',()=>{
    chrome.tabs.query({url: pageUrl},(tabs)=>{
        let tabIdx = tabs[0].index;
        chrome.tabs.highlight({tabs: tabIdx}, (win)=>{
            if (wLink !== undefined) {
                wLink.remove();
            }
            chrome.runtime.sendMessage({action: 'generate-code'});
        });
    });
});

exportJson.addEventListener('click',() => {
    chrome.runtime.sendMessage({action: 'get-root'}, (response)=>{
        let jsonTxt = JSON.stringify(response.result, null, 4);
        let blob = new Blob([jsonTxt], {type:'octet/stream'});
        let turl = URL.createObjectURL(blob);
        let link = document.createElement('a');
        link.setAttribute('download', 'workflow.json');
        link.setAttribute('href', turl);
        link.click();
    })
});

importJson.addEventListener("change", (e) => {
    let files = e.target.files;
    let reader = new FileReader();
    reader.onload = () => {
        chrome.tabs.query({url: pageUrl},(tabs)=>{
            let tabIdx = tabs[0].index;
            chrome.tabs.highlight({tabs: tabIdx}, (win)=>{
                if (wLink !== undefined) {
                    wLink.remove();
                }
                chrome.runtime.sendMessage({action: "load-and-run", jsonText: reader.result});
            });
        });
        importJson.value = '';
    }
    reader.readAsText(files[0]);
});

loadJsonAndRun.addEventListener("click", ()=>{
    importJson.click();
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request.action) {
            case 'add-download-link':
                let buf = stringToArrayBuffer(request.workbookObject.objectStream);
                let wBlob = new Blob([buf], {type: 'octet/stream'});
                let wUrl = URL.createObjectURL(wBlob);
                wLink = document.createElement('a');
                wLink.setAttribute('href', wUrl);
                wLink.setAttribute('download', request.workbookObject.fileName);
                wLink.innerText= 'download '+request.workbookObject.fileName;
                page.appendChild(wLink);
                sendResponse({type:"done"});
                break;
            default:
                sendResponse({type:"no-action-executed"});
        }
        return true;
    }
);