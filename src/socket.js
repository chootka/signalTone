import store from "./store"
import { io } from "socket.io-client";

// get the local URL for development
const location = window.location.href;
console.log("location", location);
const baseUrl = location.split(':')[1];
console.log("baseURL", baseUrl);
const devUrl = baseUrl + ':5000';
console.log("devUrl", devUrl);

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === "production" ? undefined : devUrl;

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
