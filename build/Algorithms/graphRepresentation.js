import { Node } from "../Graphs/Node.js";
let currentAlertedElement = undefined;
function handleRepresentationOnClick(graphElement) {
    const getAlertClass = (elem) => elem instanceof Node ? "AlertedNode" : "AlertedEdge";
    const alertClass = getAlertClass(graphElement);
    if (currentAlertedElement !== undefined) {
        const currentAlertClass = getAlertClass(currentAlertedElement);
        currentAlertedElement.svg.classList.remove(currentAlertClass);
    }
    currentAlertedElement = graphElement;
    if (graphElement instanceof Node)
        new Audio("./src/Algorithms/STREAMING-wrong-answer-fail-buzzer-jam-fx-1-00-00.mp3").play();
    else
        new Audio("./src/Algorithms/in-die-futterlucke.mp3").play();
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
export const nodeRepresentation = (node) => createRepresentation("Node", node);
export const edgeRepresentation = (edge) => createRepresentation("Edge", edge);
export function createExplanation(isCommand, ...subparts) {
    const exp = document.createElement("div");
    exp.classList.add("Step", (isCommand ? "Command" : "Explanation"));
    exp.append(...subparts);
    return exp;
}
