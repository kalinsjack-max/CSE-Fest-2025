import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Download,
  CreditCard,
  User,
  ArrowRight,
  Smartphone,
  Database,
  Lock,
  RefreshCw,
  LogIn,
  Search,
  Key,
} from "lucide-react";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

// --- FIREBASE CONFIGURATION & SETUP ---
const firebaseConfig = {
  apiKey: "AIzaSyDQlFIpnxl2qb3ylsRGQM2aQ_mPkS7yvtk",
  authDomain: "csefest2025-fdd67.firebaseapp.com",
  projectId: "csefest2025-fdd67",
  storageBucket: "csefest2025-fdd67.firebasestorage.app",
  messagingSenderId: "126006601422",
  appId: "1:126006601422:web:7bff8faeef4d1e9c1bd29f",
  measurementId: "G-61KN6P98LB",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
// Use a static app ID since we are using a custom Firebase project
const appId = "cse-fest-2025";

// --- HELPER COMPONENTS ---

const QRCode = ({ data }) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
    data
  )}`;
  return (
    <img
      src={qrUrl}
      alt="Ticket QR"
      className="w-32 h-32 border-4 border-white rounded-lg"
    />
  );
};

const Spinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

// --- VIEW COMPONENTS ---

const LandingView = ({ onStart, onLogin, onAdmin }) => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black z-0"></div>
    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"></div>

    <div className="z-10 max-w-2xl animate-fade-in-up">
      <span className="inline-block py-1 px-3 rounded-full bg-purple-500/30 border border-purple-400 text-purple-200 text-sm font-semibold mb-4">
        Gono University • CSE Department
      </span>
      <h1 className="text-5xl md:text-7xl font-black text-white mb-2 tracking-tighter">
        CSE FEST{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
          2025
        </span>
      </h1>
      <p className="text-gray-300 text-lg md:text-xl mb-8">
        Celebrating innovation and unity. Join us for the biggest event of the
        year.
        <br />
        <span className="text-purple-300 text-sm font-bold mt-2 block">
          Open for Batches 33rd to 41st
        </span>
      </p>

      <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
        <button
          onClick={onStart}
          className="group bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-cyan-500/30 transition-all transform hover:scale-105 flex items-center gap-2"
        >
          Get Your Ticket
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={onLogin}
          className="group bg-slate-800 border border-slate-600 hover:bg-slate-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
        >
          <LogIn className="w-5 h-5" /> Student Login
        </button>
      </div>

      <button
        onClick={onAdmin}
        className="mt-12 text-slate-500 hover:text-slate-300 text-xs flex items-center gap-1 mx-auto transition-colors"
      >
        <Lock className="w-3 h-3" /> Admin Access
      </button>
    </div>
  </div>
);

const StudentLoginView = ({ onBack, onLoginSuccess }) => {
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const q = query(
        collection(db, "artifacts", appId, "public", "data", "registrations"),
        where("idNumber", "==", searchId.trim())
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError("No registration found with this University ID.");
      } else {
        const userData = snapshot.docs[0].data();
        onLoginSuccess(userData);
      }
    } catch (err) {
      console.error(err);
      setError("Error checking database. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-slate-900 p-6 border-b border-slate-700 flex items-center gap-3">
          <LogIn className="text-purple-400 w-6 h-6" />
          <h2 className="text-xl font-bold text-white">Student Login</h2>
        </div>
        <form onSubmit={handleLogin} className="p-6 space-y-6">
          <p className="text-slate-300 text-sm">
            Enter your University ID to retrieve your ticket.
          </p>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              University ID
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
              <input
                required
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="e.g. CSE-0380123"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 p-3 rounded border border-red-800">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600 text-white font-bold py-3 rounded-lg transition-colors flex justify-center"
          >
            {loading ? <Spinner /> : "Find Ticket"}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="w-full text-slate-400 text-sm hover:text-white mt-2"
          >
            Back to Home
          </button>
        </form>
      </div>
    </div>
  );
};

const FormView = ({
  formData,
  handleInputChange,
  onSubmit,
  onCancel,
  batches,
  loading,
}) => (
  <div className="min-h-screen bg-slate-900 py-12 px-4 flex items-center justify-center">
    <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
      <div className="bg-slate-900 p-6 border-b border-slate-700 flex items-center gap-3">
        <User className="text-cyan-400 w-6 h-6" />
        <h2 className="text-xl font-bold text-white">Student Registration</h2>
      </div>
      <form onSubmit={onSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Full Name
          </label>
          <input
            required
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            placeholder="e.g. Md. Rahim Uddin"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Roll Number
            </label>
            <input
              required
              type="number"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleInputChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              placeholder="e.g. 120"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Batch
            </label>
            <select
              name="batch"
              value={formData.batch}
              onChange={handleInputChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            >
              {batches.map((b) => (
                <option key={b} value={b}>
                  {b}th Batch
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            University ID
          </label>
          <input
            required
            type="text"
            name="idNumber"
            value={formData.idNumber}
            onChange={handleInputChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            placeholder="e.g. CSE-0380123"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 text-white font-bold py-3 rounded-lg transition-colors flex justify-center"
        >
          {loading ? <Spinner /> : "Proceed to Payment"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full text-slate-400 text-sm hover:text-white mt-2"
        >
          Cancel
        </button>
      </form>
    </div>
  </div>
);

const PaymentView = ({
  formData,
  handleInputChange,
  setFormData,
  onSubmit,
  onBack,
  loading,
}) => (
  <div className="min-h-screen bg-slate-900 py-12 px-4 flex items-center justify-center">
    <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
      <div className="bg-slate-900 p-6 border-b border-slate-700 flex items-center gap-3">
        <CreditCard className="text-green-400 w-6 h-6" />
        <h2 className="text-xl font-bold text-white">Manual Payment</h2>
      </div>
      <form onSubmit={onSubmit} className="p-6 space-y-6">
        <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4 text-center">
          <p className="text-slate-300 text-sm mb-1">Total Amount to Pay</p>
          <p className="text-3xl font-bold text-white">৳ 650.00</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-slate-400">1. Select Payment Method:</p>
          <div className="grid grid-cols-3 gap-2">
            {["bkash", "nagad", "rocket"].map((method) => (
              <button
                key={method}
                type="button"
                onClick={() =>
                  setFormData((p) => ({ ...p, paymentMethod: method }))
                }
                className={`py-2 px-1 rounded capitalize font-bold border-2 transition-all ${
                  formData.paymentMethod === method
                    ? "bg-pink-600 border-pink-400 text-white"
                    : "bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500"
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-700/50 p-4 rounded text-sm text-slate-300">
          <p className="mb-2">2. Send Money / Cash In to:</p>
          <p className="text-xl font-mono font-bold text-white tracking-wider flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            01700-000000
          </p>
          <p className="text-xs text-slate-400 mt-1">(Personal Number)</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              3. Sender Number
            </label>
            <input
              required
              type="text"
              name="senderPhone"
              value={formData.senderPhone}
              onChange={handleInputChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="017XXXXXXXX"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              4. Transaction ID (TrxID)
            </label>
            <input
              required
              type="text"
              name="trxId"
              value={formData.trxId}
              onChange={handleInputChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="e.g. 9H7G5D3..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-500 disabled:bg-green-800 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <Spinner />
          ) : (
            <>
              Verify & Register <CheckCircle className="w-4 h-4" />
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="w-full text-slate-400 text-sm hover:text-white mt-2"
        >
          Back
        </button>
      </form>
    </div>
  </div>
);

const TicketView = ({ formData, onReset, onPrint }) => (
  <div className="min-h-screen bg-slate-900 py-8 px-4 flex flex-col items-center justify-center">
    <div className="mb-8 text-center animate-bounce print:hidden">
      <h2 className="text-2xl font-bold text-white mb-2">Entry Pass</h2>
      <p className="text-slate-400">Present this at the gate.</p>
    </div>

    {/* Ticket Layout */}
    <div
      id="ticket-area"
      className="w-full max-w-3xl bg-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-slate-700 print:shadow-none print:border-black"
    >
      {/* Left Side (Main Info) */}
      <div className="flex-1 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-purple-600 blur-3xl opacity-20 rounded-full print:hidden"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-cyan-600 blur-3xl opacity-20 rounded-full print:hidden"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-purple-400 font-bold tracking-wider text-sm uppercase print:text-black">
                Gono University
              </h3>
              <h1 className="text-4xl font-black text-white mt-1 print:text-black">
                CSE FEST{" "}
                <span className="text-cyan-400 print:text-black">2025</span>
              </h1>
            </div>
            <div className="bg-slate-700/50 border border-slate-600 px-3 py-1 rounded text-xs text-slate-300 print:border-black print:text-black print:bg-transparent">
              OFFICIAL ENTRY PASS
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-left">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider print:text-gray-600">
                Name
              </p>
              <p className="text-xl font-bold text-white truncate print:text-black">
                {formData.fullName}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider print:text-gray-600">
                Batch
              </p>
              <p className="text-xl font-bold text-white print:text-black">
                {formData.batch}th Batch
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider print:text-gray-600">
                Roll Number
              </p>
              <p className="text-lg font-semibold text-slate-200 print:text-black">
                {formData.rollNumber}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider print:text-gray-600">
                ID Number
              </p>
              <p className="text-lg font-semibold text-slate-200 print:text-black">
                {formData.idNumber}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-slate-400 uppercase tracking-wider print:text-gray-600">
                Status
              </p>
              <p className="text-green-400 font-bold flex items-center gap-1 print:text-black">
                <CheckCircle className="w-4 h-4" /> PAID (৳650) via{" "}
                {formData.paymentMethod}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side (QR & Stub) */}
      <div className="bg-slate-900 md:w-64 p-8 flex flex-col items-center justify-center relative border-t-2 md:border-t-0 md:border-l-2 border-dashed border-slate-600 print:bg-white print:border-black">
        <div className="hidden md:block absolute -left-3 top-1/2 -mt-3 w-6 h-6 rounded-full bg-slate-900 print:bg-white"></div>

        <QRCode data={`${formData.idNumber}-${formData.trxId}`} />

        <p className="text-slate-500 text-xs mt-4 text-center print:text-black">
          Scan at Gate
        </p>
        <p className="text-slate-600 text-[10px] mt-1 font-mono print:text-black">
          TRX: {formData.trxId}
        </p>
      </div>
    </div>

    <div className="mt-8 flex gap-4 print:hidden">
      <button
        onClick={onPrint}
        className="bg-white text-slate-900 hover:bg-slate-200 font-bold py-3 px-6 rounded-full flex items-center gap-2 shadow-lg transition-all"
      >
        <Download className="w-5 h-5" /> Download / Print Ticket
      </button>
      <button
        onClick={onReset}
        className="bg-slate-700 text-white hover:bg-slate-600 font-bold py-3 px-6 rounded-full transition-all"
      >
        Home
      </button>
    </div>

    <style>{`
      @media print {
        body * { visibility: hidden; }
        #ticket-area, #ticket-area * { visibility: visible; }
        #ticket-area { 
          position: absolute; 
          left: 50%; 
          top: 50%; 
          transform: translate(-50%, -50%); 
          width: 100% !important; 
          margin: 0; 
          box-shadow: none; 
          border: 2px solid black;
          color: black !important;
        }
        -webkit-print-color-adjust: exact; 
        print-color-adjust: exact;
      }
    `}</style>
  </div>
);

const AdminView = ({ onBack, user }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  const handleAdminLogin = (e) => {
    e.preventDefault();
    // HARDCODED PASSWORD for simple security
    if (password === "CSE2025") {
      setIsAuthenticated(true);
      fetchData();
    } else {
      alert("Incorrect Admin Password");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "artifacts", appId, "public", "data", "registrations")
      );
      const querySnapshot = await getDocs(q);
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      items.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
      setData(items);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 w-full max-w-md">
          <div className="flex items-center gap-3 mb-6 text-white">
            <Lock className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-bold">Admin Security</h2>
          </div>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Admin Password
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                  placeholder="Enter Password"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg"
            >
              Access Dashboard
            </button>
            <button
              type="button"
              onClick={onBack}
              className="w-full text-slate-400 text-sm mt-2"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Database className="text-purple-400" /> Admin Dashboard
          </h2>
          <button onClick={onBack} className="text-slate-400 hover:text-white">
            Exit Admin
          </button>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between">
            <span className="text-slate-300 font-bold">
              Total Registrations: {data.length}
            </span>
            <button
              onClick={fetchData}
              className="text-cyan-400 flex items-center gap-1 text-sm"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="p-4">Time</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">ID / Roll</th>
                  <th className="p-4">Batch</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">TrxID / Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center">
                      Loading data...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500">
                      No registrations yet.
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="p-4 whitespace-nowrap text-slate-500">
                        {item.timestamp
                          ? new Date(
                              item.timestamp.seconds * 1000
                            ).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="p-4 font-medium text-white">
                        {item.fullName}
                      </td>
                      <td className="p-4">
                        <div className="text-white">{item.idNumber}</div>
                        <div className="text-xs text-slate-500">
                          Roll: {item.rollNumber}
                        </div>
                      </td>
                      <td className="p-4">{item.batch}th</td>
                      <td className="p-4">
                        <span className="bg-green-900/50 text-green-400 border border-green-700/50 px-2 py-1 rounded text-xs capitalize">
                          {item.paymentMethod}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-xs">
                        <div className="text-white">{item.trxId}</div>
                        <div className="text-slate-500">{item.senderPhone}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [step, setStep] = useState("landing");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    rollNumber: "",
    idNumber: "",
    batch: "38",
    paymentMethod: "bkash",
    trxId: "",
    senderPhone: "",
  });

  const batches = Array.from({ length: 9 }, (_, i) => 33 + i);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Fix for Auth Token Mismatch:
        // Since we are using a custom config, we ignore the __initial_auth_token
        // and use anonymous auth directly for this project.
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Auth failed", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!user) return;

    try {
      const q = query(
        collection(db, "artifacts", appId, "public", "data", "registrations"),
        where("idNumber", "==", formData.idNumber)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        alert(
          "This Student ID is already registered! Please Login to download your ticket."
        );
        setStep("login");
        setLoading(false);
        return;
      }
      setStep("payment");
    } catch (err) {
      console.error(err);
      setStep("payment");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!user) return;

    try {
      await addDoc(
        collection(db, "artifacts", appId, "public", "data", "registrations"),
        {
          ...formData,
          timestamp: serverTimestamp(),
          userId: user.uid,
          status: "pending_verification",
        }
      );
      setStep("ticket");
    } catch (err) {
      console.error("Error saving document: ", err);
      alert("Failed to save registration.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (userData) => {
    setFormData(userData);
    setStep("ticket");
  };

  const printTicket = () => window.print();

  const resetForm = () => {
    setFormData({
      fullName: "",
      rollNumber: "",
      idNumber: "",
      batch: "38",
      paymentMethod: "bkash",
      trxId: "",
      senderPhone: "",
    });
    setStep("landing");
  };

  return (
    <div className="font-sans bg-slate-900 text-slate-200 min-h-screen selection:bg-purple-500 selection:text-white">
      {step === "landing" && (
        <LandingView
          onStart={() => setStep("form")}
          onLogin={() => setStep("login")}
          onAdmin={() => setStep("admin")}
        />
      )}

      {step === "login" && (
        <StudentLoginView
          onBack={() => setStep("landing")}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {step === "form" && (
        <FormView
          formData={formData}
          handleInputChange={handleInputChange}
          onSubmit={handleFormSubmit}
          onCancel={() => setStep("landing")}
          batches={batches}
          loading={loading}
        />
      )}

      {step === "payment" && (
        <PaymentView
          formData={formData}
          handleInputChange={handleInputChange}
          setFormData={setFormData}
          onSubmit={handlePaymentSubmit}
          onBack={() => setStep("form")}
          loading={loading}
        />
      )}

      {step === "ticket" && (
        <TicketView
          formData={formData}
          onReset={resetForm}
          onPrint={printTicket}
        />
      )}

      {step === "admin" && (
        <AdminView onBack={() => setStep("landing")} user={user} />
      )}
    </div>
  );
}
