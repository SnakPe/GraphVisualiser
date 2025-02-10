"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dfs = dfs;
exports.bfs = bfs;
exports.kruskal = kruskal;
exports.prim = prim;
const commands_js_1 = require("./commands.js");
const graphRepresentation_js_1 = require("./graphRepresentation.js");
/**
 * From a node, get all other nodes and edges connected to {@link node}
 *
 * @param node
 */
function getNodesAndEdges(node, onlyWeighted) {
    let edges = [];
    let possibleNodes = [node];
    for (let i = 0; i < possibleNodes.length; i++) {
        const currentNode = possibleNodes[i];
        currentNode.edges.forEach(edge => {
            if ((!onlyWeighted || edge.hasWeight()) && !edges.includes(edge)) {
                edges.push(edge);
                const nbour = edge.getNeighbourOf(currentNode);
                if (nbour !== null)
                    possibleNodes.push(nbour);
            }
        });
    }
    return { edges, possibleNodes };
}
/**
 * A iterative implemetation of DFS
 *
 * @param start
 */
function dfs(start) {
    let nodeStack = [start];
    let edgeStack = [];
    while (nodeStack.length > 0) {
        const currentNode = nodeStack[nodeStack.length - 1];
        if (!currentNode.wasVisited()) {
            if (edgeStack.length > 0)
                commands_js_1.steps.addStep((0, commands_js_1.useEdge)(edgeStack.pop()));
            commands_js_1.steps.addStep((0, commands_js_1.markNode)(currentNode));
        }
        //typescript types find() as not also returning undefined? 
        const nextNode = currentNode.getNeighbours().find(nbour => !nbour.wasVisited());
        commands_js_1.steps.addStep((0, graphRepresentation_js_1.createExplanation)(false, "Check for a next unvisited neighbour of ", (0, graphRepresentation_js_1.nodeRepresentation)(currentNode), ": ", nextNode !== undefined ? (0, graphRepresentation_js_1.nodeRepresentation)(nextNode) : "there are none"));
        if (nextNode) {
            nodeStack.push(nextNode);
            const nbour = currentNode.getEdgeConnectingTo(nextNode);
            if (nbour !== undefined)
                edgeStack.push(nbour);
        }
        else {
            nodeStack.pop();
            edgeStack.pop();
        }
    }
    commands_js_1.steps.addStep((0, graphRepresentation_js_1.createExplanation)(false, "Depth-first search is done"));
}
function bfs(start) {
    let currentLevel = [start];
    commands_js_1.steps.addStep((0, commands_js_1.markNode)(start));
    let level = 1;
    while (currentLevel.length > 0) {
        commands_js_1.steps.addStep((0, graphRepresentation_js_1.createExplanation)(false, "Get every node of level " + level + ":"));
        let nextLevel = [];
        currentLevel.forEach(node => {
            commands_js_1.steps.addStep((0, graphRepresentation_js_1.createExplanation)(false, `Find every unmarked neighbour of `, (0, graphRepresentation_js_1.nodeRepresentation)(node)));
            node.edges.forEach(edge => {
                const nbour = edge.getNeighbourOf(node);
                if (!nbour.wasVisited()) {
                    commands_js_1.steps.addStep((0, commands_js_1.useEdge)(edge));
                    commands_js_1.steps.addStep((0, commands_js_1.markNode)(nbour));
                    nextLevel.push(nbour);
                }
            });
        });
        currentLevel = nextLevel;
        level++;
    }
    commands_js_1.steps.addStep((0, graphRepresentation_js_1.createExplanation)(false, "Breath first search is done"));
}
/**
 * only uses weighed nodes. Since the graph can be disjointed, this modification of the kruskal-algorithm
 * will only use all nodes and their edges that can be reached from the used node
 *
 * @todo remake this. the cycle check using usedEdges and usedNodes is horribe
 * @param edges
 */
function kruskal(node) {
    let { edges, possibleNodes } = getNodesAndEdges(node, true);
    edges = edges.filter(edge => edge.weight !== null).sort((edge1, edge2) => edge2.weight - edge1.weight);
    let usedNodes = [];
    let usedEdges = [];
    let smallestEdge;
    while (edges.length > 0) {
        smallestEdge = edges[edges.length - 1];
        commands_js_1.steps.addStep((0, graphRepresentation_js_1.createExplanation)(false, "Find next unused edge with smallest weight: ", (0, graphRepresentation_js_1.edgeRepresentation)(smallestEdge)));
        let hasCycles = hasCyclesDFS(smallestEdge.nodes[0]);
        commands_js_1.steps.addStep((0, graphRepresentation_js_1.createExplanation)(false, "Check if ", (0, graphRepresentation_js_1.edgeRepresentation)(smallestEdge), ` creates a cycle: ${hasCycles}`));
        usedNodes = [];
        usedEdges = [];
        if (!hasCycles) {
            commands_js_1.steps.addStep((0, commands_js_1.useEdge)(smallestEdge));
        }
        smallestEdge = edges.pop();
    }
    function hasCyclesDFS(node) {
        usedNodes.push(node);
        for (let edge of node.edges) {
            if ((edge.wasVisited() || edge == smallestEdge) && !usedEdges.includes(edge)) {
                usedEdges.push(edge);
                const neigh = edge.getNeighbourOf(node);
                if (usedNodes.includes(neigh))
                    return true;
                if (hasCyclesDFS(neigh))
                    return true;
            }
        }
        return false;
    }
    commands_js_1.steps.addStep((0, graphRepresentation_js_1.createExplanation)(false, "Kruskal's algorithm is done"));
}
function prim(node) {
    function isPossible(edge) {
        return !edge.wasVisited() && edge.hasWeight() && edge.nodes.some(n => !n.wasVisited());
    }
    function findPossibleEdges(node) {
        //unused weighted edges that create no cycles
        return node.edges.filter(edge => isPossible(edge));
    }
    let possibleEdges = findPossibleEdges(node).sort((e1, e2) => e2.weight - e1.weight);
    if (possibleEdges.length !== 0)
        commands_js_1.steps.addStep((0, commands_js_1.markNode)(node));
    while (possibleEdges.length > 0) {
        const currentEdge = possibleEdges.pop();
        if (!isPossible(currentEdge))
            continue;
        commands_js_1.steps.addStep((0, graphRepresentation_js_1.createExplanation)(false, "Find unused edge with smallest weight coming from a visited node: ", (0, graphRepresentation_js_1.edgeRepresentation)(currentEdge)));
        const nextNode = currentEdge.nodes.find(node => !node.wasVisited());
        commands_js_1.steps.addStep((0, commands_js_1.useEdge)(currentEdge));
        commands_js_1.steps.addStep((0, commands_js_1.markNode)(nextNode));
        possibleEdges = possibleEdges.concat(findPossibleEdges(nextNode)).sort((e1, e2) => e2.weight - e1.weight);
    }
    commands_js_1.steps.addStep((0, graphRepresentation_js_1.createExplanation)(false, "Prim's Algorithm is Done"));
}
