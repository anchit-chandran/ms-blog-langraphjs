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

// Initialize the LangGraph
const graphBuilder = new StateGraph({ channels: graphStateChannels })
  // Add our nodes to the graph
  .addNode("jokeNode", jokeNode)
  .addNode("factNode", factNode)
  // Add the edges between nodes
  .addConditionalEdges(START, decipherUserInput)
  .addEdge("jokeNode", END)
  .addEdge("factNode", END);

// Compile the graph
export const jokeOrFactGraph = graphBuilder.compile();
