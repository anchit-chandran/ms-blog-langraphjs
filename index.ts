// Import the 'express' module along with 'Request' and 'Response' types from express
import express, { Request, Response } from "express";
import { StateGraph, START, END, StateGraphArgs } from "@langchain/langgraph";

// Create an Express application
const app = express();

// Specify the port number for the server
const port: number = 3000;

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

  // Initialize the LangGraph
  const graphBuilder = new StateGraph({ channels: graphState })
    // Add our 'sayHello' node to the graph
    .addNode("sayHello", sayHello)
    // Add the edges to the graph
    .addEdge(START, "sayHello")
    .addEdge("sayHello", END);

  // Compile the graph
  const graph = graphBuilder.compile();

  // Execute the graph!
  const result = await graph.invoke("sayHello");

  console.log('\n=====START======')
  console.log("Graph result: ", result);
  console.log('\n=====END======')

  res.send("Hello, TypeScript + Node.js + Express!");
});

// Start the server and listen on the specified port
app.listen(port, () => {
  // Log a message when the server is successfully running
  console.log(`Server is running on http://localhost:${port}`);
});
