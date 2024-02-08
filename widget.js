var parsedTree;
function InitiateWidget() {
    var parsedTreeStyles = "\n        position: fixed;\n        top: 10px;\n        right: 10px;\n        width: 400px;\n        height: 100%;\n        background-color: #fff;\n        border: 1px solid #aaa;\n        border-radius: 5px;\n        padding: 10px;\n        overflow-y: auto;\n        z-index: 9999;\n    ";
    var nodeStyles = "\n        margin: 5px 0 5px 10px;\n    ";
    var toggleBtnStyles = "\n        cursor: pointer;\n        margin-right: 5px;\n    ";
    var nodeContentStyles = "\n        cursor: default;\n        margin-right: 5px;\n    ";
    var nodeScrollToStyles = "\n        border: 1px solid #aaa;\n        padding: 2px;\n        cursor: pointer;\n    ";
    var childrenContainerStyles = "\n        margin-left: 10px;\n        border-left: 1px solid #aaa;\n        display: none;\n    ";
    function parseDOMTree(rootElement, parentIndex) {
        if (parentIndex === void 0) { parentIndex = ''; }
        var stack = [];
        var parsedTree = {
            id: '',
            tagName: rootElement.tagName.toLowerCase(),
            attributes: {},
            children: [],
            originalElement: rootElement,
        };
        stack.push({ element: rootElement, parent: parsedTree });
        while (stack.length > 0) {
            var _a = stack.pop(), element = _a.element, parent_1 = _a.parent;
            var parentIndexWithId = parentIndex ? "".concat(parentIndex, "-").concat(parent_1.id) : parent_1.id;
            var parsedElement = {
                id: '',
                tagName: element.tagName.toLowerCase(),
                attributes: {},
                children: [],
                originalElement: element,
            };
            for (var i = 0; i < element.attributes.length; i++) {
                var attribute = element.attributes[i];
                parsedElement.attributes[attribute.name] = attribute.value;
            }
            var elementIndex = 1;
            if (element.parentElement) {
                // @ts-ignore
                elementIndex = Array.from(element.parentElement.children).indexOf(element) + 1;
            }
            var elementId = "".concat(parentIndexWithId, "-").concat(parsedElement.tagName, "_").concat(elementIndex);
            parsedElement.id = elementId;
            parent_1.children.push(parsedElement);
            for (var i = element.children.length - 1; i >= 0; i--) {
                var childElement = element.children[i];
                stack.push({ element: childElement, parent: parsedElement });
            }
        }
        return parsedTree;
    }
    function generateHTML(node) {
        var nodeId = node.id;
        var html = "<div style=\"".concat(nodeStyles, "\" onmouseover=\"highlightElement(this, event)\" data-node-id=\"").concat(nodeId, "\">");
        html += "<span style=\"".concat(toggleBtnStyles, "\" onclick=\"toggleNode(this)\">&#9654;</span>");
        html += "<span style=\"".concat(nodeContentStyles, "\">Tag name: <b>").concat(node.tagName, "</b></span>");
        html += "<span style=\"".concat(nodeScrollToStyles, "\" onclick=\"scrollToOriginalElement('").concat(nodeId, "')\">Go to Element</span>");
        if (node.children.length > 0) {
            html += "<div class=\"children\" style=\"".concat(childrenContainerStyles, "\">");
            for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
                var child = _a[_i];
                html += generateHTML(child);
            }
            html += "</div>";
        }
        html += "</div>";
        return html;
    }
    var rootElement = document.getRootNode().childNodes[1];
    parsedTree = parseDOMTree(rootElement);
    var div = document.createElement('div');
    div.setAttribute("id", "parsed-tree");
    div.setAttribute("style", parsedTreeStyles);
    div.innerHTML = generateHTML(parsedTree);
    document.body.appendChild(div);
}
;
function toggleNode(element) {
    var parent = element.parentElement;
    var childrenContainer = parent.querySelector('.children');
    if (!childrenContainer) {
        console.error('Could not find children container.');
        return;
    }
    if (childrenContainer.style.display === "none") {
        element.innerHTML = "&#9660;";
        childrenContainer.style.display = "block";
    }
    else {
        element.innerHTML = "&#9654;";
        childrenContainer.style.display = "none";
    }
}
var highlightedElement = null;
function highlightElement(nodeElement, event) {
    event.stopPropagation();
    var nodeId = nodeElement.getAttribute('data-node-id');
    if (nodeId) {
        var node = getNodeById(nodeId, parsedTree);
        var originalElement_1 = node === null || node === void 0 ? void 0 : node.originalElement;
        if (originalElement_1 && highlightedElement !== originalElement_1) {
            var originalStyles_1 = originalElement_1.getAttribute('style');
            var highlightStyle = "background-color: yellow;";
            if (highlightedElement) {
                highlightedElement.removeAttribute('style');
            }
            originalElement_1.setAttribute('style', "".concat(originalStyles_1 ? originalStyles_1 + ';' : '', " ").concat(highlightStyle));
            highlightedElement = originalElement_1;
            nodeElement.addEventListener("mouseleave", function () {
                if (originalStyles_1) {
                    originalElement_1.setAttribute('style', originalStyles_1);
                }
                else {
                    originalElement_1.removeAttribute('style');
                }
                highlightedElement = null;
            });
        }
    }
}
function scrollToOriginalElement(nodeId) {
    var node = getNodeById(nodeId, parsedTree);
    if (node && node.originalElement) {
        node.originalElement.scrollIntoView({ behavior: 'smooth' });
    }
}
function getNodeById(nodeId, node) {
    var stack = [node];
    while (stack.length > 0) {
        var currentNode = stack.pop();
        if (currentNode.id === nodeId) {
            return currentNode;
        }
        for (var i = currentNode.children.length - 1; i >= 0; i--) {
            stack.push(currentNode.children[i]);
        }
    }
    return null;
}
window.addEventListener('load', InitiateWidget);
