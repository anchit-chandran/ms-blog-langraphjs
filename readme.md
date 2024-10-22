# Getting Started with LangGraph.js

Welcome to this complete beginner's guide to LangGraph.js, a powerful library in the Langchain ecosystem. In it, we will explore the basics of building applications with LangGraph.js.

## Who is this guide for?

This guide is designed for absolute beginners new to LangGraph.js who want to build applications powered by Large Language Models (LLMs). I began using LangGraph.js as part of my Microsoft MSc Computer Science IXN Final Project at UCL. During my journey, I noticed a need for more beginner-friendly resources, especially for the TypeScript implementation, and found that the official documentation was still in progress. Through this guide, I aim to bridge that gap and showcase the potential of LangGraph.js and Langchain for creating LLM-powered products.

While prior experience with LangGraph.js is not required, familiarity with the Langchain ecosystem and building with LLMs will be useful. A basic understanding of TypeScript will help you follow the code samples and concepts.

## Will I need API Keys?

No, you won't need any API keys for this guide. We'll use mock LLM calls and free external APIs to keep the tutorial accessible to everyone.

## Learning outcomes

By the end of this guide, you will:

- Gain a solid foundation in the basics of LangGraph.js and how it works.
- Build confidence in leveraging the Langchain and Langraph ecosystem to develop LLM-powered applications.
- Learn how to independently create and manage graphs using LangGraph.js.

## Overview of LangGraph.js

LangGraph.js is a JavaScript library designed to simplify the creation and manipulation of complex LLM-based workflows. It particularly shines when creating agentic workflows - systems which use an LLM to decide the course of action based on the current state. It provides an intuitive way to model workflows as graphs composed of nodes and edges, making it easier to manage complex data flows and processes.

LangGraph state three core principles which make it the best framework for this:

1. **Controllability**: being low level, LangGraph gives high control over the workflow - invaluable for getting reliable outputs from non-deterministic models.
2. **Human-in-the-Loop**: with a built-in persistence layer, LangGraph is designed for 'human-in-the-loop' workflows as a first-class concept.
3. **Streaming First**: agentic applications can take a long time to run, so first-class streaming support enables real-time updates, giving a better user experience.

Ultimately, developers can focus on logic rather than infrastructure.

