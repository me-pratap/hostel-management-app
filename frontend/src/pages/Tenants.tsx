import React, { useEffect, useState } from 'react';
import { UserPlus, Phone, Home, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient, { getImageUrl } from '../api/client';

interface Tenant {
  tenant_id: string;
  full_name: string;
  photo_url?: string;
  contact_number: string;
  room_id: string;
  monthly_rent_amount: number;
  police_verification_status: string;
  date_joined: string;
}

export const Tenants = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const res = await apiClient.get<Tenant[]>('/tenants?is_active=true');
        setTenants(res.data);
      } catch (err) {
        console.error('Failed to fetch tenants', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTenants();
  }, []);

  if (loading) {
    return <div style={{ color: 'var(--text-muted)' }}>Loading tenants...</div>;
  }


  return (
    <div>
      <div className="header-actions">
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem' }}>Tenants</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage all active hostel residents.</p>
        </div>
        <Link to="/tenants/new">
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={20} /> Add New Tenant
          </button>
        </Link>
      </div>

      <div className="grid-cards">
        {tenants.map(tenant => (
          <div
            key={tenant.tenant_id}
            className="stat-card"
            style={{ padding: '24px', cursor: 'pointer' }}
            onClick={() => navigate(`/tenants/${tenant.tenant_id}`)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              {tenant.photo_url ? (
                <img
                  src={getImageUrl(tenant.photo_url)}
                  alt={tenant.full_name}
                  style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    objectFit: 'cover', border: '2px solid var(--accent-primary)'
                  }}
                />
              ) : (
                <div style={{
                  width: '64px', height: '64px',
                  borderRadius: '50%',
                  background: 'var(--accent-glow)',
                  color: 'var(--accent-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', fontWeight: 'bold', border: '1px solid var(--accent-primary)'
                }}>
                  {tenant.full_name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem' }}>{tenant.full_name}</h3>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Home size={14} /> Room assigned
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                <Phone size={18} />
                <span style={{ fontSize: '0.875rem' }}>{tenant.contact_number}</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                <FileText size={18} />
                <span style={{ fontSize: '0.875rem' }}>
                  Verification: <strong style={{ color: tenant.police_verification_status === 'done' ? '#10b981' : 'var(--accent-primary)', textTransform: 'capitalize' }}>{tenant.police_verification_status.replace('_', ' ')}</strong>
                </span>
              </div>
            </div>
          </div>
        ))}
        {tenants.length === 0 && (
          <div style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: 'var(--bg-surface-elevated)', borderRadius: '16px' }}>
            No active tenants found. Click "Add New Tenant" to get started.
          </div>
        )}
      </div>
    </div>
  );
};
