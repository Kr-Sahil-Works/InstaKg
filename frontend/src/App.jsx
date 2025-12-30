import React, { useEffect } from "react";
import { Routes, Route, Navigate} from 'react-router-dom';
import  {Toaster} from 'react-hot-toast';

import Home from "./pages/home/Home.jsx";
import Login from "./pages/login/Login.jsx";
import Signup from "./pages/signup/Signup.jsx";
import { useAuthContext } from "./context/AuthContext.jsx";

const walls = [
  "/bg1.jpg",
  "/bg2.jpg",
  "/bg3.jpg",
  "/bg4.jpg",
  "/bg5.jpg",
  "/bg6.jpg",
  "/bg7.jpg",
  "/bg8.jpg",
  "/bg9.jpg",
  "/bg10.jpg",
  "/bg11.jpg",
  "/bg12.jpg",
  "/bg13.jpg",
  "/bg14.jpg",
  "/bg15.jpg",
  "/bg16.jpg",
  "/bg17.jpg",
  "/bg18.jpg",
  "/bg19.jpg",
  "/bg20.jpg",
  "/bg21.jpg",
  "/bg22.jpg",
  "/bg23.jpg",
  "/bg24.jpg",
  "/bg25.jpg",
  "/bg26.jpg",
];


function App() {
  
  useEffect(() => {
    const randomBg = walls[Math.floor(Math.random() * walls.length)];
    document.body.style.backgroundImage = `url(${randomBg})`;
  }, []);

  const {authUser} = useAuthContext();
  return (
    <div className="p-4 h-screen flex items-center justify-center">
      <Routes>
       <Route path='/' element={authUser ? <Home /> : <Navigate to={"/login"} />} />
				<Route path='/login' element={authUser ? <Navigate to='/' /> : <Login />} />
				<Route path='/signup' element={authUser ? <Navigate to='/' /> : <Signup />} />
      </Routes>
      <Toaster/>
    </div>
  );
}

export default App;
