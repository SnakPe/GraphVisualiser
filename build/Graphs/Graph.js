"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Graph = exports.Modes = void 0;
const Node_js_1 = require("./Node.js");
const Edge_js_1 = require("./Edge.js");
const Algorithms = __importStar(require("../Algorithms/algorithms.js"));
const commands_js_1 = require("../Algorithms/commands.js");
var Modes;
(function (Modes) {
    Modes["Add"] = "Add";
    Modes["Connect"] = "Connect";
    Modes["Weight"] = "Weight";
    Modes["DFS"] = "DFS";
    Modes["BFS"] = "BFS";
    Modes["Kruskal"] = "Kruskal";
    Modes["Prim"] = "Prim";
})(Modes || (exports.Modes = Modes = {}));
class Graph {
    nodes;
    edges;
    lastClickedNode = null;
    mode = Modes.Add;
    svg;
    zoom = 1;
    /*
    coords of the top left corner of the svg
    */
    x = 0;
    y = 0;
    holdingDownPointer = false;
    movingCanvas = true;
    canDragNode = false;
    isDraggingNode = false;
    draggedNode = null;
    constructor(nodes, edges) {
        this.svg = document.getElementById("MainCanvas");
        this.nodes = nodes ? nodes : [];
        this.edges = edges ? edges : [];
        this.svg.setAttribute("viewBox", `${0} ${0} ${this.svg.width.baseVal.value} ${this.svg.height.baseVal.value}`);
        this.svg.addEventListener("pointerup", (ev) => {
            switch (this.mode) {
                case Modes.Add:
                    graphInteractionHandler.addNode(this, ev);
                    break;
                default:
                    if (ev.target.id === "MainCanvas")
                        this.lastClickedNode = null;
                    break;
            }
            this.holdingDownPointer = false;
            this.movingCanvas = false;
            this.isDraggingNode = false;
        });
        this.svg.addEventListener("pointermove", (ev) => graphInteractionHandler.changeViewbox(this, ev));
        this.svg.addEventListener("pointerleave", () => this.movingCanvas = this.canDragNode = false);
        this.svg.addEventListener("pointerdown", () => this.holdingDownPointer = true);
        this.svg.addEventListener("wheel", (ev) => graphInteractionHandler.applyZoom(this, ev));
        window.onresize = () => this.refreshSVG();
    }
    refreshSVG() {
        const width = this.svg.width.animVal.value * this.zoom;
        const height = this.svg.height.animVal.value * this.zoom;
        if (height > 0 && width > 0)
            this.svg.setAttribute("viewBox", `${this.x} ${this.y} ${width} ${height}`);
    }
    createNode(x, y) {
        const newNode = new Node_js_1.Node(x + this.x, y + this.y, this.svg);
        newNode.svg.addEventListener("pointerup", (ev) => {
            const graph = this;
            if (!this.isDraggingNode)
                switch (this.mode) {
                    case Modes.Add:
                        nodeInteractionHandler.removeNode(newNode, this);
                        break;
                    case Modes.Connect:
                        nodeInteractionHandler.connectOrSaveNode(newNode, this);
                        break;
                    case Modes.DFS:
                        nodeInteractionHandler.executeAlgoritm(() => Algorithms.dfs(newNode), () => this.clearAllMarks());
                        break;
                    case Modes.BFS:
                        nodeInteractionHandler.executeAlgoritm(() => Algorithms.bfs(newNode), () => this.clearConnectedMarks(newNode));
                        break;
                    case Modes.Kruskal:
                        nodeInteractionHandler.executeAlgoritm(() => Algorithms.kruskal(newNode), () => this.clearConnectedMarks(newNode));
                        break;
                    case Modes.Prim:
                        nodeInteractionHandler.executeAlgoritm(() => Algorithms.prim(newNode), () => this.clearConnectedMarks(newNode));
                        break;
                }
            this.canDragNode = false;
            this.isDraggingNode = false;
            this.draggedNode = null;
        });
        newNode.svg.addEventListener("pointerdown", (ev) => {
            this.canDragNode = true;
            this.draggedNode = newNode;
        });
        this.svg.appendChild(newNode.svg);
        return newNode;
    }
    createEdge(node1, node2) {
        const newEdge = new Edge_js_1.Edge(node1, node2);
        newEdge.svg.addEventListener("click", (ev) => {
            switch (this.mode) {
                case Modes.Weight:
                    if (newEdge.weight == null) {
                        newEdge.weight = 0;
                        let foreign = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
                        foreign.classList.add("Text");
                        foreign.setAttribute("width", "100");
                        foreign.setAttribute("height", "20");
                        let text = document.createElement("input");
                        text.classList.add("Weight");
                        text.setAttribute("value", `${newEdge.weight}`);
                        text.setAttribute("type", "number");
                        text.addEventListener("input", () => newEdge.weight = text.valueAsNumber);
                        newEdge.svg.append(foreign);
                        foreign.append(text);
                        newEdge.refreshSVG();
                    }
                    else {
                        if (!ev.target.classList.contains("Weight")) {
                            newEdge.weight = null;
                            newEdge.svg.children[2].remove();
                        }
                    }
                    break;
                case Modes.Connect:
                    newEdge.svg.remove();
                    this.edges = this.edges.filter((edge) => edge != newEdge);
                    newEdge.nodes.forEach(node => node.edges = node.edges.filter((edge) => edge != newEdge));
                    break;
            }
        });
        this.svg.insertBefore(newEdge.svg, this.svg.firstChild);
        return newEdge;
    }
    clearAllMarks() {
        this.nodes.forEach(node => { node.setMark(false); node.unvisit(); });
        this.edges.forEach(edge => { edge.setMark(false); edge.unvisit(); });
    }
    clearConnectedMarks(start) {
        if (start instanceof Edge_js_1.Edge)
            start = start.nodes[0];
        let otherNodes = new Set([start]);
        for (let node of otherNodes) {
            node.edges.forEach(edge => {
                const nodes = edge.getNeighbourOf(node);
                if (nodes !== null)
                    otherNodes.add(nodes);
                edge.setMark(false);
                edge.unvisit();
            });
            node.setMark(false);
            node.unvisit();
        }
    }
}
exports.Graph = Graph;
/**
 * Contains various functions to be executed when the user does something in the {@link Graph graph} area/canvas
 *
 * the functions here should mostly do something only when the graph canvas is being interacted with, not the nodes or edges inside of the graph
 *
 */
