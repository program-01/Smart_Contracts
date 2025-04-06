import React, { useEffect, useState } from "react";
import { issueIdentity, isUserVerified } from "./wallet";
import { uploadMetadataToIPFS } from "./ipfs";

export default function AdminPanel() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verifiedMap, setVerifiedMap] = useState({});

  // Fetch all requests
  const fetchRequests = async () => {
    const res = await fetch("http://localhost:3001/requests");
    const data = await res.json();
    setRequests(data);

    // For each request with an address, check if they are verified
    const statusMap = {};
    for (const req of data) {
      if (req.address) {
        try {
          const isVerified = await isUserVerified(req.address);
          statusMap[req.address] = isVerified;
        } catch (err) {
          console.error("Error checking verification for", req.address, err);
        }
      }
    }
    setVerifiedMap(statusMap);
  };

  const handleApprove = async (req) => {
    try {
      setLoading(true);
      const metadata = {
        name: req.name,
        email: req.email,
        dob: req.dob,
        phone: req.phone,
      };

      console.log("📝 Uploading metadata:", metadata);
      const metadataURI = await uploadMetadataToIPFS(metadata);
      console.log("✅ Uploaded to IPFS:", metadataURI);

      await issueIdentity(req.address, metadataURI);
      alert("✅ Identity minted successfully!");

      // Refresh verification status
      await fetchRequests();
    } catch (err) {
      console.error("❌ Approval failed:", err);
      alert("❌ Failed to approve user: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const unapproved = requests.filter(
    (req) => req.address && !verifiedMap[req.address]
  );

  const approved = requests.filter(
    (req) => req.address && verifiedMap[req.address]
  );

  return (
    <div style={{ padding: "2rem" }}>
      <h2>🛡️ Admin Panel</h2>
      {loading && <p>⏳ Processing...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h3>📝 Pending Approvals</h3>
      {unapproved.length === 0 && <p>No pending requests.</p>}
      {unapproved.map((req, index) => (
        <div key={index} style={{ borderBottom: "1px solid #444", padding: "1rem 0" }}>
          <p><strong>{req.name}</strong> ({req.email})</p>
          <p>DOB: {req.dob} | Phone: {req.phone}</p>
          <p>Wallet: {req.address}</p>
          <button onClick={() => handleApprove(req)}>✅ Approve & Mint</button>
        </div>
      ))}

      <h3 style={{ marginTop: "2rem" }}>✅ Approved Users</h3>
      {approved.length === 0 && <p>No approved users yet.</p>}
      {approved.map((req, index) => (
        <div key={index} style={{ borderBottom: "1px solid #444", padding: "1rem 0" }}>
          <p><strong>{req.name}</strong> ({req.email})</p>
          <p>DOB: {req.dob} | Phone: {req.phone}</p>
          <p>Wallet: {req.address}</p>
          <p style={{ color: "green" }}>✅ Verified</p>
        </div>
      ))}
    </div>
  );
}