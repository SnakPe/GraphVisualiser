import { Node } from "./Node.js"
import { Edge } from "./Edge.js"
import * as Algorithms from "../Algorithms/algorithms.js"
import { steps } from "../Algorithms/commands.js"


export enum Modes{
	Add = "Add",
	Connect = "Connect",
	Weight = "Weight",
	DFS = "DFS",
	BFS = "BFS",
	Kruskal = "Kruskal",
	Prim = "Prim",
}

export class Graph{
	nodes : Node[]
	edges : Edge[]
	lastClickedNode : Node|null = null
	
	mode : Modes = Modes.Add
	
	svg : SVGSVGElement
	zoom : number = 1
	/*
	coords of the top left corner of the svg
	*/
	x : number = 0
	y : number = 0
	
	holdingDownPointer : boolean = false
	movingCanvas : boolean = true
	canDragNode : boolean = false
	isDraggingNode : boolean = false
	draggedNode : Node|null = null

	constructor(nodes? : Node[], edges? : Edge[]){
		this.svg = document.getElementById("MainCanvas")! as HTMLElement & SVGElement & SVGSVGElement
		this.nodes = nodes ? nodes : []
		this.edges = edges ? edges : []

		this.svg.setAttribute("viewBox",`${0} ${0} ${this.svg.width.baseVal.value} ${this.svg.height.baseVal.value}`)
		
		this.svg.addEventListener("pointerup",(ev) => {
			switch(this.mode){
				case Modes.Add:
					graphInteractionHandler.addNode(this, ev)
				break;
				default:
					if((ev.target as SVGElement).id === "MainCanvas")
						this.lastClickedNode = null
				break;
			}
			this.holdingDownPointer = false
			this.movingCanvas = false
			this.isDraggingNode = false
		})
		this.svg.addEventListener("pointermove", (ev) => graphInteractionHandler.changeViewbox(this, ev))
		this.svg.addEventListener("pointerleave",() => this.movingCanvas = this.canDragNode = false)
		this.svg.addEventListener("pointerdown",() => this.holdingDownPointer = true)
		this.svg.addEventListener("wheel", (ev) => graphInteractionHandler.applyZoom(this,ev))
		window.onresize = () => this.refreshSVG()
	}

	refreshSVG(){
		const width = this.svg.width.animVal.value * this.zoom
		const height = this.svg.height.animVal.value * this.zoom

		if(height > 0 && width > 0)
			this.svg.setAttribute("viewBox", `${this.x} ${this.y} ${width} ${height}`)
	}

	createNode(x:number, y:number){
		const newNode = new Node(x+this.x,y+this.y,this.svg)
		newNode.svg.addEventListener("pointerup", (ev) => {
			const graph = this
			if(!this.isDraggingNode)
			switch(this.mode){
				case Modes.Add:
					nodeInteractionHandler.removeNode(newNode, this)
				break;
				case Modes.Connect:
					nodeInteractionHandler.connectOrSaveNode(newNode, this)
				break;
				case Modes.DFS:
					nodeInteractionHandler.executeAlgoritm(() => Algorithms.dfs(newNode), () => this.clearAllMarks())
				break;
				case Modes.BFS:
					nodeInteractionHandler.executeAlgoritm(() => Algorithms.bfs(newNode), () => this.clearConnectedMarks(newNode))
				break;
				case Modes.Kruskal:
					nodeInteractionHandler.executeAlgoritm(() => Algorithms.kruskal(newNode), () => this.clearConnectedMarks(newNode))
				break;
				case Modes.Prim:
					nodeInteractionHandler.executeAlgoritm(() => Algorithms.prim(newNode), () => this.clearConnectedMarks(newNode))
				break;
			}
			this.canDragNode = false
			this.isDraggingNode = false
			this.draggedNode = null
		})
				
		newNode.svg.addEventListener("pointerdown", (ev) => {
			this.canDragNode = true
			this.draggedNode = newNode
		})
		
		this.svg.appendChild(newNode.svg)
		return newNode
	}
	createEdge(node1 : Node, node2 : Node){
		const newEdge = new Edge(node1, node2)
		
		newEdge.svg.addEventListener("click", (ev) => {
			switch(this.mode){
				case Modes.Weight:
					if(newEdge.weight == null){
						newEdge.weight = 0
						
						let foreign = document.createElementNS("http://www.w3.org/2000/svg","foreignObject")
						foreign.classList.add("Text")
						foreign.setAttribute("width", "100")
						foreign.setAttribute("height", "20")
						let text = document.createElement("input")
						text.classList.add("Weight")
						text.setAttribute("value",`${newEdge.weight}`)
						text.setAttribute("type","number")
						
						text.addEventListener("input", () => newEdge.weight = text.valueAsNumber)
						
						newEdge.svg.append(foreign)
						foreign.append(text)
						
						newEdge.refreshSVG()
					}else{
						if(!(ev.target as HTMLElement | SVGElement).classList.contains("Weight")){
							newEdge.weight = null
							newEdge.svg.children[2].remove()
						}
					}
				break
				case Modes.Connect:
					newEdge.svg.remove()
					this.edges = this.edges.filter((edge) => edge != newEdge)
					newEdge.nodes.forEach(node => node.edges = node.edges.filter((edge) => edge != newEdge))
				break
			}
				
		})
			
		this.svg.insertBefore(newEdge.svg, this.svg.firstChild)
		return newEdge
	}
		
