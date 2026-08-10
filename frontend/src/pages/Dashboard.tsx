import React from 'react';
import { Users, Home, DoorOpen, DoorClosed } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

interface DashboardStats {
  total_rooms: number;
  occupied_rooms: number;
  vacant_rooms: number;
  active_tenants: number;
}

export const Dashboard = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await apiClient.get<DashboardStats>('/dashboard');
      return response.data;
    }
  });

  if (isLoading) {
    return <div style={{ color: 'var(--text-muted)' }}>Loading dashboard...</div>;
  }

  if (error) {
    return <div style={{ color: '#ef4444' }}>Error loading dashboard data</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem' }}>Overview</h1>
        <p style={{ color: 'var(--text-muted)' }}>Welcome back to Hostel OS.</p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '24px' 
      }}>
        
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-title">Total Rooms</div>
              <div className="stat-value">{stats?.total_rooms || 0}</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px', color: '#38bdf8' }}>
              <Home size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-title">Active Tenants</div>
              <div className="stat-value">{stats?.active_tenants || 0}</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', color: '#8b5cf6' }}>
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-title">Occupied Rooms</div>
              <div className="stat-value">{stats?.occupied_rooms || 0}</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px', color: '#22c55e' }}>
              <DoorClosed size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-title">Vacant Rooms</div>
              <div className="stat-value">{stats?.vacant_rooms || 0}</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: '#ef4444' }}>
              <DoorOpen size={24} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
