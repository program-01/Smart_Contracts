import React, { useState, useEffect } from "react";
import { connectWallet } from "./wallet";
import { FaExclamationCircle } from "react-icons/fa";

export default function RequestForm() {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    dobMonth: "",
    dobDay: "",
    dobYear: "",
    phone: "",
    address: "",
    password: ""
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function getAddress() {
      try {
        const signer = await connectWallet();
        const userAddress = await signer.getAddress();
  
        // Prevent setting state if it's already the same
        setForm((prev) => {
          if (prev.address === userAddress) return prev;
          return { ...prev, address: userAddress };
        });
      } catch (err) {
        console.error("Failed to connect wallet:", err);
      }
    }
  
    getAddress();
  }, []);
  
  useEffect(() => {
    if (submitted) {
      setForm((prev) => ({
        firstname: "",
        lastname: "",
        email: "",
        dobMonth: "",
        dobDay: "",
        dobYear: "",
        phone: "",
        address: prev.address,
        password: ""
      }));
    }
  }, [submitted]);
  

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullName = `${form.firstname.trim()} ${form.lastname.trim()}`;
    const dob = `${form.dobMonth.padStart(2, "0")}/${form.dobDay.padStart(2, "0")}/${form.dobYear}`;
  
    const finalForm = {
      name: fullName,
      email: form.email,
      dob,
      phone: form.phone,
      address: form.address,
      password: form.password,
      verified: false
    };
  
    try {
      const res = await fetch("http://localhost:3001/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalForm),
      });
  
      if (!res.ok) throw new Error("Submission failed");
  
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Failed to submit form. Please try again.");
    }
  };
  

  const renderOptions = (start, end, descending = false) => {
    const range = Array.from(
      { length: Math.abs(end - start) + 1 },
      (_, i) => descending ? end - i : start + i
    );
  
    return range.map((value) => (
      <option key={value} value={value}>
        {value}
      </option>
    ));
  };

  const isFormValid = () => {
    // Check if the password matches the regex and the form is otherwise valid
    const passwordValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*.]{10,}$/.test(form.password);
    return (
      form.firstname &&
      form.lastname &&
      form.email &&
      form.dobMonth &&
      form.dobDay &&
      form.dobYear &&
      form.phone &&
      form.address &&
      passwordValid
    );
  };
    

  if (submitted) return <p>✅ Verification request submitted!</p>;
  
  return (
    <form onSubmit={handleSubmit}>
      <label>Personal Information:</label><br />
      <input
        name="firstname"
        onChange={handleChange}
        placeholder="First Name"
        required
      /><br />
      <input
        name="lastname"
        onChange={handleChange}
        placeholder="Last Name"
        required
      /><br />
      <input
        name="email"
        type="email"
        onChange={handleChange}
        placeholder="Email"
        required
      /><br />
      <input
        name="phone"
        type="tel"
        onChange={handleChange}
        placeholder="Phone"
        required
      /><br />

      <br />
      <label>Date of Birth:</label><br />
      <select name="dobMonth" value={form.dobMonth} onChange={handleChange} required>
        <option value="">Month</option>
        {renderOptions(1, 12)}
      </select>
      <select name="dobDay" value={form.dobDay} onChange={handleChange} required>
        <option value="">Day</option>
        {renderOptions(1, 31)}
      </select>
      <select name="dobYear" value={form.dobYear} onChange={handleChange} required>
        <option value="">Year</option>
        {renderOptions(1950, 2007, true)}
      </select>
      <br /><br />

      <label>Password:</label><br />
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <input
          name="password"
          type="password"
          onChange={handleChange}
          placeholder="Password"
          required
          minLength="10"
          pattern=".*[a-z].*"
          title="Password must include at least 1 lowercase, 1 uppercase, 1 number, 1 special symbol, and be at least 10 characters long."
          style={{ paddingRight: '30px' }} // To leave space for the icon
        />
        <FaExclamationCircle
          style={{
            position: 'absolute',
            top: '50%',
            left: '190px',
            transform: 'translateY(-50%)',
            cursor: 'pointer',
            fontSize: '18px',
            color: '#FFCC00', // Icon color
            opacity: 0.7,
          }}
          className="tooltip-icon"
        />
        <div className="tooltip">
          Password must include at least 1 lowercase, 1 uppercase, 1 number, 1 special symbol, and be at least 10 characters long.
        </div>
      </div><br />

      <p><strong>Wallet:</strong> {form.address || "Connecting..."}</p>
      <button type="submit" disabled={!isFormValid()}>
        Request Verification
      </button>
    </form>
  );
}
