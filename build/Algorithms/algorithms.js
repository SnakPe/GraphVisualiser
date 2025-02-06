import { steps, markNode, useEdge } from "./commands.js";
import { createExplanation, edgeRepresentation, nodeRepresentation } from "./graphRepresentation.js";
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
export function dfs(start) {
    let nodeStack = [start];
    let edgeStack = [];
    while (nodeStack.length > 0) {
        const currentNode = nodeStack[nodeStack.length - 1];
        if (!currentNode.wasVisited()) {
            if (edgeStack.length > 0)
                steps.addStep(useEdge(edgeStack.pop()));
            steps.addStep(markNode(currentNode));
        }
        //typescript types find() as not also returning undefined? 
        const nextNode = currentNode.getNeighbours().find(nbour => !nbour.wasVisited());
        steps.addStep(createExplanation(false, "Check for a next unvisited neighbour of ", nodeRepresentation(currentNode), ": ", nextNode !== undefined ? nodeRepresentation(nextNode) : "there are none"));
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
    steps.addStep(createExplanation(false, "Depth-first search is done"));
}
export function bfs(start) {
    let currentLevel = [start];
    steps.addStep(markNode(start));
    let level = 1;
    while (currentLevel.length > 0) {
        steps.addStep(createExplanation(false, "Get every node of level " + level + ":"));
        let nextLevel = [];
        currentLevel.forEach(node => {
            steps.addStep(createExplanation(false, `Find every unmarked neighbour of `, nodeRepresentation(node)));
            node.edges.forEach(edge => {
                const nbour = edge.getNeighbourOf(node);
                if (!nbour.wasVisited()) {
                    steps.addStep(useEdge(edge));
                    steps.addStep(markNode(nbour));
                    nextLevel.push(nbour);
                }
            });
        });
        currentLevel = nextLevel;
        level++;
    }
    steps.addStep(createExplanation(false, "Breath first search is done"));
}
/**
 * only uses weighed nodes. Since the graph can be disjointed, this modification of the kruskal-algorithm
 * will only use all nodes and their edges that can be reached from the used node
 *
 * @todo remake this. the cycle check using usedEdges and usedNodes is horribe
 * @param edges
 */
export function kruskal(node) {
    let { edges, possibleNodes } = getNodesAndEdges(node, true);
    edges = edges.filter(edge => edge.weight !== null).sort((edge1, edge2) => edge2.weight - edge1.weight);
    let usedNodes = [];
    let usedEdges = [];
    let smallestEdge;
    while (edges.length > 0) {
        smallestEdge = edges[edges.length - 1];
        steps.addStep(createExplanation(false, "Find next unused edge with smallest weight: ", edgeRepresentation(smallestEdge)));
        let hasCycles = hasCyclesDFS(smallestEdge.nodes[0]);
        steps.addStep(createExplanation(false, "Check if ", edgeRepresentation(smallestEdge), ` creates a cycle: ${hasCycles}`));
        usedNodes = [];
        usedEdges = [];
        if (!hasCycles) {
            steps.addStep(useEdge(smallestEdge));
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
    steps.addStep(createExplanation(false, "Kruskal's algorithm is done"));
}
export function prim(node) {
    function isPossible(edge) {
        return !edge.wasVisited() && edge.hasWeight() && edge.nodes.some(n => !n.wasVisited());
    }
    function findPossibleEdges(node) {
        //unused weighted edges that create no cycles
        return node.edges.filter(edge => isPossible(edge));
    }
    let possibleEdges = findPossibleEdges(node).sort((e1, e2) => e2.weight - e1.weight);
    if (possibleEdges.length !== 0)
        steps.addStep(markNode(node));
    while (possibleEdges.length > 0) {
        const currentEdge = possibleEdges.pop();
        if (!isPossible(currentEdge))
            continue;
        steps.addStep(createExplanation(false, "Find unused edge with smallest weight coming from a visited node: ", edgeRepresentation(currentEdge)));
        const nextNode = currentEdge.nodes.find(node => !node.wasVisited());
        steps.addStep(useEdge(currentEdge));
        steps.addStep(markNode(nextNode));
        possibleEdges = possibleEdges.concat(findPossibleEdges(nextNode)).sort((e1, e2) => e2.weight - e1.weight);
    }
    steps.addStep(createExplanation(false, "Prim's Algorithm is Done"));
}
