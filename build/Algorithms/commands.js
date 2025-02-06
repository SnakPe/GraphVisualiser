import { nodeRepresentation, edgeRepresentation, createExplanation } from "./graphRepresentation.js";
class Command {
    explanation;
    state;
    subcommands;
    constructor(explanation) {
        this.explanation = explanation;
    }
    explain() {
        //TODO: how do I deal with subcommands? A 2D Array maybe?
        let fullExp = document.createElement("div");
        if (this.subcommands)
            this.subcommands.forEach(com => fullExp.textContent += "\n" + com.explanation.textContent);
        return fullExp;
    }
    getExplanation() {
        return this.explanation;
    }
}
/**
 * preferably used for single commands that dont repeat in their functionality
 * alternativly, one can create factories or something similar with this
 */
export class GeneralCommand extends Command {
    execute;
    undo;
    constructor(execute, undo, explanation, subcommands) {
        super(explanation);
        this.execute = execute;
        this.undo = undo;
        this.subcommands = subcommands;
        this.explanation = explanation;
    }
}
/**
 * @ignore using this is way too complicated and unneccesary
 */
class IfCommand extends Command {
    /**next unexecuted command*/
    subcommandIndex = 0;
    constructor(conditional, onTrue, onFalse, explanation) {
        super(explanation);
        this.explanation = explanation;
        this.execute = () => {
            if (!this.canExecute())
                throw Error("Don't have any commands left to execute");
            if (this.subcommands === undefined) {
                if (conditional())
                    this.subcommands = onTrue;
                else
                    this.subcommands = onFalse;
                this.subcommandIndex = 0;
            }
            else {
                const curCommand = this.subcommands[this.subcommandIndex];
                if (curCommand instanceof IfCommand) {
                    if (curCommand.canExecute())
                        curCommand.execute();
                    else
                        this.subcommandIndex++;
                }
                else if (curCommand instanceof GeneralCommand) {
                    curCommand.execute();
                    this.subcommandIndex++;
                }
            }
        };
    }
    execute;
    undo() {
        const curCommand = this.subcommands[this.subcommandIndex - 1];
        if (curCommand instanceof IfCommand) {
            if (curCommand.canUndo())
                curCommand.undo();
            else if (curCommand.subcommandIndex - 1 < 0)
                this.subcommandIndex--; // this line probably is unneccecary
            else
                throw Error("Can't undo an unexecuted command");
        }
        else {
            curCommand.undo();
            this.subcommandIndex--;
        }
    }
    canExecute() {
        return !this.subcommands || this.subcommandIndex < this.subcommands.length;
    }
    canUndo() {
        return this.subcommands !== undefined && this.subcommandIndex - 1 >= 0;
    }
}
/**
 * This object saves the execution of a graph algorithm, and executes/ undoes one step at a time
 */
export const steps = {
    list: [],
    index: 0, //current command to be executed
    dom: document.getElementById("ExplanationList"),
    addStep(step) {
        steps.list.push(step);
    },
    undo() {
        if (steps.index - 1 < 0)
            return;
        const curStep = steps.list[steps.index - 1];
        // if(curCommand instanceof IfCommand){
        // 	if(curCommand.canUndo())curCommand.undo()
        // 	else if (curCommand.subcommands)steps.index--
        // }
        if (curStep instanceof Command)
            curStep.undo();
        steps.index--;
        if (steps.dom.lastChild !== null)
            steps.dom.removeChild(steps.dom.lastChild);
    },
    doNextStep() {
        if (steps.index >= steps.list.length)
            return;
        const curStep = steps.list[steps.index];
        // if(!(curCommand instanceof IfCommand))
        steps.index++;
        // else{
        // if(curCommand.canExecute())curCommand.execute()
        // else steps.index++
        // }
        if (curStep instanceof Command)
            curStep.execute();
        const explDom = curStep instanceof Command ? curStep.getExplanation() : curStep;
        steps.dom.appendChild(explDom);
    },
    clear() {
        while (steps.index > 0) {
            steps.undo();
        }
        steps.list = [];
    }
};
//@ts-ignore
globalThis.steps = steps;
export function markNode(node) {
    node.visit();
    return new GeneralCommand(() => node.setMark(true), () => node.setMark(false), createExplanation(true, "Visit ", nodeRepresentation(node)));
}
export function useEdge(edge) {
    edge.visit();
    return new GeneralCommand(() => edge.setMark(true), () => edge.setMark(false), createExplanation(true, "Use ", edgeRepresentation(edge)));
}
