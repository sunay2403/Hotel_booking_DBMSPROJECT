import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HotelBookingSystem from "./pages/Hotel_booking";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HotelBookingSystem />} />
      </Routes>
    </Router>
  );
}