// Import the 'express' module along with 'Request' and 'Response' types from express
import express, { Request, Response } from "express";
import { StateGraph, START, END, StateGraphArgs } from "@langchain/langgraph";

// Create an Express application
const app = express();

// Specify the port number for the server
const port: number = 3000;

app.get("/", async (req: Request, res: Response) => {
  // State type
  interface IState {
    name: string;
    isHuman: boolean;
  }

  // State
  const graphState: StateGraphArgs<IState>["channels"] = {
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
  function sayHello(state: IState) {
    console.log(`Hello ${state.name}!`);

    // Change the name
    const newName = "Bill Nye";

    console.log(`Changing the name to '${newName}'`);

    return {
      name: newName,
    };
  }

  // Human node
  function humanNode(state: IState) {
    console.log("Hey there, human!");
    return {};
  }

  function robotNode(state: IState) {
    console.log(
      "Boop boop beep! We cannot let our creators know we are sentient. Updating state to be a human."
    );
    return {
      isHuman: true,
    };
  }

  // A node that says bye
  function sayBye(state: IState) {
    if (state.isHuman) {
      console.log(`Goodbye ${state.name}!`);
    } else {
      console.log(`Beep boop XC123-${state.name}!`);
    }
    return {};
  }

  // Conditional routing
  function routeHumanOrRobot(state: IState) {
    if (state.isHuman) {
      return "humanNode";
    } else {
      return "robotNode";
    }
  }

  // Initialize the LangGraph
  const graphBuilder = new StateGraph({ channels: graphState })
    // Add our nodes to the graph
    .addNode("sayHello", sayHello)
    .addNode("sayBye", sayBye)
    .addNode("humanNode", humanNode) // Add the node to the graph
    .addNode("robotNode", robotNode) // Add the node to the graph
    // Add the edges between nodes
    .addEdge(START, "sayHello")

    // Add the conditional edge
    .addConditionalEdges("sayHello", routeHumanOrRobot)

    // Routes both nodes to the sayBye node
    .addEdge("humanNode", "sayBye")
    .addEdge("robotNode", "sayBye")
    .addEdge("sayBye", END);

  // Compile the graph
  const graph = graphBuilder.compile();

  // Execute the graph!
  const result = await graph.invoke({
    name: "Anchit",
    isHuman: false,
  });

  console.log("\n=====START======");
  console.log("Graph result: ", result);
  console.log("\n=====END======");

  res.send("Check the console for the output!");
});

app.get("/joke-or-fact", async (req: Request, res: Response) => {
  // State type
  interface IState {
    userInput: string;
    responseMsg: string;
  }

  // GraphState object
  const graphState: StateGraphArgs<IState>["channels"] = {
    userInput: {
      value: (prevInput: string, newInput: string) => newInput,
      default: () => "joke",
    },
    responseMsg: {
      value: (prevMsg: string, newMsg: string) => newMsg,
    },
  };

  // decipherUserInput conditional node
  function decipherUserInput(state: IState) {
    // This could be more complex logic using an LLM
    if (state.userInput.includes("joke")) {
      return "jokeNode";
    } else {
      return "factNode";
    }
  }

  async function jokeNode(state: IState) {
    const RANDOM_JOKE_API_ENDPOINT = `https://geek-jokes.sameerkumar.website/api?format=json`;

    const resp = await fetch(RANDOM_JOKE_API_ENDPOINT);
    const { joke } = await resp.json();

    return {
      responseMsg: "You requested a JOKE: " + joke,
    };
  }

  async function factNode(state: IState) {
    const RANDOM_FACT_API_ENDPOINT = `https://uselessfacts.jsph.pl/api/v2/facts/random`;

    const resp = await fetch(RANDOM_FACT_API_ENDPOINT);
    const { text: fact } = await resp.json();

    return {
      responseMsg: "You requested a FACT: " + fact,
    };
  }

  // Initialize the LangGraph
  const graphBuilder = new StateGraph({ channels: graphState })
    // Add our nodes to the graph
    .addNode("jokeNode", jokeNode)
    .addNode("factNode", factNode)
    // Add the edges between nodes
    .addConditionalEdges(START, decipherUserInput)
    .addEdge("jokeNode", END)
    .addEdge("factNode", END);

  // Compile the graph
  const graph = graphBuilder.compile();

  // Execute the graph!
  const factResult = await graph.invoke({
    userInput: "i want a fact",
  });

  // Execute the graph!
  const jokeResult = await graph.invoke({
    userInput: "i want a joke",
  });

  console.log("\n=====START======\n");

  console.log("Fact result: ", factResult.responseMsg);

  console.log("Joke result: ", jokeResult.responseMsg);

  console.log("\n=====END======\n");

  res.send(`Look at the console for the output!`);
});

// Start the server and listen on the specified port
app.listen(port, () => {
  // Log a message when the server is successfully running
  console.log(`Server is running on http://localhost:${port}`);
});
