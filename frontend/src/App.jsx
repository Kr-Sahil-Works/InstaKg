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
