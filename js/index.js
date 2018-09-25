requirejs(['priority-queue'], (PriorityQueue) => {
	const MARGIN = 40;
	const MARGIN_NODE = 100;
	const NODE_RADIUS = 20;

	window.onload = () => {
		const graph = new Graph();

		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				graph.addNode(new Vector2(j, i));
			}
		}

		graph.addEdge(0, 3);
		graph.addEdge(0, 1);
		graph.addEdge(1, 5);

		i.init(document.querySelector('#main'), graph, graph.nodes[0], graph.nodes[8]);
	};

	class LPA {
		/**
		 *
		 * @param canvas
		 * @param {Graph} graph
		 * @param {Node} startNode
		 * @param {Node} goalNode
		 */
		init(canvas, graph, startNode, goalNode) {
			this.canvas = canvas;
			this.ctx = canvas.getContext('2d');
			this.ctx.fillStyle = 'white';
			this.ctx.strokeStyle = 'black';

			this.graph = graph;
			this.start = startNode;
			this.goal = goalNode;

			this.renderGraph();

			this.queue = new PriorityQueue([], LPA.compareKey);
			this.start.rhs = 0;
			this.queue.queue(this.start.getKey(this.goal.point));
		}

		renderGraph() {
			const size = this.graph.size;
			this.canvas.width = MARGIN * 2 + size.x * MARGIN_NODE;
			this.canvas.height = MARGIN * 2 + size.y * MARGIN_NODE;

			Object.keys(this.graph.nodes).forEach(id => {
				const node = this.graph.nodes[id];

				this.setFontSize(20);
				this.ctx.fillStyle = 'black';

				const edges = node.edges;
				Object.keys(edges).forEach(to => {
					if (to < id) return; // do not draw edge twice

					/** @var edge Edge */
					const edge = edges[to];

					const p1 = this.graph.getPoint(edge.n1);
					const p2 = this.graph.getPoint(edge.n2);

					const r1 = new Vector2(MARGIN + p1.x * MARGIN_NODE, MARGIN + p1.y * MARGIN_NODE);
					const r2 = new Vector2(MARGIN + p2.x * MARGIN_NODE, MARGIN + p2.y * MARGIN_NODE);
					this.ctx.moveTo(r1.x, r1.y);
					this.ctx.lineTo(r2.x, r2.y);
					this.ctx.stroke();

					this.ctx.fillText(
						edge.cost,
						(r1.x + r2.x) / 2,
						(r1.y + r2.y) / 2
					);
				});

				const renderPoint = new Vector2(
					MARGIN + MARGIN_NODE * node.point.x,
					MARGIN + MARGIN_NODE * node.point.y
				);
				this.ctx.beginPath();
				this.ctx.arc(
					renderPoint.x, renderPoint.y,
					NODE_RADIUS, 0, 2 * Math.PI
				);
				this.ctx.fillStyle = 'white';
				this.ctx.fill();
				this.ctx.stroke();

				this.setFontSize(NODE_RADIUS * 1.5);
				this.ctx.fillStyle = 'black';
				this.ctx.fillText(
					id,
					renderPoint.x - NODE_RADIUS * 0.5,
					renderPoint.y + NODE_RADIUS * 0.5
				);
			});
		}

		computeShortestPath() {
			while(true) {
				const top = this.queue.peek();
				if(!(LPA.compareKey(this.goal.getKey(this.goal.point), top) < 0 || (this.goal.rhs !== this.goal.g))) {
					break;
				}

				const node = this.queue.dequeue();

			}
		}

		/**
		 *
		 * @param {Node} node
		 */
		updateNode(node) {
			if(node !== this.start) {
				node.rhs = Infinity;
				Object.keys(node.edges).forEach(edge => {
					/** @var {Edge} edge */
					/** @var {Node} neighbor */
					const neighbor = this.graph.nodes[edge.getNeighbor(node.id)];
					node.rhs = Math.min(node.rhs, neighbor.g + edge.cost);
				});

				if(this.queue.find((_, e) => e[2] === node)) {
					//this.queue.
				}
			}
		}

		static compareKey(a, b) {
			if(a[0] !== b[0]) return b[0] - a[0];
			return b[1] - a[1];
		}

		setFontSize(size) {
			this.ctx.font = this.ctx.font.replace(/\d+px/, size + 'px');
		}
	}

	class Graph {
		constructor() {
			this.nextNodeId = 0;

			this.size = new Vector2(0, 0);
			this.nodes = {};
		}

		/**
		 *
		 * @param {Vector2} point
		 */
		addNode(point) {
			let id = this.nextNodeId++;
			this.nodes[id] =
				new Node(id, point);

			if (this.size.x < point.x + 1) {
				this.size.x = point.x + 1;
			}

			if (this.size.y < point.y + 1) {
				this.size.y = point.y + 1;
			}
		}

		/**
		 *
		 * @param {Number} nodeId
		 * @returns {Vector2}
		 */
		getPoint(nodeId) {
			/** @var {Node} node */
			const node = this.nodes[nodeId];
			if (node === undefined) return undefined;

			return node.point;
		}

		/**
		 *
		 * @param {Number} n1
		 * @param {Number} n2
		 * @param {Number} cost
		 */
		addEdge(n1, n2, cost = 1) {
			const edge = new Edge(n1, n2, cost);

			this.nodes[n1].edges[n2] = edge;
			this.nodes[n2].edges[n1] = edge;
		}
	}

	class Node {
		/**
		 *
		 * @param {Number} id
		 * @param {Vector2} point
		 */
		constructor(id, point) {
			this.id = id;
			this.point = point;
			this.edges = {};

			this.g = Infinity;
			this.rhs = Infinity;
		}

		/**
		 *
		 * @param {Vector2} goal
		 */
		getHeuristic(goal) {
			const diffX = Math.abs(goal.x - this.point.x);
			const diffY = Math.abs(goal.y - this.point.y);

			return diffX + diffY;
		}

		/**
		 * @param {Vector2} goal
		 *
		 * @returns {*[]}
		 */
		getKey(goal) {
			const key2 = Math.min(this.g, this.rhs);
			return [
				key2 + this.getHeuristic(goal), key2, this
			];
		}
	}

	class Edge {
		/**
		 *
		 * @param {Number} n1
		 * @param {Number} n2
		 * @param {Number} cost
		 */
		constructor(n1, n2, cost) {
			this.cost = cost;
			this.n1 = n1;
			this.n2 = n2;
		}

		/**
		 * @param {Number} current
		 */
		getNeighbor(current) {
			if(this.n1 === current) return this.n2;
			return this.n1;
		}
	}

	class Vector2 {
		constructor(x, y) {
			this.x = x;
			this.y = y;
		}
	}

	const i = new LPA();
});
