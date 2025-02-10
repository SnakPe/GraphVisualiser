"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Edge = void 0;
class Edge {
    nodes;
    weight = null;
    marked = false;
    /**
     *
     * different from marked. Marked determines if its svg element is marked, and if it changes colour
     * visited can be used for internal computations
     */
    visited = false;
    /**
     * if an edge is directed, it will only go from nodes[0] to nodes[1]
     */
    directed = false;
    svg;
    constructor(node1, node2) {
        this.nodes = [node1, node2];
        node1.edges.push(this);
        node2.edges.push(this);
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.svg.classList.add("GraphEdge");
        if (node1 != node2)
            this.createNormalEdgeSVG();
        else
            this.createReturningEdgeSVG();
        this.refreshSVG();
    }
    /**
     *
     * @param node
     * @returns true if node is a neighbour, false otherwise
     */
    connects(node) {
        return this.nodes[0] === node || this.nodes[1] === node;
    }
    createEdgeSVG(svgtype) {
        let outerPath = document.createElementNS("http://www.w3.org/2000/svg", svgtype);
        let innerPath = document.createElementNS("http://www.w3.org/2000/svg", svgtype);
        this.svg.appendChild(outerPath);
        this.svg.appendChild(innerPath);
        outerPath.classList.add("OuterLine");
        innerPath.classList.add("InnerLine");
    }
    createReturningEdgeSVG() {
        this.createEdgeSVG("path");
    }
    createNormalEdgeSVG() {
        this.createEdgeSVG("line");
    }
    refreshSVG() {
        let outer = this.svg.children[0];
        let inner = this.svg.children[1];
        const refreshReturningEdge = () => {
            let startX = this.nodes[0].x - Number(this.nodes[0].radius);
            let startY = this.nodes[0].y;
            let endX = this.nodes[0].x;
            let endY = this.nodes[0].y - Number(this.nodes[0].radius);
            let path = `M${startX} ${startY} C${startX - 50} ${startY - 20} ${endX - 20} ${endY - 50} ${endX} ${endY}`;
            outer.setAttribute("d", path);
            inner.setAttribute("d", path);
        };
        const refreshNormalEdge = () => {
            const endPoints = this.calcNormalLineEnds();
            outer.setAttribute("x1", endPoints[0].toString());
            outer.setAttribute("y1", endPoints[1].toString());
            outer.setAttribute("x2", endPoints[2].toString());
            outer.setAttribute("y2", endPoints[3].toString());
            inner.setAttribute("x1", endPoints[0].toString());
            inner.setAttribute("y1", endPoints[1].toString());
            inner.setAttribute("x2", endPoints[2].toString());
            inner.setAttribute("y2", endPoints[3].toString());
        };
        const refreshWeightedEdge = () => {
            let text = this.svg.children[2];
            let x = (this.nodes[0].x + this.nodes[1].x) / 2;
            let y = (this.nodes[0].y + this.nodes[1].y) / 2 - 20;
            if (this.nodes[0] === this.nodes[1]) {
                x -= 50;
                y -= 30;
            }
            text.setAttribute("x", x.toString());
            text.setAttribute("y", y.toString());
        };
        if (this.nodes[0] === this.nodes[1])
            refreshReturningEdge();
        else
            refreshNormalEdge();
        if (this.weight !== null)
            refreshWeightedEdge();
    }
    /**
     * finds coordinates for the 2 endpoint of a line that connects 2 nodes
     * these points are on the circle of the node, not in the middle of the node!
     */
    calcNormalLineEnds() {
        const xDiff = this.nodes[0].x - this.nodes[1].x;
        const yDiff = this.nodes[0].y - this.nodes[1].y;
        const xRatio = xDiff / yDiff;
        const yRatio = yDiff / xDiff;
        const radius = +this.nodes[0].radius;
        //if nodes have the same position
        if (xDiff == 0)
            return [this.nodes[0].x, this.nodes[0].y, this.nodes[1].x, this.nodes[1].y];
        /*
         * This will be a (horrible) try to explain this
         *
         * We know the line to connect the 2 nodes because we know the coords of the middle of the nodes
         * we just need to "shorten" this line on both ends by the radius
         *
         * by taking the ratio between the difference of the x and y positions, we are able to construct various right triangles,
         * where the hypothenuse lies on parts of our line.
         *
         * for example, we can draw a hypothenuse from the middle of a node, to the point where our line intersets the circle of that node
         * the catheti of this triangle are the x- and y-values we need to find
         *
         * since the hypothenuse goes from the middle of the node to a point of it's circle,
         * we know that the hypothenuse needs to have the length of the radius
         *
         * now we can use the pythagorean theorem to figure out the length of a cathetus, e.g:
         *
         * x^2 + y^2 = radius^2
         *
         * Sadly, both x and y are still unknown. But we can use a trick.
         * Since we are dealing with lines, we can calculate the ratio of x to y, which is a constant,
         * using the center points of both nodes, so for example y = yRatio*x = xDiff/yDiff * x
         *
         * The resulting equation now is:
         *
         * x^2 + (yRatio*x)^2 = radius^2 or x = +- radius/sqrt(yRatio^2+1)
         *
         *
         * since we have a +- in our equation, we need to check which node is above/bellow or left/right to the other node
         */
        let x1Dist = -radius / Math.sqrt(Math.pow(yRatio, 2) + 1);
        let y1Dist = -radius / Math.sqrt(Math.pow(xRatio, 2) + 1);
        let x2Dist = radius / Math.sqrt(Math.pow(yRatio, 2) + 1);
        let y2Dist = radius / Math.sqrt(Math.pow(xRatio, 2) + 1);
        if (xDiff < 0) {
            x1Dist = -x1Dist;
            x2Dist = -x2Dist;
        }
        if (yDiff < 0) {
            y1Dist = -y1Dist;
            y2Dist = -y2Dist;
        }
        const x1 = this.nodes[0].x + x1Dist;
        const y1 = this.nodes[0].y + y1Dist;
        const x2 = this.nodes[1].x + x2Dist;
        const y2 = this.nodes[1].y + y2Dist;
        return [x1, y1, x2, y2];
    }
    /**
    * @param {Node} node A node from this edge
    * @returns the neighbouring node, or null if node is not connected with this edge
    */
    getNeighbourOf(node) {
        switch (node) {
            case this.nodes[0]:
                return this.nodes[1];
            case this.nodes[1]:
                if (!this.directed)
                    return this.nodes[0];
        }
        return null;
    }
    setMark(mark) {
        if (mark === this.marked)
            return;
        this.svg.classList.toggle("Marked");
        this.marked = mark;
    }
    isMarked() {
        return this.marked;
    }
    visit() {
        this.visited = true;
    }
    unvisit() {
        this.visited = false;
    }
    wasVisited() {
        return this.visited;
    }
    hasWeight() {
        return this.weight != null && !isNaN(this.weight);
    }
}
exports.Edge = Edge;
