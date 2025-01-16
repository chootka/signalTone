import store from "./store"
import { io } from "socket.io-client";

const URL = "http://kd2lfq.local:5000";

export const socket = io(URL);

socket.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
});

socket.on("connect", () => {
  console.log("connected");
  store.dispatch("updateConnected", true);
});

socket.on("data", (d) => {
  //console.log("data received! Currently connected clients", d.clients);
  store.dispatch('updateClients', d.clients)
});

socket.on("disconnect", () => {
  console.log("disconnected");
  store.dispatch("updateConnected", false);
});