import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/home";
import { Chat } from "./pages/chat";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/app" element={<Chat />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
