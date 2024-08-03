import express, { Request, Response } from "express";
import { helloWorldGraph } from "./helloWorldGraph";
import { jokeOrFactGraph } from "./jokeOrFactGraph";

// Create an Express application
const app = express();

// Specify the port number for the server
const port: number = 3008;

app.get("/", async (req: Request, res: Response) => {
  // Execute the graph!
  const result = await helloWorldGraph.invoke({
    name: "Anchit",
    isHuman: false,
  });

  console.log("\n=====START======");
  console.log("Graph result: ", result);
  console.log("\n=====END======");

  res.send("Check the console for the output!");
});

app.get("/joke-or-fact", async (req: Request, res: Response) => {
  // Execute the graph with a fact!
  const factResult = await jokeOrFactGraph.invoke({
    userInput: "i want a fact",
  });

  // Execute the graph with a joke!
  const jokeResult = await jokeOrFactGraph.invoke({
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
