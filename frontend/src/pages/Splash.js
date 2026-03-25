import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Form.css';

export default function Splash() {
    const navigate = useNavigate();

    return (
        <div className="splash-container" style={{
            backgroundColor: '#1565c0',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <h1 style={{ color: 'white', fontSize: '48px', marginBottom: '20px' }}>
                CardioMind AI
            </h1>

            {/* The button is now neatly sized */}
            <button
                className="get-started-btn"
                onClick={() => navigate("/signup")}
            >
                Get Started
            </button>
            <p style={{ marginTop: 24 }}>
                <button
                    type="button"
                    onClick={() => navigate("/admin/login")}
                    style={{
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.6)',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 14,
                    }}
                >
                    Admin portal
                </button>
            </p>
        </div>
    );
}