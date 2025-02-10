"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.edgeRepresentation = exports.nodeRepresentation = void 0;
exports.createExplanation = createExplanation;
const Node_js_1 = require("../Graphs/Node.js");
let currentAlertedElement = undefined;
function handleRepresentationOnClick(graphElement) {
    const getAlertClass = (elem) => elem instanceof Node_js_1.Node ? "AlertedNode" : "AlertedEdge";
    const alertClass = getAlertClass(graphElement);
    if (currentAlertedElement !== undefined) {
        const currentAlertClass = getAlertClass(currentAlertedElement);
        currentAlertedElement.svg.classList.remove(currentAlertClass);
    }
    currentAlertedElement = graphElement;
    document.getElementById("ApoJumpScare").hidden = false;
    setTimeout(() => document.getElementById("ApoJumpScare").hidden = true, 500);
    const classes = graphElement.svg.classList;
    //We want the Alerted class to appear before Marked, so that the Alerted animation is prefered
    //The timeout guarentees that if the same element is alerted multiple times, it still shows the animation
    setTimeout(() => {
        if (classes.replace("Marked", alertClass))
            classes.add("Marked");
        else
            classes.add(alertClass);
    }, 5);
}
function createRepresentation(content, graphElement) {
    const result = document.createElement("span");
    result.classList.add("Representation");
    result.addEventListener("click", () => handleRepresentationOnClick(graphElement));
    result.textContent = content;
    return result;
}
const nodeRepresentation = (node) => createRepresentation("Node", node);
exports.nodeRepresentation = nodeRepresentation;
const edgeRepresentation = (edge) => createRepresentation("Edge", edge);
exports.edgeRepresentation = edgeRepresentation;
function createExplanation(isCommand, ...subparts) {
    const exp = document.createElement("div");
    exp.classList.add("Step", (isCommand ? "Command" : "Explanation"));
    exp.append(...subparts);
    return exp;
}
