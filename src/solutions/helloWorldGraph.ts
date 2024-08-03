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
  console.log(`Hello ${state.name}!`);

  // Change the name
  const newName = "Bill Nye";

  console.log(`Changing the name to '${newName}'`);

  return {
    name: newName,
  };
}

// Human node
function humanNode(state: HelloWorldGraphState) {
  console.log("Hey there, human!");

  return {};
}

// Robot node
function robotNode(state: HelloWorldGraphState) {
  console.log(
    "Boop boop beep! We cannot let our creators know we are sentient. Updating state to be a human."
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

function routeHumanOrRobot(state: HelloWorldGraphState) {
  if (state.isHuman) {
    return "humanNode";
  } else {
    return "robotNode";
  }
}

// Initialize the LangGraph
const graphBuilder = new StateGraph({ channels: graphStateChannels })
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
export const helloWorldGraph = graphBuilder.compile();
