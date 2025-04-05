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

  const handleCheck = async () => {
    try {
      setLoading(true);
      const signer = await connectWallet();
      const info = await getWalletInfo(signer);
      setAddress(info.address);
      setBalance(info.balance);
      const result = await checkVerification();
      setVerified(result);
      setError("");
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to connect or verify.");
    } finally {
      setLoading(false);
    }
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

      <button
        onClick={handleCheck}
        style={{
          padding: "10px 20px",
          fontWeight: "bold",
          marginBottom: "1rem",
        }}
      >
        {loading ? "⏳ Connecting..." : "Connect Wallet & Check Identity"}
      </button>

      {address && (
        <div style={{ marginBottom: "1rem" }}>
          <p>
            <strong>Wallet:</strong> {address}
          </p>
          <p>
            <strong>Balance:</strong> {balance} ETH
          </p>
        </div>
      )}

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
