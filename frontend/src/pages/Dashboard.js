import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// 1. Define the StatCard component (Fixes 'StatCard' is not defined)
const StatCard = ({ title, value, color }) => (
    <div style={{
        padding: '20px',
        borderRadius: '12px',
        backgroundColor: 'white',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        borderLeft: `5px solid ${color === 'teal' ? '#00A896' : '#1A2B4B'}`
    }}>
        <h4 style={{ margin: 0, color: '#666' }}>{title}</h4>
        <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{value}</p>
    </div>
);

// 2. Main Dashboard Component (Receives 'data' as a prop)
const Dashboard = ({ data }) => {
    // Fallback data if 'data' is undefined (Fixes 'data' is not defined)
    const chartData = data || [
        { name: 'Mon', risk: 10 },
        { name: 'Tue', risk: 15 },
        { name: 'Wed', risk: 8 },
        { name: 'Thu', risk: 12 },
    ];

    return (
        <div style={{ padding: '40px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <h2 style={{ color: '#1A2B4B', marginBottom: '30px' }}>Health Analytics Dashboard</h2>

            {/* KPI Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <StatCard title="Heart Risk" value="Low" color="teal" />
                <StatCard title="Avg Heart Rate" value="72 BPM" color="navy" />
                <StatCard title="Activity" value="85%" color="teal" />
            </div>

            {/* Graph Section */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h3 style={{ color: '#1A2B4B' }}>Risk Trend Analysis</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="risk" stroke="#00A896" strokeWidth={3} dot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// 3. Export the component (Fixes 'export default' not found)
export default Dashboard;