For more details, see the official [LangGraph for Agentic Applications](https://langchain-ai.github.io/langgraphjs/concepts/high_level/).

## Prerequisites

Before getting started, ensure you have the following tools installed:

- Node.js and npm

## Setting Up the Starter Repository

**Clone the Starter Repository**:

```bash
git clone <https://github.com/anchit-chandran/ms-blog-langraphjs>
cd ms-blog-langraphjs
```

**Install dependencies**:

```bash
npm install
```

This is a basic Express.js starter repository. We will only be working in the `/src` directory.

Complete solutions for the respective files are available in the `/solutions` directory if you get stuck.

Open `src/index.ts`.

## Understanding the Basics

### What is a Graph?

A graph is a collection of nodes and edges.

In this tutorial, we cover the main graph class: **`StateGraph`**. This contains a user-defined `State` object, passed using the `channels` argument.

There are 3 critical concepts in LangGraph.js:

- **Nodes**: JavaScript/TypeScript functions that encode logic.
- **Edges**: JavaScript/TypeScript functions that determine which `Node` to execute next based on the current `State`. These can be conditional branches or direct, fixed transitions.
- **State**: a shared data structure used throughout the Graph, representing the current snapshot of the application.

More simply, nodes are functions that do work, edges are functions that choose what work to do, and the `State` tracks data throughout the workflow.

The [official documentation](https://langchain-ai.github.io/langgraphjs/concepts/low_level/#graphs) is a great resource.

We'll work towards creating a workflow which, based on the user's input, will reply with an excellent programming joke or a helpful random fact.

![Joke or Fact LangGraph](assets/jokeorfact.png)

But first, let's build the most basic Graph possible.

## Hello World Graph

We'll start by building a graph that just logs "Hello world!" and "Bye world!", with no inputs.

![Bare Bones Hello World Graph](assets/hellowordbarebones.png)

The general pattern for building a graph is:

1. Define the `State` object.
2. Define and add the `Nodes` and `Edges`.
3. Compile the Graph - this step provides basic checks (e.g. ensuring no orphaned nodes) and where runtime arguments can be passed.

For tidiness, let's put the graph code in a different file.

Open `src/helloWorld.ts`.

We'll be working on this file for this section.

Now, there are a few components to set up - all required to compile a graph:

1. State
2. Nodes
3. Graph connecting nodes with edges

We'll start quite barebones and incrementally build up.

### State

After adding necessary imports, we need to define our `State` object, along with its interface:

```ts
import { StateGraph, START, END, StateGraphArgs } from "@langchain/langgraph";

// State type
interface HelloWorldGraphState {}

// State
const graphStateChannelsChannels: StateGraphArgs<HelloWorldGraphState>["channels"] =
  {};
```

We'll come back to this, but at a glance:

- `HelloWorldGraphState` will be the interface for our `State`.
- `graphStateChannelsChannels` includes our _reducers_, which specify ["how updates from nodes are applied to the `State`"](https://langchain-ai.github.io/langgraphjs/concepts/low_level/#reducers).

### Defining Nodes

We'll now add our first Nodes: `sayHello` and `sayBye`.

A Node is simply a TS function, which takes in a `State` object and returns (for now) an empty object:

```ts
import { StateGraph, START, END, StateGraphArgs } from "@langchain/langgraph";

// State type
interface HelloWorldGraphState {}

// State
const graphStateChannelsChannels: StateGraphArgs<HelloWorldGraphState>["channels"] =
  {};

// A node that says hello
function sayHello(state: HelloWorldGraphState) {
  console.log(`From the 'sayHello' node: Hello world!`);
  return {};
}

// A node that says bye
function sayBye(state: HelloWorldGraphState) {
  console.log(`From the 'sayBye' node: Bye world!`);
  return {};
}
```

### Building the Graph

Our Graph is ready to be built!

Add to the code:

```ts
//Initialise the LangGraph
const graphBuilder = new StateGraph({ channels: graphStateChannels }) // Add our nodes to the Graph
  .addNode("sayHello", sayHello)
  .addNode("sayBye", sayBye) // Add the edges between nodes
  .addEdge(START, "sayHello")
  .addEdge("sayHello", "sayBye")
  .addEdge("sayBye", END);

// Compile the Graph
export const helloWorldGraph = graphBuilder.compile();
```

1. We initialise a new `StateGraph` with a single object `{channels: graphStateChannels}`, where `graphStateChannels` is previously defined.
2. The `sayHello` and `sayBye` Nodes are added to the Graph.
3. The Edges are defined between nodes. **NOTE: There must always be a path from `START` to `END`.**
4. Finally, we compile and export the `helloWorldGraph`.

### Running the Graph

We can now use our Graph.

Move back to `src/index.ts`, importing our `helloWorldGraph` at the top:

```ts
import express, { Request, Response } from "express";
import { helloWorldGraph } from "./helloWorldGraph";
```

Then, inside our GET `/` route, we can execute the Graph:

```ts
import express, { Request, Response } from "express";
import { helloWorldGraph } from "./helloWorldGraph";

// Create an Express application
const app = express();

// Specify the port number for the server
const port: number = 3008;

app.get("/", async (req: Request, res: Response) => {
  // Execute the Graph!
  const result = await helloWorldGraph.invoke({});

  console.log("\n=====START======");
  console.log("Graph result: ", result);
  console.log("\n=====END======");

  res.send("Check the console for the output!");
});
```

1. We invoke the Graph. We will later pass in a `State` object, but we can leave it empty for now.
2. We log the result to the console.

Refresh your browser and check the console. You should see:

```console
From the 'sayHello' node: Hello world!
From the 'sayBye' node: Bye world!

=====START======
Graph result:  undefined

=====END======
```

1. The `sayHello` node is executed. This logs `" From the 'sayHello' node: Hello world!```.
2. The `sayBye` node is executed. This logs `" From the 'sayBye' node: Bye world!```.
3. The Graph completes, and the result is logged. In this case, it's `undefined`.

## Hello World Graph with State

We've built a simple graph, but it could be more fun if we added some states.

![Hello World Graph with State](assets/helloworldstate.png)

Go back to `src/helloWorld.ts`.

We'll add the `name` and `isHuman` properties to our `State` object and update the `sayHello` and `sayBye` nodes to use these `State` object properties.

First, update the `IState` interface:

```ts
interface HelloWorldGraphState {
  name: string; // Add a name property
  isHuman: boolean; // Add an isHuman property
}
```

And update the `graphStateChannels` object:

```ts
// State type
interface HelloWorldGraphState {
  name: string; // Add a name property
  isHuman: boolean; // Add an isHuman property
}

// State
const graphStateChannels: StateGraphArgs<HelloWorldGraphState>["channels"] = {
  name: {
    value: (prevName: string, newName: string) => newName,
    default: () => "Ada Lovelace",
 },
  isHuman: {
    value: (prevIsHuman: boolean, newIsHuman: boolean) =>
      newIsHuman ?? prevIsHum

};
```

Inside `graphStateChannels`, we add two keys: `name` and `isHuman`.

Each key takes its own **reducer** function. If no function is specified, it's assumed all updates to that key should override the previous value.

We add reducer objects, each with a `value` function and (optionally) a `default` function.

- The `value` function is called when the property is updated. It takes in the current `state` value and the new `update` value (the update returned from a node). It decides how to update the property. This is useful because if many nodes update the same property, you can define how the property should be updated in one place. Moreover, not all nodes need to return the entire state object; they can return the keys they wish to update.
- The `default` function is called when the property is first accessed. This is useful for setting initial values.

Now, update the `sayHello` and `sayBye` nodes to use the `name` and `isHuman` properties, as shown below.

Note how, in each node, we only return properties we want to update:

```ts
// A node that says hello
function sayHello(state: HelloWorldGraphState) {
  console.log(`Hello ${state.name}!`); // Change the name

  const newName = "Bill Nye";

  console.log(`Changing the name to '${newName}'`);

  return {
    name: newName,
  };
}

// A node that says bye
function sayBye(state: HelloWorldGraphState) {
  if (state.isHuman) {
    console.log(`Goodbye ${state.name}!`);
  } else {
    console.log(`Beep boop XC123-${state.name}!`);
  }
  return {};
}
```

Your final code should look like this:

```ts
import { StateGraph, START, END, StateGraphArgs } from "@langchain/langgraph";

// State type
interface HelloWorldGraphState {
  name: string; // Add a name property
  isHuman: boolean; // Add an isHuman property
}

// State
const graphStateChannels: StateGraphArgs<HelloWorldGraphState>["channels"] = {
  name: {
    value: (prevName: string, newName: string) => newName,
    default: () => "Ada Lovelace",
  },
  isHuman: {
    value: (prevIsHuman: boolean, newIsHuman: boolean) =>
      newIsHuman ?? prevIsHuman ?? false,
  },
};

// A node that says hello
function sayHello(state: HelloWorldGraphState) {
  console.log(`Hello ${state.name}!`); // Change the name

  const newName = "Bill Nye";

  console.log(`Changing the name to '${newName}'`);

  return {
    name: newName,
  };
}

// A node that says bye
function sayBye(state: HelloWorldGraphState) {
  if (state.isHuman) {
    console.log(`Goodbye ${state.name}!`);
  } else {
    console.log(`Beep boop XC123-${state.name}!`);
  }
  return {};
}

//Initialise the LangGraph
const graphBuilder = new StateGraph({ channels: graphStateChannels }) // Add our nodes to the Graph
  .addNode("sayHello", sayHello)
  .addNode("sayBye", sayBye) // Add the edges between nodes
  .addEdge(START, "sayHello")
  .addEdge("sayHello", "sayBye")
  .addEdge("sayBye", END);

// Compile the Graph
export const helloWorldGraph = graphBuilder.compile();
```

Finally, in `src/index.ts`, update the `invoke` function with values for `name` and `isHuman` e.g.

```ts
app.get("/", async (req: Request, res: Response) => {
  // Execute the Graph!
  const result = await helloWorldGraph.invoke({
    name: "Anchit",
    isHuman: true,
  });

  console.log("\n=====START======");
  console.log("Graph result: ", result);
  console.log("\n=====END======");

  res.send("Check the console for the output!");
});
```

Refresh your browser and check the console. You should see something like:

```console
Hello Anchit!
Changing the name to 'Bill Nye'
Goodbye, Bill Nye!

=====START======
Graph result:  { name: 'Bill Nye', isHuman: true }

=====END======
```

We now have access to the updated State! This can also be streamed - check the [LangGraph.js documentation](https://langchain-ai.github.io/langgraphjs/concepts/low_level/#streaming) for more information.

Now try changing the `isHuman` property to `false` and refreshing the page. Also, omit the `name` property:

```ts
// Execute the Graph!
const result = await helloWorldGraph.invoke({
  // name: "Anchit",
  isHuman: false,
});
```

Should output:

```console
Hello Ada Lovelace!
Changing the name to 'Bill Nye'
Beep boop XC123-Bill Nye!

=====START======
Graph result:  { name: 'Bill Nye', isHuman: false }

=====END======
```

- As no `name` property exists, the default value (`Ada Lovelace`) is used.
- The `isHuman` property is set to `false`, so the `sayBye` node outputs `Beep boop XC123-Bill Nye!`.

## Adding a Conditional Edge

![Adding a Conditional Edge](assets/addconditional.png)

Go back to `hellWorldGraph.ts`.

We can add conditional edges to our Graph. This allows us to choose which node to execute next based on the current State.

Imagine that the computation for humans and robots is very different. Let's separate the logic into different nodes.

If the `isHuman` property is `true`, we want to route to a `humanNode`. Otherwise, we want to route to a `robotNode`. Both nodes will route to `END`.

First, define the `humanNode` and `robotNode` (above the `sayBye`, which is unchanged):

```ts
// Human node
function humanNode(state: HelloWorldGraphState) {
  console.log("Hey there, human!");

  return {};
}

// Robot node
function robotNode(state: HelloWorldGraphState) {
  console.log(
    "Boop boop beep! We cannot let our creators know we are sentient. Updating State to be a human."
  );
  return {
    isHuman: true,
  };
}

// A node that says bye
function sayBye(state: HelloWorldGraphState) {
  if (state.isHuman) {
    console.log(`Goodbye ${state.name}!`);
  } else {
    console.log(`Beep boop XC123-${state.name}!`);
  }
  return {};
}
```

Also, we'll add a function that handles the conditional routing under `sayBye`:

```ts
function routeHumanOrRobot(state: HelloWorldGraphState) {
  if (state.isHuman) {
    return "humanNode";
  } else {
    return "robotNode";
  }
}
```

This takes in the `State` and returns the name of the next node to route to.

Update the Graph's nodes and edges:

```ts
//Initialise the LangGraph
const graphBuilder = new StateGraph({ channels: graphStateChannels }) // Add our nodes to the Graph
  .addNode("sayHello", sayHello)
  .addNode("sayBye", sayBye)
  .addNode("humanNode", humanNode) // Add the node to the graph
  .addNode("robotNode", robotNode) // Add the node to the graph // Add the edges between nodes
  .addEdge(START, "sayHello") // Add the conditional edge

  .addConditionalEdges("sayHello", routeHumanOrRobot) // Routes both nodes to the sayBye node

  .addEdge("humanNode", "sayBye")
  .addEdge("robotNode", "sayBye")
  .addEdge("sayBye", END);

// Compile the Graph
export const helloWorldGraph = graphBuilder.compile();
```

Back in `src/index.ts`, execute the Graph with similar values:

```ts
// Execute the Graph!
const result = await helloWorldGraph.invoke({
  name: "Anchit",
  isHuman: true,
});
```

```console
Hello Anchit!
Changing the name to 'Bill Nye'
Hey there, human!
Goodbye, Bill Nye!

=====START======
Graph result:  { name: 'Bill Nye', isHuman: true }

=====END======

```

But using `isHuman: false`:

```console
Hello Anchit!
Changing the name to 'Bill Nye'
Boop boop beep! We cannot let our creators know we are sentient. Updating State to be a human.
Goodbye, Bill Nye!

=====START======
Graph result:  { name: 'Bill Nye', isHuman: true }

=====END======
```

We see that the `robotNode` is executed, the `isHuman` property is updated back to `true`, and it is returned in the final State.

We've now built a simple graph with conditional routing! We can now create a slightly more complex graph that returns a random fact or joke.

## Building a Random Fact or Joke Graph

We'll build a graph that returns a random fact or joke based on the user's input.

![Joke or Fact LangGraph](assets/jokeorfact.png)

This will mock LLM calls to decipher whether the user has requested a joke or fact, then hit external APIs to get and return the data.

First, open the `src/jokeOrFactGraph.ts` file, add the following imports and State:

```ts
import { StateGraph, START, END, StateGraphArgs } from "@langchain/langgraph";

// State type
interface JokeOrFactGraphState {
  userInput: string;
  responseMsg: string;
}

// graphStateChannels object
const graphStateChannels: StateGraphArgs<JokeOrFactGraphState>["channels"] = {
  userInput: {
    value: (prevInput: string, newInput: string) => newInput,
    default: () => "joke",
  },
  responseMsg: {
    value: (prevMsg: string, newMsg: string) => newMsg,
  },
};
```

Next, let's add a `decipherUserInput` conditional node that determines whether the user has requested a joke or fact. This will mock an LLM call, simply checking if the user input contains the word "joke":

```ts
// decipherUserInput conditional node
function decipherUserInput(state: JokeOrFactGraphState) {
  // This could be more complex logic using an LLM
  if (state.userInput.includes("joke")) {
    return "jokeNode";
  } else {
    return "factNode";
  }
}
```

Next, let's define the `jokeNode` and `factNode` nodes, using free external APIs:

```ts
async function jokeNode(state: JokeOrFactGraphState) {
  const RANDOM_JOKE_API_ENDPOINT =`<https://geek-jokes.sameerkumar.website/api?format=json`>;

  const resp = await fetch(RANDOM_JOKE_API_ENDPOINT);
  const { joke } = await resp.json();

  return {
    responseMsg: "You requested a JOKE: "+ joke,
 };
}

async function factNode(state: JokeOrFactGraphState) {
  const RANDOM_FACT_API_ENDPOINT = `https://uselessfacts.jsph.pl/api/v2/facts/random`;

  const resp = await fetch(RANDOM_FACT_API_ENDPOINT);
  const { text: fact } = await resp.json();

  return {
    responseMsg: "You requested a FACT: "+ fact,
 };
}

```

Let's wire up the Graph's nodes and edges, alongside compiling it:

```ts
//Initialise the LangGraph
const graphBuilder = new StateGraph({ channels: graphStateChannels }) // Add our nodes to the graph
  .addNode("jokeNode", jokeNode)
  .addNode("factNode", factNode) // Add the edges between nodes
  .addConditionalEdges(START, decipherUserInput)
  .addEdge("jokeNode", END)
  .addEdge("factNode", END);

// Compile the Graph
export const jokeOrFactGraph = graphBuilder.compile();
```

The complete code for jokeOrFactGraph.ts should look like:

```ts
import { StateGraph, START, END, StateGraphArgs } from "@langchain/langgraph";

// State type
interface JokeOrFactGraphState {
  userInput: string;
  responseMsg: string;
}

// graphStateChannels object
const graphStateChannels: StateGraphArgs<JokeOrFactGraphState>["channels"] = {
  userInput: {
    value: (prevInput: string, newInput: string) => newInput,
    default: () => "joke",
  },
  responseMsg: {
    value: (prevMsg: string, newMsg: string) => newMsg,
  },
};

// decipherUserInput conditional node
function decipherUserInput(state: JokeOrFactGraphState) {
  // This could be more complex logic using an LLM
  if (state.userInput.includes("joke")) {
    return "jokeNode";
  } else {
    return "factNode";
  }
}

async function jokeNode(state: JokeOrFactGraphState) {
  const RANDOM_JOKE_API_ENDPOINT = `https://geek-jokes.sameerkumar.website/api?format=json`;

  const resp = await fetch(RANDOM_JOKE_API_ENDPOINT);
  const { joke } = await resp.json();

  return {
    responseMsg: "You requested a JOKE: " + joke,
  };
}

async function factNode(state: JokeOrFactGraphState) {
  const RANDOM_FACT_API_ENDPOINT = `https://uselessfacts.jsph.pl/api/v2/facts/random`;

  const resp = await fetch(RANDOM_FACT_API_ENDPOINT);
  const { text: fact } = await resp.json();

  return {
    responseMsg: "You requested a FACT: " + fact,
  };
}

//Initialise the LangGraph
const graphBuilder = new StateGraph({ channels: graphStateChannels }) // Add our nodes to the graph
  .addNode("jokeNode", jokeNode)
  .addNode("factNode", factNode) // Add the edges between nodes
  .addConditionalEdges(START, decipherUserInput)
  .addEdge("jokeNode", END)
  .addEdge("factNode", END);

// Compile the Graph
export const jokeOrFactGraph = graphBuilder.compile();
```

Finally, inside `src/index.ts`, import and execute the Graph with a user input, inside the `/joke-or-fact` route:

```ts
app.get("/joke-or-fact", async (req: Request, res: Response) => {
  // Execute the Graph with a fact!
  const factResult = await jokeOrFactGraph.invoke({
    userInput: "i want a fact",
  }); // Execute the Graph with a joke!

  const jokeResult = await jokeOrFactGraph.invoke({
    userInput: "i want a joke",
  });

  console.log("\n=====START======\n");

  console.log("Fact result: ", factResult.responseMsg);

  console.log("Joke result: ", jokeResult.responseMsg);

  console.log("\n=====END======\n");

  res.send(`Look at the console for the output!`);
});
```

Navigate to `http://localhost:3008/joke-or-fact` and check the console. You should see something like:

```console
=====START======

Fact result:  You requested a FACT: Over 1000 birds a year die from smashing into windows!
Joke result:  You requested a JOKE: What do computers and air conditioners have in common? They both become useless when you open windows.

=====END======

```

## Conclusion

In this guide, we've covered the basics of LangGraph.js, building a simple graph that returns a random fact or joke based on user input.

We've learned how to define nodes, edges, and state objects and how to add conditional routing to our Graph.

LangGraph.js is a powerful tool for building complex workflows and managing State in your applications. With an understanding of the basics, you can dive deeper into more complex workflows, leverage the Langchain.js toolkit, and build your own LLM-powered applications.

## Next Steps

There's a lot more beyond the basics, such as:

- Checkpoints
- Threads
- Streaming
- Breakpoints
- Migrations

The best resource for understanding LangGraph.js better is the [official documentation](https://langchain-ai.github.io/langgraphjs/concepts/low_level/). Also, check out [Building ToolLLM With LangGraph.js](https://www.youtube.com/watch?v=xbZzJjBm6t4&t=742s) for a more production-grade example!
