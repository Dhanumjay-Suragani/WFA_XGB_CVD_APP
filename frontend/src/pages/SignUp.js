import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Form.css';
import API_BASE_URL from '../config';

export default function SignUp() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({ username: "", email: "", password: "" });

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/api/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                alert(data.message || "Registration failed");
                return;
            }

            localStorage.setItem("hasSignedUp", "true");
            localStorage.setItem("userEmail", data.user.email);
            localStorage.setItem("userName", data.user.username);
            localStorage.setItem("userId", data.user.id);
            localStorage.setItem("patientId", data.user.patient_id);
            alert("Registration Successful!");
            navigate("/login");
        } catch (err) {
            alert("Unable to register right now.");
        }
    };

    return (
        <div className="card">
            <h3 className="form-title">Sign Up</h3>
            <form onSubmit={handleSignUp} className="neat-form-list">
                <div className="form-row">
                    <label>Username</label>
                    <input type="text" name="username" className="form-input" onChange={handleChange} required />
                </div>
                <div className="form-row">
                    <label>Email</label>
                    <input type="email" name="email" className="form-input" onChange={handleChange} required />
                </div>
                <div className="form-row">
                    <label>Password</label>
                    <input type="password" name="password" className="form-input" onChange={handleChange} required />
                </div>
                <button type="submit" className="next-btn">Register</button>
                <div className="separator"><span>OR</span></div>
                <button type="button" onClick={() => window.location.href = "https://accounts.google.com"} className="google-btn">
                    Continue with Google
                </button>
            </form>
            <div className="auth-footer">
                <p>Already have an account? <span className="link-text" onClick={() => navigate("/login")}>Login</span></p>
            </div>
        </div>
    );
}