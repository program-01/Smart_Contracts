import React, { useState } from "react";

export default function RequestForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    dob: "",
    phone: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("http://localhost:3001/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
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
      <button type="submit">Request Verification</button>
    </form>
  );
}