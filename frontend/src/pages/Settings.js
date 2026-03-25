import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Form.css';
import './Form.css';

export default function Settings() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="card">
            <h3 className="form-title">Account Settings</h3>
            <div className="settings-options" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="setting-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
                    <span>Notifications</span>
                    <input type="checkbox" defaultChecked />
                </div>
                <div className="setting-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
                    <span>Dark Mode</span>
                    <input type="checkbox" />
                </div>
                <button className="next-btn" style={{ background: '#f44336' }} onClick={handleLogout}>Logout</button>
                <button className="next-btn" onClick={() => navigate('/home')}>Back to Dashboard</button>
            </div>
        </div>
    );
}