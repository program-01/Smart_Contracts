import React, { useState, useEffect } from "react";
import {
  checkVerification,
  connectWallet,
  getWalletInfo,
  getMetadataHash,
} from "./wallet";
import RequestForm from "./RequestForm";
import { keccak256, toUtf8Bytes } from "ethers"; // For hashing IPFS data

// ✅ Helper to verify IPFS content matches on-chain hash
const verifyMetadataIntegrity = async (uri, expectedHash) => {
  try {
    const res = await fetch(uri); // Fetch IPFS JSON
    const metadata = await res.json();
    const metadataString = JSON.stringify(metadata);
    const calculatedHash = keccak256(toUtf8Bytes(metadataString));
    return calculatedHash === expectedHash;
  } catch (err) {
    console.error("Error verifying IPFS content:", err);
    return false;
  }
};

export default function MainDashboard() {
  const [verified, setVerified] = useState(null);
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  const [dobMonth, setDobMonth] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [password, setPassword] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      setAddress(savedUser.address);
      setVerified(savedUser.verified);
      setUserData(savedUser.userData);
      setBalance(savedUser.balance);
    }
  }, []);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const res = await fetch("http://localhost:3001/requests");
      const data = await res.json();

      const formattedDob = `${dobMonth.padStart(2, "0")}/${dobDay.padStart(2, "0")}/${dobYear}`;
      const user = data.find(
        (req) => req.dob === formattedDob && req.password === password
      );

      if (user) {
        setAddress(user.address);

        const formatName = (name) => {
          return name
            .split(" ")
            .map(
              (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(" ");
        };

        const formattedUser = { ...user, name: formatName(user.name) };

        // ✅ Fetch metadata hash from blockchain
        const metadataHash = await getMetadataHash(user.address);
        formattedUser.metadataHash = metadataHash;

        // ✅ Check IPFS URI and verify integrity
        if (user.metadataURI) {
          const isValid = await verifyMetadataIntegrity(user.metadataURI, metadataHash);
          formattedUser.metadataURI = user.metadataURI;
          formattedUser.metadataIntegrity = isValid;
        }

        setUserData(formattedUser);
        setVerified(user.verified);

        const signer = await connectWallet();
        const info = await getWalletInfo(signer);
        setBalance(info.balance);

        localStorage.setItem(
          "user",
          JSON.stringify({
            address: user.address,
            verified: user.verified,
            userData: formattedUser,
            balance: info.balance,
          })
        );

        alert("Logged in successfully!");
      } else {
        console.log("Error: No user found with that password and date of birth.");
        setVerified(false);
        setUserData(null);
        alert("❌ No user found with that password and date of birth. Please request verification.");
        setShowRequestForm(true);
      }

      setError("");
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAddress("");
    setBalance("");
    setVerified(null);
    setUserData(null);
    setError("");
    localStorage.removeItem("user");
  };

  const formatPhoneNumber = (phone) => {
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) return `${match[1]}-${match[2]}-${match[3]}`;
    return phone;
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
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "200px", padding: "10px", marginRight: "10px" }}
            />
            <select
              value={dobMonth}
              onChange={(e) => setDobMonth(e.target.value)}
              required
              style={{ padding: "10px", marginRight: "5px" }}
            >
              <option value="">Month</option>
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            <select
              value={dobDay}
              onChange={(e) => setDobDay(e.target.value)}
              required
              style={{ padding: "10px", marginRight: "5px" }}
            >
              <option value="">Day</option>
              {[...Array(31)].map((_, i) => (
                <option key={i} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            <select
              value={dobYear}
              onChange={(e) => setDobYear(e.target.value)}
              required
              style={{ padding: "10px", marginRight: "10px" }}
            >
              <option value="">Year</option>
              {Array.from({ length: 2007 - 1950 + 1 }, (_, i) => {
                const year = 2007 - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
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
          <p><strong>Wallet:</strong> {address}</p>
          <p><strong>Balance:</strong> {balance} ETH</p>
          {verified !== null && (
            <p>
              ✅ Identity Verified:{" "}
              <strong style={{ color: verified ? "#0f0" : "#f00" }}>
                {verified ? "Yes ✅" : "No ❌"}
              </strong>
            </p>
          )}

          {userData && (
            <div style={{
              marginTop: "2rem",
              backgroundColor: "#2c2c3d",
              padding: "1rem",
              borderRadius: "10px"
            }}>
              <h2>User Information</h2>
              <p><strong>Name:</strong> {userData.name}</p>
              <p><strong>Email:</strong> {userData.email}</p>
              <p><strong>DOB:</strong> {userData.dob}</p>
              <p><strong>Phone:</strong> {formatPhoneNumber(userData.phone)}</p>
              <p><strong>Metadata Hash:</strong> {userData.metadataHash}</p>

              {userData.metadataURI && (
                <p>
                  <strong>IPFS Metadata:</strong>{" "}
                  <a
                    href={userData.metadataURI}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#0af" }}
                  >
                    View Metadata
                  </a>
                </p>
              )}

              {userData.metadataIntegrity !== undefined && (
                <p>
                  <strong>Metadata Integrity:</strong>{" "}
                  <span style={{ color: userData.metadataIntegrity ? "#0f0" : "#f00" }}>
                    {userData.metadataIntegrity ? "Valid ✅" : "Mismatch ❌"}
                  </span>
                </p>
              )}
            </div>
          )}

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

      <div style={{
        marginTop: "2rem",
        backgroundColor: "#2c2c3d",
        padding: "1rem",
        borderRadius: "10px",
      }}>
        <h2 style={{ marginBottom: "0.5rem" }}>🧪 Model App (Coming Soon)</h2>
        <p>This section will be available once you’re verified.</p>
      </div>
    </div>
  );
}