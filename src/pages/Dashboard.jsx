"use client";
import { useEffect, useMemo, useState } from "react";
import { getSales, addSale, undoSale, setAuthToken } from "../services/api";

export default function Dashboard({ setToken }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const drinks = [
    { id: 1, name: "Badam Milk", price: 40, img: "https://www.thespruceeats.com/thmb/aXBZePco3iakbaZyPC4LamgwVEI=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/SES-badam-milk-with-cardamom-1957418-f94ebb8b20b9421ba4688cd7570d36e0.jpg" },
    { id: 2, name: "Pepsi", price: 25, img: "https://images.pexels.com/photos/2775860/pexels-photo-2775860.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { id: 3, name: "Sweet Lassi", price: 30, img: "https://www.indianveggiedelight.com/wp-content/uploads/2023/01/sweet-lassi-recipe-1.jpg" },
    { id: 4, name: "Samosa", price: 30, img: "https://tse4.mm.bing.net/th/id/OIP.fDRUA3TTWZk715DkoyWPqQHaEo" },
    { id: 5, name: "Water Bottle", price: 20, img: "https://images.pexels.com/photos/327090/pexels-photo-327090.jpeg?auto=compress&cs=tinysrgb&w=400" },
  ];

  useEffect(() => {
    const tk = localStorage.getItem("token");
    if (!tk) return (window.location.href = "/login");
    setToken(tk);
    setAuthToken(tk);
    fetchSales(selectedDate);
  }, []);

  const fetchSales = async (date) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getSales(date);
      setSales(data.data || []);
    } catch (e) {
      console.error(e);
      setError("Could not fetch sales");
    } finally {
      setLoading(false);
    }
  };

  const handleSell = async (drink, method) => {
    const newSale = { _id: Math.random(), name: drink.name, price: drink.price, method };
    setSales((prev) => [...prev, newSale]);
    try {
      await addSale(selectedDate, drink.name, drink.price, method);
    } catch (e) {
      console.error(e);
      setSales((prev) => prev.filter((s) => s._id !== newSale._id));
      alert("Failed to add sale");
    }
  };

  const handleUndo = async () => {
    if (!sales.length) return;
    const last = sales[sales.length - 1];
    setSales((prev) => prev.slice(0, -1));
    try {
      await undoSale();
    } catch (e) {
      console.error(e);
      setSales((prev) => [...prev, last]);
      alert("Undo failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuthToken(null);
    setToken(null);
    window.location.href = "/login";
  };

  const { totals, perProduct } = useMemo(() => {
    const summary = { earnings: 0, qty: 0, cash: 0, upi: 0 };
    const productStats = {};
    drinks.forEach((d) => {
      productStats[d.name] = { qty: 0, total: 0, cash: 0, upi: 0 };
    });
    sales.forEach((s) => {
      summary.earnings += s.price;
      summary.qty++;
      s.method === "upi" ? (summary.upi += s.price) : (summary.cash += s.price);
      if (!productStats[s.name]) productStats[s.name] = { qty: 0, total: 0, cash: 0, upi: 0 };
      const p = productStats[s.name];
      p.qty++;
      p.total += s.price;
      s.method === "upi" ? (p.upi += s.price) : (p.cash += s.price);
    });
    return { totals: summary, perProduct: productStats };
  }, [sales]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-6">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md rounded-2xl p-4 md:p-6 mb-6 md:mb-8 shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            Sales Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Track your sales in real-time
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center bg-white rounded-lg shadow-sm p-1">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border-0 focus:ring-2 focus:ring-purple-300 outline-none"
            />
            <button
              onClick={() => fetchSales(selectedDate)}
              className="ml-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-indigo-600 transition-all shadow-md"
            >
              View Sales
            </button>
          </div>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:from-red-600 hover:to-pink-600 transition-all shadow-md flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-2xl p-5 shadow-lg transform hover:scale-105 transition-transform duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-sm">Total Earnings</p>
              <p className="text-2xl font-bold mt-1">₹{totals.earnings}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-purple-100 text-xs mt-3">All-time earnings</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-2xl p-5 shadow-lg transform hover:scale-105 transition-transform duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm">Drinks Sold</p>
              <p className="text-2xl font-bold mt-1">{totals.qty}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2zm10-4a2 2 0 11-4 0 2 2 0 014 0zM6 20h12a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-green-100 text-xs mt-3">Total items sold</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-2xl p-5 shadow-lg transform hover:scale-105 transition-transform duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm">Cash Payments</p>
              <p className="text-2xl font-bold mt-1">₹{totals.cash}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-blue-100 text-xs mt-3">Cash transactions</p>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-2xl p-5 shadow-lg transform hover:scale-105 transition-transform duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-100 text-sm">UPI Payments</p>
              <p className="text-2xl font-bold mt-1">₹{totals.upi}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
          <p className="text-indigo-100 text-xs mt-3">Digital transactions</p>
        </div>
      </section>

      {/* Undo Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={handleUndo}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all flex items-center transform hover:-translate-y-0.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Undo Last Sale
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-md" role="alert">
          <p>{error}</p>
        </div>
      )}

      {/* Drinks Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 md:gap-6">
          {drinks.map((drink) => {
            const stats = perProduct[drink.name];
            return (
              <div
                key={drink.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-5 flex flex-col items-center transform hover:-translate-y-1"
              >
                <div className="relative mb-4">
                  <img
                    src={drink.img}
                    alt={drink.name}
                    className="w-28 h-28 object-cover rounded-full border-4 border-white shadow-md"
                  />
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md border">
                    <span className="font-bold text-gray-800">₹{drink.price}</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{drink.name}</h3>

                <div className="w-full mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-green-50 p-2 rounded-lg border border-green-100">
                    <p className="text-green-600">Cash</p>
                    <p className="font-bold text-green-700">₹{stats.cash}</p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                    <p className="text-blue-600">UPI</p>
                    <p className="font-bold text-blue-700">₹{stats.upi}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 col-span-2 text-center">
                    <div className="flex justify-around">
                      <div>
                        <p className="text-gray-600">Total</p>
                        <p className="font-bold text-gray-800">₹{stats.total}</p>
                      </div>
                      <div className="border-l border-gray-200"></div>
                      <div>
                        <p className="text-gray-600">Qty</p>
                        <p className="font-bold text-purple-700">{stats.qty}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => handleSell(drink, "cash")}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow flex items-center transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Cash
                  </button>
                  <button
                    onClick={() => handleSell(drink, "upi")}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow flex items-center transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    UPI
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}