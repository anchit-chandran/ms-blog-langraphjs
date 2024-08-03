// Import the 'express' module along with 'Request' and 'Response' types from express
import express, { Request, Response } from "express";

// Create an Express application
const app = express();

// Specify the port number for the server
const port: number = 3008;

app.get("/", async (req: Request, res: Response) => {
  res.send("Check the console for the output!");
});

app.get("/joke-or-fact", async (req: Request, res: Response) => {
  res.send(`Look at the console for the output!`);
});

// Start the server and listen on the specified port
app.listen(port, () => {
  // Log a message when the server is successfully running
  console.log(`Server is running on http://localhost:${port}`);
});
