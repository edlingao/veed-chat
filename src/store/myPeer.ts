import { createSlice } from '@reduxjs/toolkit'

const peer = new Peer();

export const myPeerSlice = createSlice({
  name: 'myPeer',
  initialState: {
    value: {
      peer: peer,
      id: "null",
      peers: [],
      mediaStream: null,
      remoteStreams: [],
    },
  },
  reducers: {
    setID: (state, { payload }) => {
      console.log("setID", payload);
      state.value.id = payload;
    },
    setMediaStream: (state, { payload }) => {
      console.log("setMediaStream", payload);
      state.value.mediaStream = payload;
    },
    setRemoteMediaStream: (state, { payload }) => {
      const doesNotExist = state.value.remoteStreams.find(
        (remoteStream) => remoteStream.id === payload.id
      ) == null
      if(doesNotExist) {
        console.log("Pushed new remote stream");
        state.value.remoteStreams.push(payload)
      }
    },
    addPeerID: (state, { payload }) => {
      const doesNotExist = state.value.peers.find(
        (peerID) => peerID === payload 
      ) == null && payload !== state.value.id
      
      if(doesNotExist) {
        console.log("Pushed new peer id");
        state.value.peers = [...state.value.peers, payload]
      }
    },
    addMultiPlePeerIDs: (state, { payload }) => {
      console.log("addMultiPlePeerIDs", payload);
      const doesNotExist = state.value.peers.find(
        (peerID) => peerID === payload 
      ) == null && payload !== state.value.id
      if(doesNotExist) {
        state.value.peers = [...state.value.peers, ...payload]
        const peers = state.value.peers;
        const id = state.value.id;
        payload.forEach(peerID => {
          const conn = peer.connect(peerID);
          conn.on('open', function() {
            console.log('Connected to: ' + peerID);
            // Send messages
            conn.send(JSON.stringify([...peers, id]));
          });
        });
      }
    }
  },
})

export const { setID, setMediaStream, setRemoteMediaStream, addPeerID, addMultiPlePeerIDs } = myPeerSlice.actions

export const setIDAsync = (dispatch) => {
  peer.on("open", (id) => {
    console.log("My peer ID is: " + id);
    dispatch(setID(id));
  });

  peer.on('connection', function(conn) { 
    // Receive messages
    conn.on('data', function(data) {
      const parsedPeers = JSON.parse(data)
      dispatch(addMultiPlePeerIDs(parsedPeers))
    });
  });
}

export const setAnswerResponse = (mediastream) => {
  peer.on('call', function(call) {
    // Answer the call, providing our mediaStream
    call.answer(mediastream);
  });
}

export const callPeer = (dispatch, peerID, stream) => {
  const call = peer.call(peerID, stream)
  console.log("CALLING PEER", peerID);
  call.on('stream', function(remoteStream) {
    console.log("Got Stream", stream)
    dispatch(setRemoteMediaStream(remoteStream));
    dispatch(addPeerID(peerID));
  })
}

export const shareMyParticipantsAndI = (peerID, peers, myPeer) => {
  const conn = peer.connect(peerID);

  conn.on('open', function() {
    // Receive messages
    conn.on('data', function(data) {
      dispatch(addMultiPlePeerIDs(JSON.parse(data)));
    });
  
    // Send messages
    conn.send(JSON.stringify([...peers, myPeer]));
  });
}

export default myPeerSlice.reducer
