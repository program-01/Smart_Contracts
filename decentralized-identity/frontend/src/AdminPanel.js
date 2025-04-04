import React, { useEffect, useState } from "react";
import { issueIdentity } from "./wallet";
import { uploadMetadataToIPFS } from "./ipfs"; // we'll build this next

export default function AdminPanel() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    const res = await fetch("http://localhost:3001/requests");
    const data = await res.json();
    setRequests(data);
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

        await issueIdentity(metadataURI);
        alert("✅ Identity minted successfully!");
        } catch (err) {
        console.error("❌ Approval failed:", err);
        alert("❌ Failed to approve user: " + err.message);
        }finally {
            setLoading(false);
        }

    //   const metadataURI = await uploadMetadataToIPFS(metadata);
    //   await issueIdentity(req.walletAddress, metadataURI);
    //   alert(`✅ Identity minted for ${req.name}`);
    // } catch (err) {
    //   console.error(err);
    //   setError(err.message || "Error approving request.");
    // } finally {
    //   setLoading(false);
    // }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>🛡️ Admin Panel</h2>
      {loading && <p>⏳ Processing...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {requests.map((req, index) => (
        <div key={index} style={{ borderBottom: "1px solid #444", padding: "1rem 0" }}>
          <p><strong>{req.name}</strong> ({req.email})</p>
          <p>DOB: {req.dob} | Phone: {req.phone}</p>
          <button onClick={() => handleApprove(req)}>✅ Approve & Mint</button>
        </div>
      ))}
    </div>
  );
}