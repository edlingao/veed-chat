import { createSlice } from '@reduxjs/toolkit'

// @ts-ignore
const peer: any = new Peer();

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
    setRemoteMediaStream: (state: any, { payload }: any) => {
      const doesNotExist = state.value.remoteStreams.find(
        (remoteStream: any) => remoteStream.id === payload.id
      ) == null
      if(doesNotExist) {
        console.log("Pushed new remote stream");
        state.value.remoteStreams.push(payload)
      }
    },
    addPeerID: (state: any, { payload }) => {
      const doesNotExist = state.value.peers.find(
        (peerID: string) => peerID === payload 
      ) == null && payload !== state.value.id
      
      if(doesNotExist) {
        console.log("Pushed new peer id");
        state.value.peers = [...state.value.peers, payload]
      }
    },
    addMultiPlePeerIDs: (state: any, { payload }: any) => {
      console.log("addMultiPlePeerIDs", payload);
      const doesNotExist: boolean = state.value.peers.find(
        (peerID: string) => peerID === payload 
      ) == null && payload !== state.value.id
      if(doesNotExist) {
        state.value.peers = [...state.value.peers, ...payload]
        const peers = state.value.peers;
        const id = state.value.id;
        payload.forEach((peerID: string) => {
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

export const setIDAsync = (dispatch: any) => {
  peer.on("open", (id: string) => {
    console.log("My peer ID is: " + id);
    dispatch(setID(id));
  });

  peer.on('connection', function(conn: any) { 
    // Receive messages
    conn.on('data', function(data: any) {
      const parsedPeers = JSON.parse(data)
      dispatch(addMultiPlePeerIDs(parsedPeers))
    });
  });
}

export const setAnswerResponse = (mediastream: any) => {
  peer.on('call', function(call: any) {
    // Answer the call, providing our mediaStream
    call.answer(mediastream);
  });
}

export const callPeer = (dispatch: any, peerID: string, stream: any) => {
  const call = peer.call(peerID, stream)
  console.log("CALLING PEER", peerID);
  call.on('stream', function(remoteStream: any) {
    console.log("Got Stream", stream)
    dispatch(setRemoteMediaStream(remoteStream));
    dispatch(addPeerID(peerID));
  })
}

export const shareMyParticipantsAndI = (peerID: string, peers: Array<string>, myPeer: string, dispatch: any) => {
  const conn = peer.connect(peerID);

  conn.on('open', function() {
    // Receive messages
    conn.on('data', function(data: any) {
      dispatch(addMultiPlePeerIDs(JSON.parse(data)));
    });
  
    // Send messages
    conn.send(JSON.stringify([...peers, myPeer]));
  });
}

export default myPeerSlice.reducer
