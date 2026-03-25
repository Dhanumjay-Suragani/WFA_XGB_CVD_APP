import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Form.css';

export default function Recommendations() {
    const navigate = useNavigate();

    const tips = [
        "Schedule Medical Checkups",
        "Maintain Health Habits",
        "Monitor Your Health Regularly",
        "Consult a Specialist"
    ];

    return (
        <div className="card recommendation-page">
            {/* Header with Navigation as per Figma */}
            <div className="button-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <button className="nav-small-btn" onClick={() => navigate(-1)}>Back</button>
                <div>
                    <button className="nav-small-btn" style={{ marginRight: '10px', background: '#999' }} onClick={() => navigate("/")}>Skip</button>
                    <button className="nav-small-btn" onClick={() => navigate("/")}>Next</button>
                </div>
            </div>

            <h3 style={{ textAlign: 'center' }}>Recommendations</h3>

            <div className="rec-list">
                {tips.map((tip, index) => (
                    <div key={index} className="rec-item" style={{
                        background: 'white',
                        border: '1px solid #ddd',
                        margin: '10px 0',
                        padding: '15px',
                        borderRadius: '10px',
                        textAlign: 'center',
                        fontWeight: '500'
                    }}>
                        {tip}
                    </div>
                ))}
            </div>

            <button className="download-btn" onClick={() => window.print()} style={{
                width: '100%',
                backgroundColor: '#1E88E5',
                color: 'white',
                padding: '15px',
                border: 'none',
                borderRadius: '8px',
                marginTop: '20px',
                fontWeight: 'bold',
                cursor: 'pointer'
            }}>
                Download Report
            </button>
        </div>
    );
}