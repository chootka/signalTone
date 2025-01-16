<template>
  <p>State: {{ connected }}</p>
  <div>
    <button @click="start">Start Audio</button>
    <button @click="stop">Stop Audio</button>
    <h2>Connected clients</h2>
    <ul>
      <li v-for="client in clients" :key="client.id">{{ client.signal }}</li>
    </ul>
  </div>
</template>

<script>
import { socket } from "@/socket"

export default {
  name: "ConnectionState",

  data() {
    return {
      Tone: null,
      audioStarted: false,
      notes: ["C4", "D4", "E4", "F4", "G4", "A4", "B4"]
    }
  },

  watch: {
    clients(newClients) {
      console.log("clients changed:", newClients)
      
      if (this.audioStarted) {
        // Process active clients
        for (var i = 0; i < newClients.length; i++) {
          var c = newClients[i];
          var signal = Number(c.signal)/20;
          console.log("signal", signal)

          const note = this.notes[Math.abs(Math.floor(signal))]
          console.log("note", note)
          
          const synth = new this.Tone.Synth().toDestination();
          synth.triggerAttackRelease(note, "8n");
          synth.volume.value = signal;
        }
      }
    }
  },

  computed: {
    connected() {
      return this.$store.state.connected
    },
    clients() {
      return this.$store.state.clients
    }
  },

  methods: {
    stop() {
      this.audioStarted = false
    },
    async start() {
      try {
        // Dynamically import Tone only when user clicks
        const Tone = await import('tone')
        this.Tone = Tone
        
        console.log("Starting Tone.js...", this.Tone)
        if (this.Tone.Context && !this.Tone.context) {
          this.Tone.context = new this.Tone.Context()
        }
        
        if (this.Tone.context.state !== "running") {
          await this.Tone.context.resume()
          this.audioStarted = true
          console.log("Tone.js started successfully", this.Tone.context.state)
        } else {
          this.audioStarted = true
        }
      } catch (error) {
        console.error('Failed to start Tone.js:', error)
      }
    },
  }
}
</script>
