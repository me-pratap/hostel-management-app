import React, { useEffect, useState } from 'react';
import { Home, Users, ArrowRight, User, Phone, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import apiClient from '../api/client';
import { Link } from 'react-router-dom';

interface Room {
  room_id: string;
  room_number: string;
  floor: string;
  room_type: string;
  capacity: number;
  occupant_count: number;
  is_occupied: boolean;
}

interface FloorPlan {
  ground: Room[];
  first: Room[];
}

export const Rooms = () => {
  const [floorPlan, setFloorPlan] = useState<FloorPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null);
  const [roomDetails, setRoomDetails] = useState<Record<string, any>>({});

  const handleRoomClick = async (roomId: string) => {
    if (expandedRoomId === roomId) {
      setExpandedRoomId(null);
      return;
    }
    setExpandedRoomId(roomId);
    if (!roomDetails[roomId]) {
      try {
        const res = await apiClient.get(`/rooms/${roomId}`);
        setRoomDetails(prev => ({ ...prev, [roomId]: res.data }));
      } catch (err) {
        console.error('Failed to fetch room details', err);
      }
    }
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await apiClient.get<FloorPlan>('/rooms/floor-plan');
        setFloorPlan(res.data);
      } catch (err) {
        console.error('Failed to fetch rooms', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  if (loading) {
    return <div style={{ color: 'var(--text-muted)' }}>Loading rooms...</div>;
  }

  const renderFloor = (name: string, rooms: Room[]) => (
    <div style={{ marginBottom: '40px' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {name}
        <span style={{ fontSize: '0.875rem', background: 'var(--accent-glow)', color: 'var(--accent-primary)', padding: '4px 12px', borderRadius: '12px' }}>
          {rooms.length} Rooms
        </span>
      </h2>
      <div className="grid-cards">
        {rooms.map(room => (
          <div key={room.room_id} className="stat-card" style={{ padding: '24px', cursor: room.room_type === 'rent' ? 'pointer' : 'default' }} onClick={() => room.room_type === 'rent' && handleRoomClick(room.room_id)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '48px', height: '48px', 
                  borderRadius: '12px', 
                  background: room.room_type === 'office' ? 'rgba(56, 189, 248, 0.1)' : 'var(--accent-glow)',
                  color: room.room_type === 'office' ? '#38bdf8' : 'var(--accent-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {room.room_type === 'office' ? <Home size={24} /> : <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{room.room_number}</span>}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{room.room_type === 'office' ? 'Office' : `Room ${room.room_number}`}</h3>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{room.room_type}</span>
                </div>
              </div>
            </div>

            {room.room_type === 'rent' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <Users size={18} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    {room.occupant_count} {room.occupant_count === 1 ? 'Tenant' : 'Tenants'}
                  </span>
                </div>
                <button className="btn-icon" style={{ width: '36px', height: '36px' }} title={expandedRoomId === room.room_id ? "Collapse" : "View details"}>
                  {expandedRoomId === room.room_id ? <ChevronUp size={18} /> : <ArrowRight size={18} />}
                </button>
              </div>
            )}
            
            {/* Expanded Details Section */}
            {expandedRoomId === room.room_id && (
              <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }} onClick={(e) => e.stopPropagation()}>
                {!roomDetails[room.room_id] ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading tenants...</div>
                ) : roomDetails[room.room_id].tenants?.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No tenants assigned to this room.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {roomDetails[room.room_id].tenants.map((tenant: any) => (
                      <div key={tenant.tenant_id} style={{ 
                        padding: '16px', 
                        borderRadius: 'var(--radius-md)', 
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(217, 108, 74, 0.1)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={20} />
                          </div>
                          <div>
                            <Link to={`/tenants/${tenant.tenant_id}`} style={{ fontWeight: 600, fontSize: '1rem', color: 'inherit', textDecoration: 'none' }}>
                              {tenant.full_name}
                            </Link>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID: {tenant.tenant_id.substring(0,8)}</div>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                            <Phone size={14} /> {tenant.contact_number}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                            <CreditCard size={14} /> 
                            <span>Rent Status: 
                              <span style={{ 
                                marginLeft: '8px', 
                                padding: '2px 8px', 
                                borderRadius: '8px', 
                                fontSize: '0.75rem', 
                                fontWeight: 600, 
                                textTransform: 'uppercase',
                                background: tenant.current_rent_status === 'paid' ? 'rgba(16, 185, 129, 0.1)' : tenant.current_rent_status === 'partial' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                                color: tenant.current_rent_status === 'paid' ? '#10b981' : tenant.current_rent_status === 'partial' ? '#f59e0b' : '#f43f5e'
                              }}>
                                {tenant.current_rent_status || 'Unknown'}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem' }}>Rooms Management</h1>
        <p style={{ color: 'var(--text-muted)' }}>Overview of all hostel rooms by floor.</p>
      </div>

      {floorPlan && (
        <>
          {renderFloor('Ground Floor', floorPlan.ground)}
          {renderFloor('First Floor', floorPlan.first)}
        </>
      )}
    </div>
  );
};
