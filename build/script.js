"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Graph_js_1 = require("./Graphs/Graph.js");
const commands_js_1 = require("./Algorithms/commands.js");
let currentGraph;
onload = function () {
    currentGraph = new Graph_js_1.Graph();
    //@ts-ignore
    globalThis.currentGraph = currentGraph;
    const explControls = this.document.getElementById("ExplanationButtons");
    document.getElementById("ModeDisplayer").innerHTML = currentGraph.mode;
    document.getElementById("AddButton").addEventListener("click", () => {
        currentGraph.mode = Graph_js_1.Modes.Add;
        document.getElementById("ModeDisplayer").innerHTML = currentGraph.mode;
    });
    document.getElementById("ConnectButton").addEventListener("click", () => {
        currentGraph.mode = Graph_js_1.Modes.Connect;
        document.getElementById("ModeDisplayer").innerHTML = currentGraph.mode;
    });
    document.getElementById("WeightButton").addEventListener("click", () => {
        currentGraph.mode = Graph_js_1.Modes.Weight;
        document.getElementById("ModeDisplayer").innerHTML = currentGraph.mode;
    });
    document.getElementById("AlgorithmButton").addEventListener("click", () => {
        let selection = this.document.getElementById("AlgorithmSelection");
        let algos = [Graph_js_1.Modes.DFS, Graph_js_1.Modes.BFS, Graph_js_1.Modes.Kruskal, Graph_js_1.Modes.Prim];
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
        commands_js_1.steps.doNextStep();
    });
    this.document.getElementById("ExplanationUndoButton").addEventListener("click", () => {
        commands_js_1.steps.undo();
    });
    let id = undefined;
    this.document.getElementById("ExplanationAutoDoButton").addEventListener("click", () => {
        if (id != undefined)
            return;
        id = this.setInterval(commands_js_1.steps.doNextStep, 1000);
    });
    this.document.getElementById("ExplanationStopButton").addEventListener("click", () => {
        const stopAutoButton = this.document.getElementById("ExplanationStopButton");
        if (id == undefined)
            return;
        this.clearInterval(id);
        id = undefined;
    });
    this.document.getElementById("ExplanationClearButton").addEventListener("click", () => {
        commands_js_1.steps.clear();
        explControls.classList.add("NoAlgorithm");
    });
};
