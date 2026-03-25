import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Form.css';
import API_BASE_URL from '../config';

export default function ForgotPassword() {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: "",
        otp: "",
        newPassword: "",
        confirmPassword: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 🔹 Send OTP
    const sendOTP = async () => {
        await fetch(`${API_BASE_URL}/api/send-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: formData.email })
        });
        alert("OTP sent!");
        setStep(2);
    };

    // 🔹 Verify OTP & Reset Password
    const handleReset = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        const res = await fetch(`${API_BASE_URL}/api/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const data = await res.json();
        alert(data.message);

        if (data.success) navigate("/login");
    };

    return (
        <div className="card">
            <h3 className="form-title">Reset Password</h3>

            {step === 1 && (
                <>
                    <input type="email" name="email" placeholder="Enter Email" onChange={handleChange} required />
                    <button onClick={sendOTP} className="next-btn">Send OTP</button>
                </>
            )}

            {step === 2 && (
                <form onSubmit={handleReset}>
                    <input type="text" name="otp" placeholder="Enter OTP" onChange={handleChange} required />
                    <input type="password" name="newPassword" placeholder="New Password" onChange={handleChange} required />
                    <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required />
                    <button type="submit" className="next-btn">Update Password</button>
                </form>
            )}

            <p onClick={() => navigate("/login")}>Back to Login</p>
        </div>
    );
}