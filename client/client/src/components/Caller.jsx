import React, { useEffect, useRef, useState } from "react";
import { Peer } from "https://esm.sh/peerjs@1.5.4?bundle-deps";

const Caller = ({ friendOnline, Socket, Email }) => {
  const remoteVedioref = useRef(null);
  const [call, setCall] = useState(false);
  const [CallConnected, setCallConnected] = useState(false);
  const [CallReceived, setCallReceived] = useState(false);
  const localvideoref = useRef(null);
  const [peerId, setPeerId] = useState(null);
  const [remotePeerId, setRemotePeerId] = useState(null);

  useEffect(()=>{
    
  },[])
  useEffect(() => {
    console.log("hhh1")
    if (Socket) {
        console.log("hhh")
      
      Socket.on("callreceived", (data) => {
        console.log("call received", data);
        setCall(true);
        setCallReceived(true);
        setRemotePeerId(data.peerId);
      });
      console.log(call,CallReceived)
    }
    return () => {
      if (Socket) {
       
        Socket.off("callreceived");
      }
    };
  }, [Socket]);
  const handleCallAccepted = async () => {
    try {
      setCallReceived(false);
      const peer = new Peer();
      
     
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      
      if (localvideoref.current) {
        localvideoref.current.srcObject = stream;
      }
  

      const call = peer.call(remotePeerId, stream);
      
      // Handle remote stream
      call.on("stream", (remoteStream) => {
        setCallConnected(true);
        if (remoteVedioref.current) {
          remoteVedioref.current.srcObject = remoteStream;
          remoteVedioref.current.play(); // Ensure video plays
        }
      });
  
    } catch (error) {
      console.error("Call acceptance failed:", error);
      setCallReceived(false);
    }
  };
  
  const handleCall = async (items) => {
    try {
      setCall(true);
      const peer = new Peer();
  
      // Get local stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      console.log(stream)
  
      // Set local video
      if (localvideoref.current) {
        localvideoref.current.srcObject = stream;
      }
  
     
      peer.on("open", (id) => {
        setPeerId(id);
        Socket.emit("makeacall", { RemoteEmail: items.Email, peerId: id });
      });
  
     
      peer.on("call", (incomingCall) => {
        setCallConnected(true);
        incomingCall.answer(stream);
        
        incomingCall.on("stream", (remoteStream) => {
          if (remoteVedioref.current) {
            remoteVedioref.current.srcObject = remoteStream;
            remoteVedioref.current.play(); 
          }
        });
      });
  
    } catch (error) {
      console.error("Call initiation failed:", error);
      setCall(false);
    }
  };
  return (
    <div className="w-full h-[85vh] mt-4 grid grid-cols-2 max-[400px]:grid-cols-1">
      <div className="h-[85vh] w-[340px] overflow-y-auto">
        {friendOnline.map((items, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-1 w-full flex items-center justify-between mb-3 "
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={items.profilephoto}
                  className="w-8 h-8 rounded-full object-cover border-2 border-blue-100"
                  alt="Profile"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-800 font-medium">{items.Name}</span>
                <span className="text-xs text-green-600">Online</span>
              </div>
            </div>
            <div className="flex button gap-2">
              <div
                className="text-[1.5rem]  rounded-full "
                onClick={() => {
                  handleCall(items);
                }}
              >
                🎥
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="h-full max-[400px]:hidden relative">
        {call && (
          <div>
            {CallConnected && (
              <video className="w-full h-[85vh]" autoPlay ref={remoteVedioref} />
            )}
            {!CallConnected && !CallReceived && (
              <div className="w-full h-full flex justify-center items-center">
                <p className="text-white">We are Connecting You....</p>
              </div>
            )}
            {CallReceived && (
              <div className="h-[85vh] w-full flex justify-between items-center">
                <div className="px-2 py-3 h-3 bg-green-500" onClick={handleCallAccepted}>Receive</div>
              </div>
            )}
            <video
              className="w-33 h-33 border-2 border-blue-400 absolute  right-0 bottom-0 object-cover"
              muted
              draggable
              autoPlay
              ref={localvideoref}
              onDrag={(e) => {
                console.log(e);
              }}
            ></video>
          </div>
        )}
      </div>
    </div>
  );
};

export default Caller;
