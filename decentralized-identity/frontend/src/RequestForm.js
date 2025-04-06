import React, { useState, useEffect } from "react";
import { connectWallet } from "./wallet";

export default function RequestForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    dob: "",
    phone: "",
    address: ""
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function getAddress() {
      const signer = await connectWallet();
      const userAddress = await signer.getAddress();
      setForm((prev) => ({ ...prev, address: userAddress }));
    }
    getAddress();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("http://localhost:3001/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSubmitted(true);
  };

  if (submitted) return <p>✅ Verification request submitted!</p>;

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" onChange={handleChange} placeholder="Name" required /><br />
      <input name="email" onChange={handleChange} placeholder="Email" required /><br />
      <input name="dob" onChange={handleChange} placeholder="Date of Birth" required /><br />
      <input name="phone" onChange={handleChange} placeholder="Phone" required /><br />
      {/* Just to show the wallet is being captured */}
      <p><strong>Wallet:</strong> {form.address || "Connecting..."}</p>
      <button type="submit" disabled={!form.address}>Request Verification</button>
    </form>
  );
}
