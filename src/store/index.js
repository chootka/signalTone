import { createStore } from 'vuex'

export default createStore({
    state: {
        connected: false,
        clients: []
    },
    mutations: {
        UPDATE_CONNECTED(state, payload) {
            state.connected = payload
        },
        UPDATE_CLIENTS(state, payload) {
            state.clients = payload
        }
    },
    actions: {
        updateConnected(context, payload) {
            context.commit('UPDATE_CONNECTED', payload)
        },
        updateClients(context, payload) {
            context.commit('UPDATE_CLIENTS', payload)
        }
    },
})