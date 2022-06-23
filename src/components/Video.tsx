import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { increment, decrement } from "../store/counter";
import { setMediaStream, callPeer, setAnswerResponse, shareMyParticipantsAndI } from '../store/myPeer';
// @ts-ignore
import Phone from '../assets/phone.svg?component';
export function Video() {
  const count = useSelector((state: any) => state.counter.value)
  const remoteStreams = useSelector((state: any) => state.myPeer.value.remoteStreams)
  const peers = useSelector((state: any) => state.myPeer.value.peers)
  
  const dispatch = useDispatch()

  const [permission, setPermision] = React.useState(false)
  const [videoStream, setVideoStream] = React.useState(null)
  const [callerID, setCallerID] = React.useState("")
  
  const myPeer = useSelector((state: any) => state.myPeer.value.id)
  const video: any = useRef(null)
  const remoteVideos: any = useRef([])
  remoteVideos.current = []

  const giveMicAndCamAccess = async () => {
    const stream: any = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setPermision(true)
    setVideoStream(stream)
    dispatch(setMediaStream(stream))
  }

  const callSomeone = () => {
    callPeer(dispatch, callerID, videoStream)
  }

  const addToRefs = (el: any) => {
    if(el && !remoteVideos.current.includes(el)) {
      remoteVideos.current.push(el)
    }
    console.log(remoteVideos)
  }


  useEffect(() => {
    if(permission) { 
      video.current.srcObject = videoStream
      video.current.muted = true
      video.current.play()
      setAnswerResponse(videoStream)
    }

    if(remoteStreams.length >= 1 ) {
      console.log("remoteVideos", remoteVideos)
      console.log("remoteStreams", remoteStreams)
      remoteVideos.current.forEach((video: any, index: number) => {
        video.srcObject = remoteStreams[index]
        video.play()
      })

      shareMyParticipantsAndI(callerID, peers, myPeer, dispatch)
    }
  },[permission, remoteStreams])

  useEffect(() => {
    peers.forEach((peer: string) => {
      console.log("peer", peer)
      callPeer(dispatch, peer, videoStream)
    })
  }, [peers])

  if(!permission) {
    return (
      <>
        <h3>Es necesario tener acceso a la camara y microfono</h3>
        <button
          className="ask-permisions"
          onClick={giveMicAndCamAccess}
        >Click aqui para dar acceso</button>
      </>
    )
  }

  return (
    <>
      <h1>Tu camara</h1>
      <div className="my-cam">
        <video ref={video} ></video>
        <p className="text-selection-none">Comparte esto: <span className="text-selection-all">{myPeer}</span></p>
        <div className="call-section">
          <input className="dial-number" type="text" value={callerID} onChange={({target: {value}}) => setCallerID(value)}/>
          <button className="dial-button" onClick={callSomeone}>
            <Phone className="icon" />
          </button>
        </div>
      </div>
      <div className="remote-cam">
        {remoteStreams.map((remoteStream: any, index: any) => (
          <video controls key={index} ref={addToRefs}></video>
        ))}
      </div>
    </>
  )
}
