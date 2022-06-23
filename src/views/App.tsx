import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Video } from '../components/Video';
import { setIDAsync } from '../store/myPeer';

export function App() {
  const dispatch = useDispatch()
  useEffect(() => {
    setIDAsync(dispatch)
  }, [])
  return (
    <>
      <h1 className="red">Bienvenidos a mi Discurso de bodas</h1>
      <Video />
    </>
  )
}