import React, { useEffect, useState } from 'react';
import { Home, Users, ArrowRight } from 'lucide-react';
import apiClient from '../api/client';
import { Link } from 'react-router-dom';

interface Room {
  room_id: string;
  room_number: string;
  floor: string;
  room_type: string;
  capacity: int;
  occupant_count: int;
  is_occupied: boolean;
}

interface FloorPlan {
  ground: Room[];
  first: Room[];
}

export const Rooms = () => {
  const [floorPlan, setFloorPlan] = useState<FloorPlan | null>(null);
  const [loading, setLoading] = useState(true);

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
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px'
      }}>
        {rooms.map(room => (
          <div key={room.room_id} className="stat-card" style={{ padding: '24px' }}>
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
                <button className="btn-icon" style={{ width: '36px', height: '36px' }} title="View details">
                  <ArrowRight size={18} />
                </button>
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
