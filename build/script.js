import { Graph, Modes } from "./Graphs/Graph.js";
import { steps } from "./Algorithms/commands.js";
let currentGraph;
onload = function () {
    currentGraph = new Graph();
    //@ts-ignore
    globalThis.currentGraph = currentGraph;
    const explControls = this.document.getElementById("ExplanationButtons");
    document.getElementById("ModeDisplayer").innerHTML = currentGraph.mode;
    document.getElementById("AddButton").addEventListener("click", () => {
        currentGraph.mode = Modes.Add;
        document.getElementById("ModeDisplayer").innerHTML = currentGraph.mode;
    });
    document.getElementById("ConnectButton").addEventListener("click", () => {
        currentGraph.mode = Modes.Connect;
        document.getElementById("ModeDisplayer").innerHTML = currentGraph.mode;
    });
    document.getElementById("WeightButton").addEventListener("click", () => {
        currentGraph.mode = Modes.Weight;
        document.getElementById("ModeDisplayer").innerHTML = currentGraph.mode;
    });
    document.getElementById("AlgorithmButton").addEventListener("click", () => {
        let selection = this.document.getElementById("AlgorithmSelection");
        let algos = [Modes.DFS, Modes.BFS, Modes.Kruskal, Modes.Prim];
        if (selection.hasChildNodes())
            selection.innerHTML = "";
        else
            algos.forEach((algo) => {
                let button = this.document.createElement("button");
                button.classList.add("AlgorithmButton");
                button.textContent = `${algo}`;
                button.addEventListener("click", () => {
                    currentGraph.mode = algo;
                    document.getElementById("ModeDisplayer").innerHTML = currentGraph.mode;
                });
                selection.appendChild(button);
            });
    });
    this.document.getElementById("ExplanationDoButton").addEventListener("click", () => {
        steps.doNextStep();
    });
    this.document.getElementById("ExplanationUndoButton").addEventListener("click", () => {
        steps.undo();
    });
    let id = undefined;
    this.document.getElementById("ExplanationAutoDoButton").addEventListener("click", () => {
        if (id != undefined)
            return;
        id = this.setInterval(steps.doNextStep, 1000);
    });
    this.document.getElementById("ExplanationStopButton").addEventListener("click", () => {
        const stopAutoButton = this.document.getElementById("ExplanationStopButton");
        if (id == undefined)
            return;
        this.clearInterval(id);
        id = undefined;
    });
    this.document.getElementById("ExplanationClearButton").addEventListener("click", () => {
        steps.clear();
        explControls.classList.add("NoAlgorithm");
    });
};
