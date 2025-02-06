import { Node } from "../Graphs/Node.js";
import { Edge } from "../Graphs/Edge.js";
import { nodeRepresentation, edgeRepresentation, createExplanation } from "./graphRepresentation.js";
export type Explanation = HTMLDivElement
type Step = Command<any>|Explanation


abstract class Command<T>{
  state? : T
  subcommands? : Command<unknown>[]

  constructor(public explanation : Explanation){}
  abstract execute() : any
  abstract undo() : any
  explain() : Explanation{
    //TODO: how do I deal with subcommands? A 2D Array maybe?
    let fullExp = document.createElement("div")
    if(this.subcommands)this.subcommands.forEach(com => fullExp.textContent += "\n" + com.explanation.textContent)
    return fullExp
  }
  getExplanation(){
    return this.explanation
  }
}
/**
 * preferably used for single commands that dont repeat in their functionality 
 * alternativly, one can create factories or something similar with this
 */
export class GeneralCommand extends Command<never>{
  execute : () => void ;
  undo : () => void ;
  constructor(execute : () => void , undo : () => void, explanation : Explanation, subcommands? : Command<never>[]){
    super(explanation)
    this.execute = execute
    this.undo = undo
    this.subcommands = subcommands
    this.explanation = explanation
  }
}
/**
 * @ignore using this is way too complicated and unneccesary
 */
class IfCommand extends Command<never>{
  /**next unexecuted command*/
  private subcommandIndex : number = 0
  constructor(conditional : () => boolean, onTrue : Command<unknown>[], onFalse : Command<unknown>[], explanation : Explanation){
    super(explanation)	
    this.explanation = explanation
    
    this.execute = () => {
      if(!this.canExecute())throw Error("Don't have any commands left to execute")

      if(this.subcommands === undefined){
        if(conditional()) this.subcommands = onTrue
        else this.subcommands = onFalse
        this.subcommandIndex = 0
      }
      else{
        const curCommand = this.subcommands[this.subcommandIndex]

        if(curCommand instanceof IfCommand){
          if(curCommand.canExecute())curCommand.execute()
          else this.subcommandIndex++
        }
        else if (curCommand instanceof GeneralCommand){
          curCommand.execute()
          this.subcommandIndex++
        }
      }
    }
    
  }
  execute : () => void
  undo(){
    const curCommand = this.subcommands![this.subcommandIndex-1]
    if(curCommand instanceof IfCommand){
      if(curCommand.canUndo())curCommand.undo()
      else if (curCommand.subcommandIndex-1 < 0)this.subcommandIndex-- // this line probably is unneccecary
      else throw Error("Can't undo an unexecuted command")
    }else{
      curCommand.undo()
      this.subcommandIndex--
    }
    
  }
  canExecute() : boolean{
    return !this.subcommands || this.subcommandIndex < this.subcommands.length
  }
  canUndo() : boolean{
    return this.subcommands !== undefined && this.subcommandIndex-1 >= 0
  }
}

/**
 * This object saves the execution of a graph algorithm, and executes/ undoes one step at a time
 */
export const steps : {list : Step[], index : number, dom : HTMLDivElement, addStep : (step : Step) => void, undo : () => void, doNextStep: () => void, clear : () => void} = {
  list : [],
  index : 0, //current command to be executed
  dom : document.getElementById("ExplanationList") as HTMLDivElement,
  addStep(step : Step){
    steps.list.push(step)
  },
  undo(){
    if(steps.index-1 < 0)return
    const curStep : Step = steps.list[steps.index-1] 
    // if(curCommand instanceof IfCommand){
    // 	if(curCommand.canUndo())curCommand.undo()
    // 	else if (curCommand.subcommands)steps.index--
    // }
    if(curStep instanceof Command)curStep.undo()
    steps.index--
    if(steps.dom.lastChild !== null)steps.dom.removeChild(steps.dom.lastChild)
  },
  doNextStep(){
    if(steps.index >= steps.list.length)return
    const curStep : Step = steps.list[steps.index]
    // if(!(curCommand instanceof IfCommand))
      steps.index++
    // else{
      // if(curCommand.canExecute())curCommand.execute()
      // else steps.index++
    // }
    if(curStep instanceof Command)curStep.execute()
    const explDom : Explanation = curStep instanceof Command ? curStep.getExplanation() : curStep
    steps.dom.appendChild(explDom)
  },
  clear(){
    while(steps.index > 0){
      steps.undo()
    }
    steps.list = []

  }
}
//@ts-ignore
globalThis.steps = steps

export function markNode(node : Node){
  node.visit()
  return new GeneralCommand(
    () => node.setMark(true),
    () => node.setMark(false),
    createExplanation(true, "Visit ", nodeRepresentation(node))
  )
}
export function useEdge(edge : Edge){
  edge.visit()
  return new GeneralCommand(
    () => edge.setMark(true),
    () => edge.setMark(false),
    createExplanation(true, "Use ", edgeRepresentation(edge))
  )
}
