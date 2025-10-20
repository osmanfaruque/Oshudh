import "./App.css";
import NavBar from "./components/navigation/NavBar";
import Footer from "./components/navigation/Footer";
import { Outlet } from "react-router";

function App() {
  return (
    <>
      <NavBar />
      {/* Offset for fixed navbar height */}
      <div className="pt-16 min-h-[calc(100vh-292px)]">
        <Outlet />
      </div>
      <Footer />
    </>
  );
}

export default App;