const graphInteractionHandler = {
    addNode(graph, ev) {
        graph.lastClickedNode = null;
        //if we didn't click on a node or an edge, create a new node
        if (ev.target.id === "MainCanvas" && !graph.movingCanvas) {
            const x = ev.offsetX * (graph.svg.viewBox.baseVal.width / graph.svg.width.baseVal.value);
            const y = ev.offsetY * (graph.svg.viewBox.baseVal.height / graph.svg.height.baseVal.value);
            let newNode = graph.createNode(x, y);
            graph.nodes.push(newNode);
        }
    },
    changeViewbox(graph, ev) {
        if (!graph.canDragNode && graph.holdingDownPointer) {
            graph.movingCanvas = true;
            graph.x -= ev.movementX * graph.zoom;
            graph.y -= ev.movementY * graph.zoom;
            graph.refreshSVG();
        }
        if (!graph.canDragNode)
            return;
        if (graph.draggedNode === null)
            throw new Error("Should be able to drag a node, but couldn't be found");
        graph.isDraggingNode = true;
        //the position is relative to the viewbox position(x,y) and to it's size(zoom)
        graph.draggedNode.x = ev.offsetX * graph.zoom + graph.x;
        graph.draggedNode.y = ev.offsetY * graph.zoom + graph.y;
        graph.draggedNode.refreshSVG();
        graph.draggedNode.edges.forEach(edge => edge.refreshSVG());
    },
    applyZoom(graph, ev) {
        let speed = (ev.deltaY < 0 ? -1 : 1) * 0.3;
        const newZoom = graph.zoom + speed; //alternatively: graph.zoom*(1+speed)
        if (graph.svg.width.baseVal.value * newZoom > 0) {
            const oldZoom = graph.zoom;
            graph.zoom = newZoom;
            //zooms into/out of the middle of the canvas
            graph.x += graph.svg.width.baseVal.value * (oldZoom - graph.zoom) / 2;
            graph.y += graph.svg.height.baseVal.value * (oldZoom - graph.zoom) / 2;
        }
        graph.refreshSVG();
    }
};
/**
 * Contains various functions to be executed when the user does something with a {@link Node node} inside a {@link Graph graph}
 */
const nodeInteractionHandler = {
    removeNode(node, graph) {
        //remove svgs 
        node.svg.remove();
        node.edges.forEach(edge => edge.svg.remove());
        //remove all references to this node from any node that has any kind of connection to this
        node.edges.forEach(edge => {
            const connectedNode = (edge.nodes[0] === node ? edge.nodes[1] : edge.nodes[0]);
            connectedNode.edges = connectedNode.edges.filter(edge => !edge.connects(node));
        });
        //remove this node and all of it's edges from the graph
        graph.edges = graph.edges.filter(edge => !edge.connects(node));
        graph.nodes = graph.nodes.filter((node) => node != node);
    },
    connectOrSaveNode(node, graph) {
        if (graph.lastClickedNode !== null) {
            //connect previously selected node to graph node
            graph.edges.push(graph.createEdge(graph.lastClickedNode, node));
            graph.lastClickedNode = null;
        }
        else
            //save graph for later
            graph.lastClickedNode = node;
    },
    executeAlgoritm(algorithm, graphClearingFunction) {
        commands_js_1.steps.clear();
        graphClearingFunction();
        document.getElementById("ExplanationButtons").classList.remove("NoAlgorithm");
        algorithm();
    }
};
