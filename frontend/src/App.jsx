import React, { useEffect } from "react";
import "./App.css";
import Home from "./pages/home/Home.jsx";

const walls = [
  "/bg1.jpg",
  "/bg2.jpg",
  "/bg3.png",
  "/bg4.png",
  "/bg5.jpg",
  "/bg6.jpg",
  "/bg7.jpg",
  "/bg8.png",
];

function App() {
  useEffect(() => {
    const randomBg = walls[Math.floor(Math.random() * walls.length)];
    document.body.style.backgroundImage = `url(${randomBg})`;
  }, []);

  return (
    <div className="p-4 h-screen flex items-center justify-center">
      <Home/>
    </div>
  );
}

export default App;
