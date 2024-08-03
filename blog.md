# Getting Started with Langraph.js

## Who is this guide for?

Welcome to this beginner's guide to Langgraph.js.

I’m writing this guide because I’m currently building a project using Langraph.js: a multimodal generative AI application, as part of my UCL Computer Science MSC IXN Final Project. When I started, I found that there were no resources aimed at beginners (at least for the Typescript implementation), and the official documentation was still under development. I also began with no prior knowledge of Langchain. Through this guide, I aim to share how useful Langraph.js and Langchain can be for building LLM-powered products.

This tutorial is designed for **complete beginners** who have no prior knowledge of Langraph.js. It will be useful to have some familiarity with the Langchain ecosystem and building with Large Language Models (LLMs). A basic understanding of Typescript will help you follow along with the code samples.

## Learning outcomes

By the end of this guide, you will:

- Gain a solid foundation of what Langraph.js is and how it works.
- Build confidence in leveraging the Langchain and Langraph ecosystem to develop LLM-powered applications.
- Learn to independently create and manage graphs using Langraph.js.

## Overview of Langraph.js

Langraph.js is a JavaScript library designed to simplify the creation and manipulation of graphs, particularly for applications involving LLMs. It provides an intuitive way to model workflows as graphs composed of nodes and edges, making it easier to manage complex data flows and processes.

Developers can focus on logic, rather than infrastructure.

### Prerequisites

Before getting started, ensure you have the following tools installed:

- Node.js and npm

### Setting Up the Starter Repository

**Clone the Starter Repository**:

```bash
git clone https://github.com/anchit-chandran/ms-blog-langraphjs
cd ms-blog-langraphjs
```

**Install dependencies**:

```bash
npm install
```

## Understanding the Basics

### What is a Graph?

In the context of Langraph.js, a graph is a collection of nodes and edges.

There are 3 key concepts:

- **Nodes**: JavaScript/TypeScript functions that encode logic.
- **Edges**: JavaScript/TypeScript unctions that determine which `Node` to execute next based on the current `State`. These can be conditional branches or direct, fixed transitions.
- **State**: a shared data structure used throughout the graph, representing the current snapshot of the application.

More simply, nodes are functions that do work, edges are functions that choose what work to do, and the state tracks data throughout the workflow.

Let's illustrate this using a simple example: based on the user's input, we'll reply with an excellent programming joke or useful random fact.

But first, let's build the most basic graph possible.

## Hello World Graph

First, import the necessary modules at the top of your file:

```ts
import { StateGraph, START, END, StateGraphArgs } from "@langchain/langgraph";
```

Now, there's a few components to set up - all required to compile a graph. We'll start quite barebones and incrementally build up.

### State

We need to define our `State` object, along with its interface. At the top of our `app.get('/')` function add:

```ts
app.get("/", async (req: Request, res: Response) => {
  // State type
  interface IState {}

  // State
  const graphState: StateGraphArgs<IState>["channels"] = {};

  ...
}
```

We'll come back to this but at a glance:

- `IState` will be the interface for our `State`.
- `graphState` will be our actual state object, including definitions on how the state should be updated.

### Defining Nodes

We'll now add our first Nodes: `sayHello` and `sayBye`.

A Node is simply a TS function, which takes in a `State` object and returns (for now) an empty object:

```ts
app.get("/", async (req: Request, res: Response) => {
  // State type
  interface IState {}

  // State
  const graphState: StateGraphArgs<IState>["channels"] = {};

  // A node that says hello
  function sayHello(state: IState) {
    console.log(`From the 'sayHello' node: Hello world!`);
    return {};
  }

  // A node that says bye
  function sayBye(state: IState) {
    console.log(`From the 'sayBye' node: Bye world!`);
    return {};
  }

  ...
```

### Building the Graph

Our Graph is ready to be built!

Add to the code:

```ts
// Initialize the LangGraph
const graphBuilder = new StateGraph({ channels: graphState })
  // Add our nodes to the graph
  .addNode("sayHello", sayHello)
  .addNode("sayBye", sayBye)
  // Add the edges between nodes
  .addEdge(START, "sayHello")
  .addEdge("sayHello", "sayBye")
  .addEdge("sayBye", END);
```

1. We initialise a new `StateGraph`, with a single object `{channels: graphState}`, where `graphState` is what we defined first.
2. The `sayHello` and `sayBye` Nodes are added to the graph.
3. The Edges are defined between nodes. There must always be a path from `START` to `END`.

### Running the Graph

We can now use our Graph.

Add to the code:

```ts
// Compile the graph
  const graph = graphBuilder.compile();

  // Execute the graph!
  const result = await graph.invoke({});

  console.log("\n=====START======");
  console.log("Graph result: ", result);
  console.log("\n=====END======");

  res.send("Check the console for the output!");
});
```

1. We compile the graph.
2. We invoke the graph. We will be passing in a `State` object, but for now, we can leave it empty.
3. We log the result to the console.

Refresh your browser and check the console. You should see:

```console
From the 'sayHello' node: Hello world!
From the 'sayBye' node: Bye world!

=====START======
Graph result:  undefined

=====END======
```

1. The `sayHello` node is executed. This logs `"From the 'sayHello' node: Hello world!"`.
2. The `sayBye` node is executed. This logs `"From the 'sayBye' node: Bye world!"`.
3. The graph completes, and the result is logged. In this case, it's `undefined`.

## Hello World Graph with State

We've built a simple graph, but it's not very useful. Let's add some state to our graph.

