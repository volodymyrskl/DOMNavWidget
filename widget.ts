interface ElementNode {
    id: string;
    tagName: string;
    attributes: Record<string, string>;
    children: ElementNode[];
    originalElement?: HTMLElement;
}

let parsedTree: ElementNode;

function InitiateWidget() {
    const parsedTreeStyles = `
        position: fixed;
        top: 10px;
        right: 10px;
        width: 400px;
        height: 100%;
        background-color: #fff;
        border: 1px solid #aaa;
        border-radius: 5px;
        padding: 10px;
        overflow-y: auto;
        z-index: 9999;
    `;

    const nodeStyles = `
        margin: 5px 0 5px 10px;
    `;

    const toggleBtnStyles = `
        cursor: pointer;
        margin-right: 5px;
    `;

    const nodeContentStyles = `
        cursor: default;
        margin-right: 5px;
    `;

    const nodeScrollToStyles = `
        border: 1px solid #aaa;
        padding: 2px;
        cursor: pointer;
    `;

    const childrenContainerStyles = `
        margin-left: 10px;
        border-left: 1px solid #aaa;
        display: none;
    `;

    function parseDOMTree(rootElement: HTMLElement, parentIndex: string = ''): ElementNode {
        const stack: { element: HTMLElement; parent: ElementNode }[] = [];
        const parsedTree: ElementNode = {
            id: '',
            tagName: rootElement.tagName.toLowerCase(),
            attributes: {},
            children: [],
            originalElement: rootElement,
        };
    
        stack.push({ element: rootElement, parent: parsedTree });
    
        while (stack.length > 0) {
            const { element, parent } = stack.pop()!;
            const parentIndexWithId = parentIndex ? `${parentIndex}-${parent.id}` : parent.id;
    
            const parsedElement: ElementNode = {
                id: '',
                tagName: element.tagName.toLowerCase(),
                attributes: {},
                children: [],
                originalElement: element,
            };
    
            for (let i = 0; i < element.attributes.length; i++) {
                const attribute = element.attributes[i];
                parsedElement.attributes[attribute.name] = attribute.value;
            }
    
            let elementIndex = 1;
            if (element.parentElement) {
                //@ts-ignore
                elementIndex = Array.from(element.parentElement.children).indexOf(element) + 1;
            }
    
            const elementId = `${parentIndexWithId}-${parsedElement.tagName}_${elementIndex}`;
            parsedElement.id = elementId;
    
            parent.children.push(parsedElement);
    
            for (let i = element.children.length - 1; i >= 0; i--) {
                const childElement = element.children[i] as HTMLElement;
                stack.push({ element: childElement, parent: parsedElement });
            }
        }
    
        return parsedTree;
    }

    function generateHTML(node: ElementNode): string {
        const nodeId = node.id;
        let html = `<div style="${nodeStyles}" onmouseover="highlightElement(this, event)" data-node-id="${nodeId}">`;

        html += `<span style="${toggleBtnStyles}" onclick="toggleNode(this)">&#9654;</span>`;

        html += `<span style="${nodeContentStyles}">Tag name: <b>${node.tagName}</b></span>`;

        html += `<span style="${nodeScrollToStyles}" onclick="scrollToOriginalElement('${nodeId}')">Go to Element</span>`;

        if (node.children.length > 0) {
            html += `<div class="children" style="${childrenContainerStyles}">`;

            for (const child of node.children) {
                html += generateHTML(child);
            }

            html += `</div>`;
        }

        html += `</div>`;

        return html;
    }

    const rootElement = document.getRootNode().childNodes[1] as HTMLElement;
    parsedTree = parseDOMTree(rootElement as HTMLElement);

    const div = document.createElement('div');
    div.setAttribute("id", "parsed-tree");
    div.setAttribute("style", parsedTreeStyles);
    div.innerHTML = generateHTML(parsedTree);
    document.body.appendChild(div);
};

function toggleNode(element: HTMLElement): void {
    const parent = element.parentElement;
    const childrenContainer = parent!.querySelector('.children') as HTMLElement;

    if (!childrenContainer) {
        console.error('Could not find children container.');
        return;
    }

    if (childrenContainer.style.display === "none") {
        element.innerHTML = "&#9660;";
        childrenContainer.style.display = "block";
    } else {
        element.innerHTML = "&#9654;";
        childrenContainer.style.display = "none";
    }
}

let highlightedElement: HTMLElement | null = null;

function highlightElement(nodeElement: HTMLElement, event: MouseEvent) {
    event.stopPropagation();

    const nodeId = nodeElement.getAttribute('data-node-id');

    if (nodeId) {
        const node = getNodeById(nodeId, parsedTree);
        const originalElement = node?.originalElement;
    
        if (originalElement && highlightedElement !== originalElement) {
            const originalStyles = originalElement.getAttribute('style');
            const highlightStyle = "background-color: yellow;";
    
            if (highlightedElement) {
                highlightedElement.removeAttribute('style');
            }
    
            originalElement.setAttribute('style', `${originalStyles ? originalStyles + ';' : ''} ${highlightStyle}`);
            highlightedElement = originalElement;
    
            nodeElement.addEventListener("mouseleave", () => {
                if (originalStyles) {
                    originalElement.setAttribute('style', originalStyles);
                } else {
                    originalElement.removeAttribute('style');
                }
                highlightedElement = null;
            });
        }
    }
}

function scrollToOriginalElement(nodeId: string) {
    const node = getNodeById(nodeId, parsedTree);
    if (node && node.originalElement) {
        node.originalElement.scrollIntoView({ behavior: 'smooth' });
    }
}

function getNodeById(nodeId: string, node: ElementNode): ElementNode | null {
    const stack: ElementNode[] = [node];

    while (stack.length > 0) {
        const currentNode = stack.pop()!;
        if (currentNode.id === nodeId) {
            return currentNode;
        }

        for (let i = currentNode.children.length - 1; i >= 0; i--) {
            stack.push(currentNode.children[i]);
        }
    }

    return null;
}

window.addEventListener('load', InitiateWidget);
