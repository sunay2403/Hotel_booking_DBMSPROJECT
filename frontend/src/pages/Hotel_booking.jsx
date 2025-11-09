import React, { useState } from "react";
import {
  Calendar,
  Users,
  Search,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  ArrowRight,
  Sparkles,
  Star,
} from "lucide-react";

// 🟦 Backend API URL
const API_BASE_URL = "http://localhost:5000/api";

export default function HotelBookingSystem() {
  const [step, setStep] = useState(1);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(false);

  const [searchData, setSearchData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
  });

  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    mobile: "",
    aadhar: "",
    street: "",
    city: "",
    state: "",
    country: "",
  });

  // 🟦 Fetch available rooms from backend
  const handleSearch = async () => {
    if (searchData.checkIn && searchData.checkOut) {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/rooms/available?minCapacity=${searchData.guests}`
        );
        const data = await response.json();

        if (data.success) {
          setRooms(data.rooms);
          setStep(2);
        } else {
          alert("Failed to fetch available rooms");
        }
      } catch (err) {
        console.error("Error:", err);
        alert("Error connecting to backend. Ensure server is running.");
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please select check-in and check-out dates");
    }
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setStep(3);
  };

  // 🟦 Send booking to backend
  const handleBooking = async () => {
    if (
      customerData.name &&
      customerData.email &&
      customerData.mobile &&
      customerData.aadhar
    ) {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/bookings/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: customerData.name,
            email: customerData.email,
            mobile: customerData.mobile,
            aadhar: customerData.aadhar,
            street: customerData.street,
            city: customerData.city,
            state: customerData.state,
            country: customerData.country,
            roomNumber: selectedRoom.roomNumber || selectedRoom.number,
            checkinDate: searchData.checkIn,
            checkoutDate: searchData.checkOut,
          }),
        });

        const data = await response.json();

        if (data.success) {
          alert(`✅ Booking confirmed! Booking ID: ${data.bookingId}`);
          setStep(4);
        } else {
          alert("❌ Booking failed: " + (data.error || "Unknown error"));
        }
      } catch (err) {
        console.error(err);
        alert("Error creating booking. Please check backend connection.");
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please fill in all required fields");
    }
  };

  const calculateNights = () => {
    if (!searchData.checkIn || !searchData.checkOut) return 0;
    return Math.ceil(
      (new Date(searchData.checkOut).getTime() -
        new Date(searchData.checkIn).getTime()) /
        (1000 * 60 * 60 * 24)
    );
  };

  const calculateTotal = () => {
    if (!selectedRoom) return 0;
    return selectedRoom.price * calculateNights();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* ===== HEADER ===== */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Luxury Hotel</h1>
          </div>
          <p className="text-blue-100 text-lg">
            Experience comfort and elegance in every stay
          </p>
        </div>
      </div>

      {/* ===== PROGRESS BAR ===== */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: "Search", icon: Search },
              { num: 2, label: "Select Room", icon: Star },
              { num: 3, label: "Guest Details", icon: Users },
              { num: 4, label: "Confirmation", icon: CheckCircle },
            ].map(({ num, label, icon: Icon }, idx) => (
              <div key={num} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      step >= num
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step > num ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium ${
                      step >= num ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {idx < 3 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      step > num ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Step 1: Search */}
        {step === 1 && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white">
                <h2 className="text-3xl font-bold mb-2">Find Your Perfect Stay</h2>
                <p className="text-blue-100">
                  Search for available rooms and start your journey
                </p>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchData.checkIn}
                      onChange={(e) =>
                        setSearchData({
                          ...searchData,
                          checkIn: e.target.value,
                        })
                      }
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      Check-out Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchData.checkOut}
                      onChange={(e) =>
                        setSearchData({
                          ...searchData,
                          checkOut: e.target.value,
                        })
                      }
                      min={searchData.checkIn}
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Users className="w-4 h-4 text-blue-600" />
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchData.guests}
                    onChange={(e) =>
                      setSearchData({
                        ...searchData,
                        guests: parseInt(e.target.value),
                      })
                    }
                  />
                </div>

                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {loading ? "Searching..." : "Search Available Rooms"}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Room Selection */}
        {step === 2 && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              Choose Your Room
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <div
                  key={room.roomNumber}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition p-6"
                >
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {room.category}
                  </h3>
                  <p className="text-gray-500 mb-3">Room {room.roomNumber}</p>
                  <p className="text-gray-600 mb-4">Capacity: {room.capacity}</p>
                  <p className="text-blue-600 font-bold text-xl mb-4">
                    ₹{room.price}/night
                  </p>
                  <button
                    onClick={() => handleRoomSelect(room)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700"
                  >
                    Select Room
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <button
                onClick={() => setStep(1)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Search
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Guest Details */}
        {step === 3 && selectedRoom && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              Guest Details
            </h2>
            <div className="space-y-4">
              {["name", "email", "mobile", "aadhar"].map((key) => (
                <input
                  key={key}
                  type={key === "email" ? "email" : "text"}
                  placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={customerData[key]}
                  onChange={(e) =>
                    setCustomerData({
                      ...customerData,
                      [key]: e.target.value,
                    })
                  }
                />
              ))}
            </div>

            <button
              onClick={handleBooking}
              disabled={loading}
              className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
            >
              {loading ? "Creating Booking..." : "Confirm Booking"}
            </button>

            <div className="mt-6 text-center">
              <button
                onClick={() => setStep(2)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Room Selection
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
            <CheckCircle className="w-20 h-20 mx-auto text-green-500 mb-4" />
            <h2 className="text-3xl font-bold mb-2 text-gray-800">
              Booking Confirmed!
            </h2>
            <p className="text-gray-600 mb-4">
              Thank you, {customerData.name}! Your stay is confirmed.
            </p>
            <p className="text-blue-600 font-bold text-2xl mb-6">
              Total: ₹{calculateTotal()}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700"
            >
              Make Another Booking
            </button>
          </div>
        )}
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 text-white text-center py-6 mt-12">
        <p className="text-gray-400">
          © 2024 Luxury Hotel. Experience the finest hospitality.
        </p>
      </footer>
    </div>
  );
}
