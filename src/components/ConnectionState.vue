<template>
  <p>State: {{ connected }}</p>
  <div>
    <button @click="startAudio()">Start Audio</button>
    <h2>Connected clients</h2>
    <ul>
      <li v-for="client in clients" :key="client.id">{{ client.signal }}</li>
    </ul>
  </div> 
</template>

<script>
import * as Tone from "tone";

export default {
  name: "ConnectionState",

  data() {
    return {
      testSynth: null,
      toneStarted: false,
      clients: [],
      notes: ['A4', 'B4', 'C4']
    }
  },

  watch: {
    clients(newClients) {
      console.log("clients", newClients)
      const diff = this.compareArrays(this.clients, newClients);
      this.clients = [...this.clients, ...diff.added]

      // still need to DELETE clients who are no longer with us: diff.removed

      // here you can do tone.js stuff
      for (var i=0; i<this.clients.length; i++) {
        var c = this.clients[i];
        // c.signal, c.ip, c.id
        console.log("got a client signal", c.signal)

        if (!c.synth) {
          const note = this.notes[ Math.floor(Math.random(this.notes.length)) ]
          const synth = new Tone.Synth().toDestination();
          if (this.toneStarted) synth.triggerAttack(note); //starting pitch C4
          // add to client object
          c.synth = synth;
          console.log("client has no synth, creating synth", synth);
        }
        // set some other property of the synth tone based on c.signal?
        c.synth.Destination.volume.value = Number(c.signal);
        console.log("settingn client volume based on signal", c.signal);
      }
    }
  },

  computed: {
    connected() {
      return this.$store.state.connected;
    },
  },

  methods: {
    async startAudio() {
      await Tone.start();
      this.toneStarted = true;
      console.log("tone started");
      this.testSynth = new Tone.Synth().toDestination();
      this.testSynth.triggerAttack('A4');
      c.synth.Destination.volume.value = -10;
    },
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
