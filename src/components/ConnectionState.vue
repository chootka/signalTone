<template>
  <p>State: {{ connected }}</p>
  <div>
    <h2>Connected clients</h2>
    <ul>
      <li v-for="client in clients" :key="client.signal">{{ client.signal }}</li>
    </ul>
  </div>
</template>

<script>
import { state } from "@/socket";
import * as Tone from "tone";

export default {
  name: "ConnectionState",

  data() {
    return {
      notes: ['A4', 'B4', 'C4']
    }
  },

  computed: {
    connected() {
      return state.connected;
    },
    clients() {
      const diff = this.compareArrays(this.clients, updatedClients);
      const updatedClients = [...this.clients, ...diff.added]

      // still need to DELETE clients who are no longer with us: diff.removed

      // here you can do tone.js stuff
      for (var i=0; i<updatedClients.length; i++) {
        var c = updatedClients[i];
        // c.signal, c.ip, c.id

        if (!c.synth) {
          const note = this.notes[ Math.floor(Math.random(this.notes.length)) ]
          const synth = new Tone.Synth().toDestination();
          synth.triggerAttack(note); //starting pitch C4
          // add to client object
          c.synth = synth;
        }
        // set some other property of the synth tone based on c.signal?
        c.synth.Destination.volume.value = c.signal;

        return updatedClients;
    }
  },

  methods: {
    compareArrays(oldArray, newArray) {
      const oldIPs = new Set(oldArray.map(item => item.ip));
      const newIPs = new Set(newArray.map(item => item.ip));

      const added = newArray.filter(item => !oldIPs.has(item.ip));
      const removed = oldArray.filter(item => !newIPs.has(item.ip));

      return {
        added,
        removed,
        hasChanged: added.length > 0 || removed.length > 0
      }
    }
  }
}
</script>
