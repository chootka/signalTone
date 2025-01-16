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
      notes: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"],
      clientSynths: new Map()
    }
  },

  watch: {
    clients(newClients) {
      console.log("clients changed:", newClients)
      
      if (this.audioStarted) {
        // Process active clients
        for (var i = 0; i < newClients.length; i++) {
          var c = newClients[i];
          const id = c.id
          const rawSignal = Number(c.signal);
          
          // Convert signal to decibels (dB)
          // Map signal range (typically -100 to -30) to volume range (-20dB to 0dB)
          const volume = (rawSignal + 100) * (20/70);  // Much louder range
          
          // Map signal to note index (using original scale for pitch)
          const noteIndex = Math.abs(Math.floor(rawSignal/10)) % this.notes.length;

          console.log("raw signal:", rawSignal, "volume (dB):", volume)
          console.log("client id:", c.id)

          if (this.clientSynths.has(id)) {
            try {
              const { synth, lfo } = this.clientSynths.get(id);
              
              // Check if synth is still valid
              if (synth.disposed) {
                this.clientSynths.delete(id);
                return;
              }

              synth.volume.value = volume;
              console.log("Updated synth volume:", synth.volume.value);
              
              // Update LFO parameters based on volume
              // Ensure normalizedVolume stays between 0 and 1
              const normalizedVolume = Math.min(Math.max((volume + 20) / 20, 0), 1);
              lfo.frequency.value = 1 + (normalizedVolume * 10);
              lfo.amplitude.value = 0.1 + (normalizedVolume * 0.9);
            } catch (error) {
              console.log("Error updating synth, recreating:", error);
              // Remove invalid synth
              this.clientSynths.delete(id);
            }
          }

          // If synth doesn't exist or was deleted due to error, create new one
          if (!this.clientSynths.has(id)) {
            const note = this.notes[noteIndex];
            console.log("Creating new synth for note:", note);
            
            const synth = new this.Tone.Synth().toDestination();
            // Create LFO and connect to synth's frequency
            const lfo = new this.Tone.LFO({
              frequency: "4n", 
              min: -50,
              max: 50
            }).start();
            
            // Connect LFO to synth's frequency
            lfo.connect(synth.frequency);
            
            synth.triggerAttack(note, "8n");
            synth.volume.value = volume;
            console.log("Initial synth volume:", synth.volume.value);
            
            // Store both synth and lfo in a object
            this.clientSynths.set(c.id, {
              synth,
              lfo
            });
          }
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
      this.audioStarted = false;
      this.clientSynths.forEach(({synth, lfo}) => {
        // Trigger release before disposal
        synth.triggerRelease();
        // Wait a tiny bit before disposal to allow release to complete
        setTimeout(() => {
          synth.dispose();
          lfo.dispose();
        }, 100);
      });
      this.clientSynths.clear();
      
      // Stop the transport and suspend the context
      if (this.Tone) {
        this.Tone.Transport.stop();
        if (this.Tone.context.state === "running") {
          try {
            this.Tone.context.rawContext.suspend();
          } catch (error) {
            console.log("Context already suspended:", error);
          }
        }
      }
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