	clearAllMarks(){
		this.nodes.forEach(node => {node.setMark(false); node.unvisit()})
		this.edges.forEach(edge => {edge.setMark(false); edge.unvisit()})
	}
	clearConnectedMarks(start : Node|Edge){
		if(start instanceof Edge)start = start.nodes[0]
		let otherNodes = new Set([start])
		for (let node of otherNodes){
			node.edges.forEach(edge => {
				const nodes = edge.getNeighbourOf(node)
				if(nodes !== null)otherNodes.add(nodes)
				edge.setMark(false)
				edge.unvisit()
			})
			node.setMark(false)
			node.unvisit()
		}
	}
}

/**
 * Contains various functions to be executed when the user does something in the {@link Graph graph} area/canvas
 * 
 * the functions here should mostly do something only when the graph canvas is being interacted with, not the nodes or edges inside of the graph
 *  
 */
const graphInteractionHandler = {
	addNode(graph : Graph, ev : MouseEvent){
		graph.lastClickedNode = null
		
		//if we didn't click on a node or an edge, create a new node
		if((ev.target as SVGElement).id === "MainCanvas" && !graph.movingCanvas){
			const x = ev.offsetX*(graph.svg.viewBox.baseVal.width/graph.svg.width.baseVal.value)
			const y = ev.offsetY*(graph.svg.viewBox.baseVal.height/graph.svg.height.baseVal.value)
			let newNode = graph.createNode(x,y)
			graph.nodes.push(newNode)
			
		}		
	},
	changeViewbox(graph : Graph, ev : MouseEvent){
		if(!graph.canDragNode && graph.holdingDownPointer){
			graph.movingCanvas = true
			graph.x -= ev.movementX*graph.zoom
			graph.y -= ev.movementY*graph.zoom
			graph.refreshSVG()
			
		}
		if(!graph.canDragNode)return
		if(graph.draggedNode === null)throw new Error("Should be able to drag a node, but couldn't be found")
		graph.isDraggingNode = true
		//the position is relative to the viewbox position(x,y) and to it's size(zoom)
		graph.draggedNode.x = ev.offsetX*graph.zoom + graph.x
		graph.draggedNode.y = ev.offsetY*graph.zoom + graph.y
		graph.draggedNode.refreshSVG()
		graph.draggedNode.edges.forEach(edge => edge.refreshSVG())
	},
	applyZoom(graph : Graph, ev : WheelEvent){
		let speed = (ev.deltaY < 0 ? -1 : 1) * 0.3
		const newZoom = graph.zoom+speed//alternatively: graph.zoom*(1+speed)

		if(graph.svg.width.baseVal.value * newZoom > 0){
			const oldZoom = graph.zoom
			graph.zoom = newZoom
			
			//zooms into/out of the middle of the canvas
			graph.x += graph.svg.width.baseVal.value * (oldZoom-graph.zoom) / 2
			graph.y += graph.svg.height.baseVal.value * (oldZoom-graph.zoom) / 2
		}
		graph.refreshSVG()
	}
}


/**
 * Contains various functions to be executed when the user does something with a {@link Node node} inside a {@link Graph graph}
 */
const nodeInteractionHandler = {
	removeNode(node : Node, graph : Graph){
		//remove svgs 
		node.svg.remove()
		node.edges.forEach(edge => edge.svg.remove())

		//remove all references to this node from any node that has any kind of connection to this
		node.edges.forEach(edge => {
			const connectedNode = (edge.nodes[0] === node ? edge.nodes[1] : edge.nodes[0])
			connectedNode.edges = connectedNode.edges.filter(edge => !edge.connects(node))
		})

		//remove this node and all of it's edges from the graph
		graph.edges = graph.edges.filter(edge => !edge.connects(node))
		graph.nodes = graph.nodes.filter((node) => node != node)
	},
	connectOrSaveNode(node: Node, graph : Graph){
		if(graph.lastClickedNode !== null){
			//connect previously selected node to graph node
			graph.edges.push(graph.createEdge(graph.lastClickedNode, node))
			graph.lastClickedNode = null
		}else
			//save graph for later
			graph.lastClickedNode = node
	},
	executeAlgoritm(algorithm: () => any, graphClearingFunction : () => void){
		steps.clear()
		graphClearingFunction()
		document.getElementById("ExplanationButtons")!.classList.remove("NoAlgorithm")
		algorithm()
	}
}
