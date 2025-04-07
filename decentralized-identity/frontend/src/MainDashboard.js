import React, { useState } from "react";
import {
  checkVerification,
  connectWallet,
  getWalletInfo,
} from "./wallet";
import RequestForm from "./RequestForm";

export default function MainDashboard() {
  const [verified, setVerified] = useState(null);
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null); // For storing user data from db.json

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");

  const [showRequestForm, setShowRequestForm] = useState(false); // Request form visibility

  const handleLogin = async () => {
    try {
      setLoading(true);
  
      // Add a small delay to ensure the "Logging in..." message stays visible
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
  
      // Fetch the list of requests from db.json
      const res = await fetch("http://localhost:3001/requests");
      const data = await res.json();
  
      // Find the user by name and DOB
      const user = data.find(
        (req) => req.name.toLowerCase() === name.toLowerCase() && req.dob === dob
      );
  
      if (user) {
        // User found, check verification status
        setAddress(user.address);
        setUserData(user);
  
        const signer = await connectWallet();
        const info = await getWalletInfo(signer);
        setBalance(info.balance);
  
        // Set the verified status
        setVerified(user.verified);
  
        alert("Logged in successfully!");
      } else {
        // If user not found, prompt them to request verification
        console.log("Error: No user found with that name and date of birth.");
        setVerified(false);
        setUserData(null); // Clear any previous user data
        alert("❌ No user found with that name and date of birth. Please request verification.");
  
        // Show the Request Form when user is not found
        setShowRequestForm(true);
      }
  
      setError(""); // Clear any previous error messages
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to log in.");
    } finally {
      setLoading(false);
    }
  };
  

  // Log out function
  const handleLogout = () => {
    setName("");
    setDob("");
    setAddress("");
    setBalance("");
    setVerified(null);
    setUserData(null);
    setError("");
    setDob("");
  };

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#1e1e2f",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        🛡️ Identity Dashboard
      </h1>

      {userData === null ? (
        <div>
          <h2>Login</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            style={{ marginBottom: "1rem" }}
          >
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: "175px", padding: "10px", marginRight: "10px" }}
            />
            <input
              type="text"
              placeholder="Date of Birth (MM//DD/YYYY)"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
              style={{ width: "225px", padding: "10px", marginRight: "10px" }}
            />
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                fontWeight: "bold",
                backgroundColor: "#2c2c3d",
                color: "#fff",
              }}
            >
              {loading ? "⏳ Logging in..." : "Login"}
            </button>
          </form>
          {showRequestForm && (
            <div style={{ marginTop: "2rem" }}>
              <h2>📝 Request Verification</h2>
              <RequestForm />
            </div>
          )}
        </div>
      ) : (
        <>
          <p>
            <strong>Wallet:</strong> {address}
          </p>
          <p>
            <strong>Balance:</strong> {balance} ETH
          </p>

          {verified !== null && (
            <p>
              ✅ Identity Verified:{" "}
              <strong style={{ color: verified ? "#0f0" : "#f00" }}>
                {verified ? "Yes ✅" : "No ❌"}
              </strong>
            </p>
          )}

          {verified === false && (
            <>
              <h2 style={{ marginTop: "2rem" }}>📝 Request Verification</h2>
              <RequestForm />
            </>
          )}

          {userData && (
            <div style={{ marginTop: "2rem", backgroundColor: "#2c2c3d", padding: "1rem", borderRadius: "10px" }}>
              <h2>User Information</h2>
              <p><strong>Name:</strong> {userData.name}</p>
              <p><strong>Email:</strong> {userData.email}</p>
              <p><strong>DOB:</strong> {userData.dob}</p>
              <p><strong>Phone:</strong> {userData.phone}</p>
            </div>
          )}

          {/* Log out button */}
          <button
            onClick={handleLogout}
            style={{
              padding: "10px 20px",
              fontWeight: "bold",
              backgroundColor: "#2c2c3d",
              color: "#fff",
              marginTop: "2rem",
            }}
          >
            Log Out
          </button>
        </>
      )}

      {error && (
        <p style={{ color: "red", marginTop: "1rem" }}>❌ {error}</p>
      )}

      <div
        style={{
          marginTop: "2rem",
          backgroundColor: "#2c2c3d",
          padding: "1rem",
          borderRadius: "10px",
        }}
      >
        <h2 style={{ marginBottom: "0.5rem" }}>🧪 Model App (Coming Soon)</h2>
        <p>This section will be available once you’re verified.</p>
      </div>
    </div>
  );
}
