<template>
  <button @click="connect()">Connect</button>
  <button @click="disconnect()">Disconnect</button>
  <div>
    <h2>Connected clients</h2>
    <ul>
      <li v-for="client in clients" :key="client.id">{{ client.id }}</li>
    </ul>
  </div>
</template>

<script>
import { socket } from "@/socket";

export default {
  name: "ConnectionManager",
  computed: {
    clients() {
      return state.clients;
    }
  },
  methods: {
    connect() {
      socket.connect();
    },
    disconnect() {
      socket.disconnect();
    }
  }
}
</script>
