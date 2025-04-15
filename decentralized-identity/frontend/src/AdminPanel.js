import React, { useEffect, useState } from "react";
import { issueIdentity, isUserVerified } from "./wallet";
import { uploadMetadataToIPFS } from "./ipfs";
import { keccak256, toUtf8Bytes } from "ethers";
import bs58 from "bs58";

export default function AdminPanel() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verifiedMap, setVerifiedMap] = useState({});

  // Fetch all requests
  const fetchRequests = async () => {
    const res = await fetch("http://localhost:3001/requests");
    const data = await res.json();
  
    // Sync blockchain verification with db.json
    const updatedData = await Promise.all(
      data.map(async (req) => {
        if (req.address) {
          try {
            const isVerified = await isUserVerified(req.address);
  
            // If the blockchain says they're verified but db.json doesn't
            if (isVerified && !req.verified) {
              const updatedReq = { ...req, verified: true };
              await fetch(`http://localhost:3001/requests/${req.id}`, {
                method: "PUT",
                body: JSON.stringify(updatedReq),
                headers: {
                  "Content-Type": "application/json",
                },
              });
              return updatedReq;
            }
  
            return req;
          } catch (err) {
            console.error("Error checking verification for", req.address, err);
            return req;
          }
        }
        return req;
      })
    );
  
    setRequests(updatedData);
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

        const ipfsHash = metadataURI.split("/").pop(); // Gets just "Qm..."

        const hashBytes32 = keccak256(toUtf8Bytes(ipfsHash));
        await issueIdentity(req.address, hashBytes32);

        const updatedUser = { // Set to true or false depending on whether they've been approved
          ...req,
          verified: true, // Set the verified status to true for approved users
        };

        // Update the db.json to reflect that the user is verified
        await fetch(`http://localhost:3001/requests/${req.id}`, {
          method: "PUT",
          body: JSON.stringify(updatedUser),
          headers: {
            "Content-Type": "application/json",
          },
        });

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

  const unapproved = requests.filter(req => req.address && !req.verified);
  const approved = requests.filter(req => req.address && req.verified);


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