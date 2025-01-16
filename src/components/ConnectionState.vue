<template>
      <pre>{{ $data }}</pre>

  <p>State: {{ connected }}</p>
  <div>
    <button @click="start()">start</button>
    <button @click="stop()">stop</button>
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
      synth: {},
      noise: {},
      clients: [],
      notes: ['A4', 'B4', 'C4']
    }
  },

  // watch: {
  //   clients(newClients) {
  //     console.log("clients", newClients)
  //     const idx = newClients.indexOf('No clients found');
  //     console.log("idx", idx);
  //     console.log("newClients", newClients)
  //     newClients.splice(idx, 1);

  //     const diff = this.compareArrays(this.clients, newClients);
  //     this.clients = [...this.clients, ...diff.added]

  //     // still need to DELETE clients who are no longer with us: diff.removed

  //     // here you can do tone.js stuff
  //     for (var i = 0; i < this.clients.length; i++) {
  //       var c = this.clients[i];
  //       // c.signal, c.ip, c.id
  //       console.log("got a client signal", c.signal)

  //       // if (!c.synth) {
  //       //   const note = this.notes[Math.floor(Math.random(this.notes.length))]
  //       //   const synth = new Tone.Synth().toDestination();
  //       //   if (this.toneStarted) synth.triggerAttack(note); //starting pitch C4
  //       //   // add to client object
  //       //   c.synth = synth;
  //       //   console.log("client has no synth, creating synth", synth);
  //       // }
  //       // // set some other property of the synth tone based on c.signal?
  //       // c.synth.Destination.volume.value = Number(c.signal);
  //       // console.log("setting client volume based on signal", c.signal);
  //     }
  //   }
  // },

  computed: {
    connected() {
      return this.$store.state.connected;
    },
  },

  methods: {
    // start() {
    //   Tone.start();
    //   // Tone.context.resume();
    //   this.noise = new Tone.Noise("pink");
    //   //this.noise.start().toMaster();
    //   this.noise.start().toDestination();
    // },
    // stop() {
    //   this.noise.stop();
    // },

  //   start() {
  //     console.log('start');
      
  //     Tone.start().then(() => {
  //     console.log("Audio context started");
  //     debugger;
  //     // this.noise = new Tone.Noise("pink").toDestination();
  //     // this.noise.start();
  //   }).catch((err) => {
  //     console.error("Error starting Tone.js:", err);
  //  });

  start() {
    console.log('start');
    Tone.start()
      .then(function () {
        debugger;
        console.log("Audio context started");
        this.synth = new Tone.Synth();
        this.synth.toDestination(); // Explicitly bound to the Vue component
        console.log("Synth initialized", this.synth);
      }.bind(this))
      .catch(function (err) {
        console.error("Error starting Tone.js:", err);
      });
  },


    // async startAudio() {
    //   try {
    //     console.log('starting audio')
    //     await Tone.start();

    //     this.toneStarted = true;
    //     console.log("tone started");

    //     if (!this.testSynth) {
    //       this.testSynth = new Tone.Synth().toDestination();
    //     }

    //     this.testSynth.triggerAttackRelease('C4', '8n');
    //     // this.testSynth.Destination.volume.value = -10;

    //   } catch (error) {
    //     console.log(error);
    //   }
    // },
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
  },
  created() {
    //this.synth = new Tone.FMSynth().toDestination();
  },
}
</script>
