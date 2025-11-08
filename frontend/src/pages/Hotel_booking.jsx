import React, { useState } from 'react';
import { Calendar, Users, Search, CheckCircle, MapPin, Phone, Mail, CreditCard, ArrowRight, Sparkles, Star, Wifi, Coffee, Tv } from 'lucide-react';

export default function HotelBookingSystem() {
  const [step, setStep] = useState(1);
  const [searchData, setSearchData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1
  });
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    mobile: '',
    aadhar: '',
    street: '',
    city: '',
    state: '',
    country: ''
  });

  const rooms = [
    { 
      id: 1, 
      number: '101', 
      category: 'Economy', 
      price: 1500, 
      capacity: 2, 
      status: 'available',
      amenities: ['WiFi', 'TV', 'AC'],
      description: 'Cozy room perfect for solo travelers or couples'
    },
    { 
      id: 2, 
      number: '201', 
      category: 'Deluxe', 
      price: 2500, 
      capacity: 2, 
      status: 'available',
      amenities: ['WiFi', 'TV', 'AC', 'Mini Bar'],
      description: 'Spacious room with premium amenities'
    },
    { 
      id: 3, 
      number: '301', 
      category: 'Suite', 
      price: 4000, 
      capacity: 4, 
      status: 'available',
      amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony'],
      description: 'Luxurious suite with separate living area'
    },
    { 
      id: 4, 
      number: '401', 
      category: 'Presidential', 
      price: 8000, 
      capacity: 4, 
      status: 'available',
      amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Jacuzzi'],
      description: 'Ultimate luxury experience with panoramic views'
    }
  ];

  const handleSearch = () => {
    if (searchData.checkIn && searchData.checkOut) {
      setStep(2);
    } else {
      alert('Please select check-in and check-out dates');
    }
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setStep(3);
  };

  const handleBooking = () => {
    if (customerData.name && customerData.email && customerData.mobile && customerData.aadhar) {
      setStep(4);
    } else {
      alert('Please fill in all required fields');
    }
  };

  const calculateTotal = () => {
    if (!selectedRoom || !searchData.checkIn || !searchData.checkOut) return 0;
    const days = Math.ceil((new Date(searchData.checkOut) - new Date(searchData.checkIn)) / (1000 * 60 * 60 * 24));
    return days * selectedRoom.price;
  };

  const calculateNights = () => {
    if (!searchData.checkIn || !searchData.checkOut) return 0;
    return Math.ceil((new Date(searchData.checkOut) - new Date(searchData.checkIn)) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Luxury Hotel</h1>
          </div>
          <p className="text-blue-100 text-lg">Experience comfort and elegance in every stay</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Search', icon: Search },
              { num: 2, label: 'Select Room', icon: Star },
              { num: 3, label: 'Guest Details', icon: Users },
              { num: 4, label: 'Confirmation', icon: CheckCircle }
            ].map(({ num, label, icon: Icon }, idx) => (
              <div key={num} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    step >= num 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > num ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${step >= num ? 'text-blue-600' : 'text-gray-500'}`}>
                    {label}
                  </span>
                </div>
                {idx < 3 && (
                  <div className={`flex-1 h-0.5 mx-2 ${step > num ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Step 1: Search */}
        {step === 1 && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white">
                <h2 className="text-3xl font-bold mb-2">Find Your Perfect Stay</h2>
                <p className="text-blue-100">Search for available rooms and start your journey</p>
              </div>
              
              <div className="p-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        Check-in Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        value={searchData.checkIn}
                        onChange={(e) => setSearchData({...searchData, checkIn: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        Check-out Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        value={searchData.checkOut}
                        onChange={(e) => setSearchData({...searchData, checkOut: e.target.value})}
                        min={searchData.checkIn}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Users className="w-4 h-4 text-blue-600" />
                      Number of Guests
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="4"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      value={searchData.guests}
                      onChange={(e) => setSearchData({...searchData, guests: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <button 
                    onClick={handleSearch} 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    Search Available Rooms
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Room Selection */}
        {step === 2 && (
          <div>
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Room</h2>
              <p className="text-gray-600">
                {calculateNights()} night{calculateNights() !== 1 ? 's' : ''} • {searchData.guests} guest{searchData.guests !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.filter(room => room.capacity >= searchData.guests).map(room => (
                <div key={room.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className={`h-2 ${
                    room.category === 'Presidential' ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                    room.category === 'Suite' ? 'bg-gradient-to-r from-purple-400 to-pink-500' :
                    room.category === 'Deluxe' ? 'bg-gradient-to-r from-blue-400 to-cyan-500' :
                    'bg-gradient-to-r from-green-400 to-teal-500'
                  }`} />
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                          <h3 className="text-2xl font-bold text-gray-800">{room.category}</h3>
                        </div>
                        <p className="text-gray-500 text-sm">Room {room.number}</p>
                      </div>
                      <div className="bg-green-100 px-3 py-1 rounded-full">
                        <span className="text-green-700 text-xs font-semibold">Available</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">{room.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {room.amenities.map((amenity, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                          {amenity}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 pb-4 border-b">
                      <Users className="w-4 h-4" />
                      <span>Up to {room.capacity} guests</span>
                    </div>
                    
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <p className="text-3xl font-bold text-blue-600">₹{room.price}</p>
                        <p className="text-xs text-gray-500">per night</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-800">₹{room.price * calculateNights()}</p>
                        <p className="text-xs text-gray-500">total</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleRoomSelect(room)}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2"
                    >
                      Select Room
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <button onClick={() => setStep(1)} className="text-blue-600 hover:text-blue-700 font-medium">
                ← Back to Search
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Customer Details */}
        {step === 3 && selectedRoom && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white">
                <h2 className="text-3xl font-bold mb-4">Guest Information</h2>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{selectedRoom.category} - Room {selectedRoom.number}</span>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">₹{selectedRoom.price}/night</span>
                  </div>
                  <div className="flex gap-4 text-sm text-blue-100">
                    <span>{searchData.checkIn}</span>
                    <span>→</span>
                    <span>{searchData.checkOut}</span>
                    <span>•</span>
                    <span>{calculateNights()} night{calculateNights() !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Users className="w-4 h-4 text-blue-600" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        value={customerData.name}
                        onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Mail className="w-4 h-4 text-blue-600" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        value={customerData.email}
                        onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Phone className="w-4 h-4 text-blue-600" />
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        placeholder="1234567890"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        value={customerData.mobile}
                        onChange={(e) => setCustomerData({...customerData, mobile: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        Aadhar Number *
                      </label>
                      <input
                        type="text"
                        placeholder="123456789012"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        value={customerData.aadhar}
                        onChange={(e) => setCustomerData({...customerData, aadhar: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      Street Address *
                    </label>
                    <input
                      type="text"
                      placeholder="123 Main Street"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      value={customerData.street}
                      onChange={(e) => setCustomerData({...customerData, street: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">City *</label>
                      <input
                        type="text"
                        placeholder="Mumbai"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        value={customerData.city}
                        onChange={(e) => setCustomerData({...customerData, city: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">State *</label>
                      <input
                        type="text"
                        placeholder="Maharashtra"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        value={customerData.state}
                        onChange={(e) => setCustomerData({...customerData, state: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Country *</label>
                      <input
                        type="text"
                        placeholder="India"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        value={customerData.country}
                        onChange={(e) => setCustomerData({...customerData, country: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleBooking} 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 shadow-lg"
                  >
                    Continue to Confirmation
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <button onClick={() => setStep(2)} className="text-blue-600 hover:text-blue-700 font-medium">
                ← Back to Room Selection
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && selectedRoom && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center">
                <CheckCircle className="w-20 h-20 mx-auto mb-4 animate-bounce" />
                <h2 className="text-4xl font-bold mb-2">Booking Confirmed!</h2>
                <p className="text-green-100 text-lg">Your reservation has been successfully created</p>
              </div>
              
              <div className="p-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Booking ID</p>
                      <p className="font-bold text-lg text-blue-600">BK{Math.floor(Math.random() * 100000)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Guest Name</p>
                      <p className="font-semibold text-gray-800">{customerData.name}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <Star className="w-10 h-10 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{selectedRoom.category} - Room {selectedRoom.number}</p>
                      <p className="text-sm text-gray-600">₹{selectedRoom.price} per night</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <Calendar className="w-10 h-10 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">Check-in: {searchData.checkIn}</p>
                      <p className="font-semibold text-gray-800">Check-out: {searchData.checkOut}</p>
                      <p className="text-sm text-gray-600">{calculateNights()} night{calculateNights() !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl">
                    <CreditCard className="w-10 h-10 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm opacity-90">Total Amount</p>
                      <p className="text-3xl font-bold">₹{calculateTotal()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5 mb-6">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-amber-600" />
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 mb-1">Payment Information</p>
                      <p className="text-sm text-gray-700 mb-2">Payment can be made via Cash or Online at check-in</p>
                      <p className="text-sm text-gray-600">
                        <Mail className="w-4 h-4 inline mr-1" />
                        Confirmation email sent to {customerData.email}
                      </p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setStep(1);
                    setSelectedRoom(null);
                    setCustomerData({name: '', email: '', mobile: '', aadhar: '', street: '', city: '', state: '', country: ''});
                    setSearchData({checkIn: '', checkOut: '', guests: 1});
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg"
                >
                  Make Another Booking
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="bg-gray-900 text-white mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-400">© 2024 Luxury Hotel. Experience the finest hospitality.</p>
        </div>
      </div>
    </div>
  );
}