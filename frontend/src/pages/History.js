import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Form.css';
import API_BASE_URL from '../config';

export default function History() {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);

    useEffect(() => {
        // Replace with your actual Flask URL
        fetch(`${API_BASE_URL}/api/history`)
            .then(res => res.json())
            .then(data => setHistory(data))
            .catch(() => setHistory([
                { date: "2026-03-20 10:30", risk: "15%", user: "Patient_01" },
                { date: "2026-03-18 14:15", risk: "45%", user: "Patient_01" }
            ])); // Mock data if server is off
    }, []);

    return (
        <div className="card">
            <h3 className="form-title">Prediction History</h3>
            <div className="history-container">
                {history.map((item, i) => (
                    <div key={i} className="history-card" style={{ borderBottom: '1px solid #eee', padding: '10px' }}>
                        <p style={{ fontSize: '12px', color: '#666' }}>{item.date}</p>
                        <p><strong>User:</strong> {item.user}</p>
                        <p><strong>Result:</strong> <span style={{ color: parseInt(item.risk) > 30 ? 'orange' : 'green' }}>{item.risk} Risk</span></p>
                    </div>
                ))}
            </div>
            <button className="next-btn" onClick={() => navigate('/home')}>Back</button>
        </div>
    );
}