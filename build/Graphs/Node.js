export class Node {
    x;
    y;
    radius = "20";
    content;
    edges = [];
    _marked = false;
    /**
     * different from marked. Marked determines if its svg element is marked, and if it changes colour
     * visited can be used for internal computations
     */
    visited = false;
    svg;
    constructor(x, y, canvas) {
        this.x = +x;
        this.y = +y;
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.svg.classList.add("GraphNode");
        let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.svg.appendChild(circle);
        circle.setAttribute("r", this.radius);
        let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        this.svg.appendChild(text);
        text.setAttribute("lengthAdjust", "spacingAndGlyphs");
        text.textContent = "";
        this.refreshSVG();
    }
    refreshSVG() {
        let circle = this.svg.children[0];
        let text = this.svg.children[1];
        circle.setAttribute("cx", this.x.toString());
        circle.setAttribute("cy", this.y.toString());
        text.setAttribute("x", this.x.toString());
        text.setAttribute("y", this.y.toString());
        text.textContent = `${this.content ?? ""}`;
    }
    setMark(mark) {
        if (mark === this._marked)
            return;
        this.svg.classList.toggle("Marked");
        this._marked = mark;
    }
    isMarked() {
        return this._marked;
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
    getNeighbours() {
        let result = [];
        this.edges.forEach(edge => {
            result.push(edge.getNeighbourOf(this));
        });
        return result;
    }
    /**
     * For a directed edge, {@link nbour} must be the second element in edge.nodes, and this must be the first.
     * For undirected edges, the order is irrelevant.
     *
     * @param nbour
     * @returns The edge (this, {@link nbour}) if it exists.
     */
    getEdgeConnectingTo(nbour) {
        return this.edges.find(edge => edge.getNeighbourOf(this) === nbour);
    }
}
