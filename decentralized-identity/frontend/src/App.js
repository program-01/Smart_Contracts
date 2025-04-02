import React, { useState } from "react";
import { checkVerification } from "./wallet";
import "./App.css";

function App() {
  const [verified, setVerified] = useState(null);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    try {
      const result = await checkVerification();
      setVerified(result);
      setError("");
    } catch (err) {
      console.error("Verification failed:", err);
      setVerified(null);
      setError(err.message || "Something went wrong.");
    }
  };
  

  return (
    <div className="App">
      <header className="App-header">
        <h1>🛡️ Identity Verification Checker</h1>
        <button onClick={handleCheck}>
          Connect Wallet & Check Identity
        </button>
        {verified !== null && (
          <p>
            ✅ Identity Verified:{" "}
            <strong>{verified ? "Yes ✅" : "No ❌"}</strong>
          </p>
        )}
        {error && (
        <p style={{ color: "red" }}>
          ❌ Error: {error.includes("user rejected") ? "Wallet connection denied." : error}
        </p>
        )}

      </header>
    </div>
  );
}

export default App;
