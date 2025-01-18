<!-- <template>
  <p>State: {{ connected }}</p>
  <div>
    <button id="startBtn" @click="start">Start Audio</button>
    <button id="stopBtn" @click="stop">Stop Audio</button>
    <h2>Connected clients</h2>
    <ul>
      <li v-for="client in clients" :key="client.id">{{ client.signal }}</li>
    </ul>
    <div id="p5-container"></div>
  </div>
</template> -->

<template>
  <div class="connection-state">
    <!-- Left section for controls -->
    <div class="left-section">
      <p>State: {{ connected }}</p>
      <button id="startBtn" @click="start">Start Audio</button>
      <button id="stopBtn" @click="stop">Stop Audio</button>
      <h2>Connected clients</h2>
      <ul>
        <li v-for="client in clients" :key="client.id">{{ client.signal }}</li>
      </ul>
    </div>

    <!-- Right section with canvas and QR code -->
    <div class="right-section">
      <div id="p5-container"></div>
      <div class="qr-code">
        <img src="qr-code.png" alt="QR Code" />
      </div>
    </div>
  </div>
</template>



<script>
import { socket } from "@/socket"
import p5 from 'p5'

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
      
      if (this.audioStarted) {``
        // Process active clients
        for (var i = 0; i < newClients.length; i++) { 
          var c = newClients[i];
          const id = c.id
          const rawSignal = Number(c.signal);
          
          // Convert signal to decibels (dB)
          // Map signal range (typically -100 to -30) to volume range (-20dB to 0dB)
          const volume = (rawSignal + 100) * (30/70);  // Much louder range
          
          // Map rawSignal to frequency
          // const minSignal = -100; // Adjust based on your rawSignal range
          // const maxSignal = -30;
          // const minFrequency = 100; // Adjust for audible range (Hz)
          // const maxFrequency = 2000;

          const frequency = this.map(rawSignal, -100, -30, 220, 4186);
          //const frequency = this.map(rawSignal, -80, -25, 220, 1760);
          //const volume = this.map(rawSignal, -100, -30, -20, 0);
          console.log("raw signal:", rawSignal, "volume (dB):", volume, "frequency (Hz):", frequency);

          // Map signal to note index (using original scale for pitch)
          const noteIndex = Math.abs(Math.floor(rawSignal/10)) % this.notes.length;

          console.log("raw signal:", rawSignal, "volume (dB):", volume)
          console.log("client id:", c.id)

          if (this.clientSynths.has(id)) {
            try {
              const { synth, lfo//, reverb 
              } = this.clientSynths.get(id);
              
              // Check if synth is still valid
              if (synth.disposed) {
                this.clientSynths.delete(id);
                return;
              }

              synth.volume.value = volume;
              synth.frequency.value = frequency;
              //console.log("Updated synth volume:", synth.volume.value);
              console.log(`Updated synth for client ${id}: Volume = ${volume}, Frequency = ${frequency}`);
              
              // Update LFO parameters based on volume
              // Ensure normalizedVolume stays between 0 and 1
              const normalizedVolume = Math.min(Math.max((volume + 20) / 20, 0), 1);
              lfo.frequency.value = 1 + (normalizedVolume * 10);
              lfo.amplitude.value = 0.1 + (normalizedVolume * 0.9);

              // Update reverb wet value
              // const wetValue = map(rawSignal, -100, -30, 0.1, 1);
              // reverb.wet.value = wetValue;

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

            // const reverb = new this.Tone.Reverb({
            //   decay: 20,
            //   preDelay: 0.5,
            // });
            
            // synth.connect(reverb);
            // reverb.toDestination();
            synth.frequency.value = frequency;
            console.log(synth.frequency.value);
            
            synth.triggerAttack(note, "8n");
            synth.volume.value = volume;
            //console.log("Initial synth volume:", synth.volume.value);
            console.log(`New synth for client ${id}: Frequency = ${frequency}, Volume = ${volume}`);

            // const wetValue = map(rawSignal, -100, -30, 0.1, 1);
            // reverb.wet.value = wetValue;
            
            // Store both synth and lfo in a object
            this.clientSynths.set(c.id, {
              synth,
              lfo,
              //reverb
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
    map(value, inMin, inMax, outMin, outMax) {
      return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
    },
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
  },


  mounted() {
  const sketch = (p) => {
    let clientData = new Map(); // Map to store client data: color and signal-based y-position.

    p.setup = function () {
      p.createCanvas(800, 400);
      p.noStroke(); // Remove all strokes
    };

    p.draw = function () {
      p.background(255, 255, 255, 5); // Semi-transparent background for trails

      // Draw a circle for each client based on their signal strength
      for (const [id, data] of clientData) {
        p.fill(data.color); // Use the stored random color for the client

        // Map signal to x position (allow circles to appear closer to the left)
        const x = p.map(data.signal, -80, -30, 50, p.width - 50); // Avoid extreme right/left edges

        // Use the pre-calculated volume if needed elsewhere, but not here
        const y = data.y; // Fixed random y position for each client

        p.ellipse(x, y, 50, 50); // Draw the circle
      }
    };


    // Watch for changes in the `clients` list.
    this.$watch(
      'clients',
      (newClients) => {
        // Update or add clients in the `clientData` map.
        newClients.forEach((client, index) => {
          const id = client.id;
          const signal = Number(client.signal);

          if (!clientData.has(id)) {
            // Assign a random color, random y position, and initialize x position
            const color = p.color(p.random(255), p.random(255), p.random(255));
            const y = p.random(p.height); // Random y position
            clientData.set(id, { color, y, signal });
          } else {
            // Update the signal value for existing clients
            clientData.get(id).signal = signal;
          }
        });

        // Remove disconnected clients from the `clientData` map.
        const newClientIds = newClients.map((client) => client.id);
        for (const id of clientData.keys()) {
          if (!newClientIds.includes(id)) {
            clientData.delete(id);
          }
        }
      },
      { immediate: true } // Ensure the watcher triggers immediately on mount.
    );
  };

  // Use $nextTick to ensure the DOM is fully rendered before creating the p5 instance.
  this.$nextTick(() => {
    this.p5Instance = new p5(sketch, 'p5-container');
  });
}




}
</script>
