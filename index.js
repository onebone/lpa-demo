window.onload = () => {
	const graph = new Graph();
	graph.init(0, 0);
	graph.addEdge(new Point(0, 0), new Point(0, 1));
	graph.addEdge(new Point(0, 0), new Point(1, 0));
	graph.addEdge(new Point(1, 0), new Point(1, 1));

	i.init(document.querySelector('#main'), graph);
};

class LPA {
	init(canvas, graph) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.graph = graph;

		this.renderGraph();
	}

	renderGraph() {
		this.ctx.beginPath();

		let maxX = 0, maxY = 0;

		this.graph.nodes.forEach(arr => {
			arr.forEach(node => {
				/** @var edge Edge */
				for (let edge of node.successors) {
					this.ctx.moveTo(10 + edge.p1.x * 50, 10 + edge.p1.y * 50);
					this.ctx.lineTo(10 + edge.p2.x * 50, 10 + edge.p2.y * 50);

					if (maxX < edge.p1.x) maxX = edge.p1.x;
					if (maxY < edge.p1.y) maxY = edge.p1.y;
				}
			});
		});

		this.canvas.width = 20 + maxX * 50;
		this.canvas.height = 20 + maxY * 50;

		this.ctx.stroke();
	}
}

class Graph {
	constructor() {
		this.nodes = new Map();
	}

	init(x, y) {
		this.nodes = new Map();

		this.initNode(x, y);
	}

	initNode(x, y) {
		if(!this.nodes.has(x)) {
			this.nodes.set(x, new Map());
		}

		if(!this.nodes.get(x).has(y)) {
			this.nodes.get(x).set(y, {
				g: Infinity, rhs: Infinity,
				successors: [], predecessors: []
			});
		}
	}

	/**
	 *
	 * @param {Point} p1
	 * @param {Point} p2
	 * @param {Number} cost
	 * @returns {Edge}
	 */
	addEdge(p1, p2, cost = 1) {
		this.initNode(p1.x, p1.y);
		this.initNode(p2.x, p2.y);

		const edge = new Edge(p1, p2, cost);

		const n1 = this.nodes.get(p1.x).get(p1.y);
		n1.successors.push(edge);
		n1.predecessors.push(edge);

		const n2 = this.nodes.get(p2.x).get(p2.y);
		n2.successors.push(edge);
		n2.predecessors.push(edge);

		return edge;
	}
}

class Edge {
	/**
	 *
	 * @param {Point} p1
	 * @param {Point} p2
	 * @param {Number} cost
	 */
	constructor(p1, p2, cost) {
		this.cost = cost;
		this.p1 = p1;
		this.p2 = p2;
	}
}

class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

const i = new LPA();