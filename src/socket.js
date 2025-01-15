import { reactive } from "vue";
import { io } from "socket.io-client";

export const state = reactive({
  connected: false,
  clients: [],
  fooEvents: [],
  barEvents: []
});

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === "production" ? undefined : "http://kd2lfq.local:5000";

export const socket = io(URL);

socket.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
});

socket.on("connect", () => {
  console.log("connected");
  state.connected = true;
});

socket.on("data", (d) => {
  console.log("data received! Currently connected clients", d.clients);
  state.clients = d.clients;
});

socket.on("disconnect", () => {
  console.log("disconnected");
  state.connected = false;
});

//socket.on("foo", (...args) => {
//  state.fooEvents.push(args);
//});

//socket.on("bar", (...args) => {
//  state.barEvents.push(args);
//});
