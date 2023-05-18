chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request.action) {
            case 'get-element-attribute':
                {
                    let ele = request.args.targetElement;
                    if ((ele === null) || (ele === undefined)) 
                        ele = document.querySelector(request.args.target);
                    let attrValue = '';
                    if ((ele !== null) && (ele !== undefined)) 
                        attrValue = ele.getAttribute(request.args.attributeName);
                    sendResponse({type: 'done', result: attrValue});
                    break;
                }
            case 'type-into-value':
                {
                    let ele = request.args.targetElement;
                    if ((ele === null) || (ele === undefined))
                        ele = document.querySelector(request.args.target);
                    if ((ele !== undefined ) && (ele !== null))
                        ele.value = request.args.value;
                    sendResponse({ type: 'done' });
                    break;
                }
            case 'click-element':
                {
                    // Chrome has a bug, when dispatch the MouseEvent, or execute 
                    // the click(), will cause breaking CSP, so move these code
                    // into chrome.scripting.executScript injected function, this is a workaround.
                    let event = new MouseEvent("click", { "bubbles": true, "cancelable": true });
                    let ele = request.args.targetElement;
                    if ((ele === null) || (ele === undefined))
                        ele = document.querySelector(request.args.target);
                    if ((ele !== null) && (ele !== undefined)) 
                        ele.dispatchEvent(event);
                    sendResponse({ type: 'done' });
                    break;
                }
            case 'scroll-to-win-bottom':
                {
                    window.scroll({ top: document.body.scrollHeight, left: 0, behavior: "smooth" });
                    sendResponse({ type: 'done' });
                    break;
                }
            case 'scrape-into-array':
                {
                    let extractData = [];
                    let rows = document.querySelectorAll(request.args.rowSelector);
                    if (rows !== null) {
                        for (let rowItem of rows) {
                            colItems = [];
                            for (let colSeleItem of request.args.colSelectors) {
                                colItem = rowItem.querySelector(colSeleItem);
                                if (colItem !== null) colItems.push(colItem.innerText);
                            }
                            if (colItems !== []) extractData.push(colItems);
                        }
                    }
                    sendResponse({type:'done', result: extractData});
                    break;
                }
            default:
                sendResponse({ type: 'no-action-executed' });
        }
        return true;
    }
);
