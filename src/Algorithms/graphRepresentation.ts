import { Node } from "../Graphs/Node.js";
import { Edge } from "../Graphs/Edge.js";
import { Explanation } from "./commands.js";

let currentAlertedElement : Node|Edge|undefined = undefined

function handleRepresentationOnClick(graphElement : Node|Edge){
  const getAlertClass = (elem : Node|Edge) => elem instanceof Node ? "AlertedNode" : "AlertedEdge"
  const alertClass = getAlertClass(graphElement)

  if(currentAlertedElement !== undefined){
    const currentAlertClass = getAlertClass(currentAlertedElement)
    currentAlertedElement.svg.classList.remove(currentAlertClass)
  }
  currentAlertedElement = graphElement

  document.getElementById("ApoJumpScare")!.hidden = false
  setTimeout(() => document.getElementById("ApoJumpScare")!.hidden = true,500)

  const classes = graphElement.svg.classList
  //We want the Alerted class to appear before Marked, so that the Alerted animation is prefered
  //The timeout guarentees that if the same element is alerted multiple times, it still shows the animation
  setTimeout(() => {
    if(classes.replace("Marked", alertClass))classes.add("Marked")
    else classes.add(alertClass)
  },5)
}


function createRepresentation(content : string, graphElement : Node|Edge){
  const result = document.createElement("span")
  result.classList.add("Representation")
  result.addEventListener("click", () => handleRepresentationOnClick(graphElement))
  result.textContent = content
  return result
}
export const nodeRepresentation = (node : Node) : HTMLElement => createRepresentation("Node", node)
export const edgeRepresentation = (edge : Edge) : HTMLElement => createRepresentation("Edge", edge)

export function createExplanation(isCommand : boolean, ...subparts : (string|HTMLSpanElement)[]) : Explanation{
  const exp = document.createElement("div")
  exp.classList.add("Step", (isCommand ? "Command" : "Explanation"))
  exp.append(...subparts)
  return exp
}
