<template>
  <p>State: {{ connected }}</p>
  <div>
    <h2>Connected clients</h2>
    <ul>
      <li v-for="client in clients" :key="client.id">{{ client.id }}</li>
    </ul>
  </div>
</template>

<script>
import { state } from "@/socket";

export default {
  name: "ConnectionState",

  computed: {
    connected() {
      return state.connected;
    },
    clients() {
      return state.clients;
    }
  }
}
</script>
