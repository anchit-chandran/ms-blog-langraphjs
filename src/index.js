"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import the 'express' module along with 'Request' and 'Response' types from express
const express_1 = __importDefault(require("express"));
const langgraph_1 = require("@langchain/langgraph");
// Create an Express application
const app = (0, express_1.default)();
// Specify the port number for the server
const port = 3000;
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // State
    const graphState = {};
    // A node that says hello
    function sayHello(state) {
        console.log(`From the 'sayHello' node: Hello world!`);
        return {};
    }
    // A node that says bye
    function sayBye(state) {
        console.log(`From the 'sayBye' node: Bye world!`);
        return {};
    }
    // Initialize the LangGraph
    const graphBuilder = new langgraph_1.StateGraph({ channels: graphState })
        // Add our nodes to the graph
        .addNode("sayHello", sayHello)
        .addNode("sayBye", sayBye)
        // Add the edges to the graph
        .addEdge(langgraph_1.START, "sayHello")
        .addEdge("sayHello", "sayBye")
        .addEdge("sayHello", langgraph_1.END);
    // Compile the graph
    const graph = graphBuilder.compile();
    // Execute the graph!
    const result = yield graph.invoke({});
    console.log("\n=====START======");
    console.log("Graph result: ", result);
    console.log("\n=====END======");
    res.send("Check the console for the output!");
}));
// Start the server and listen on the specified port
app.listen(port, () => {
    // Log a message when the server is successfully running
    console.log(`Server is running on http://localhost:${port}`);
});
