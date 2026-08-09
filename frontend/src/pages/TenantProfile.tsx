import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Edit, Phone, MapPin, Calendar, CreditCard,
  Shield, MessageCircle, UserX, Upload, FileText, Heart,
  User, Home, Car
} from 'lucide-react';
import apiClient, { getImageUrl } from '../api/client';

interface TenantData {
  tenant_id: string;
  full_name: string;
  photo_url?: string;
  dob?: string;
  gender?: string;
  aadhar_number?: string;
  aadhar_photo_url?: string;
  contact_number: string;
  alternate_contact_number?: string;
  emergency_contact_name?: string;
  emergency_contact_number?: string;
  parents_contact_number?: string;
  local_guardian_name?: string;
  local_guardian_contact?: string;
  home_address?: string;
  occupation_or_work?: string;
  blood_group?: string;
  vehicle_number?: string;
  room_id: string;
  bed_slot_number?: number;
  date_joined?: string;
  date_left?: string;
  monthly_rent_amount: number;
  rent_due_day: number;
  police_verification_status: string;
  payment_mode_preference?: string;
  is_active: boolean;
  notes?: string;
  room?: {
    room_number: string;
    floor: string;
  };
}

export const TenantProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [reminderResult, setReminderResult] = useState<string | null>(null);
  const [showAadhar, setShowAadhar] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingAadhar, setUploadingAadhar] = useState(false);

  const fetchTenant = async () => {
    try {
      const res = await apiClient.get(`/tenants/${id}`);
      setTenant(res.data);
    } catch (err) {
      console.error('Failed to fetch tenant', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenant();
  }, [id]);

  const handleSendReminder = () => {
    if (!tenant) return;
    const phone = tenant.contact_number.replace(/\D/g, '');
    // Usually Indian numbers need 91 prefix if not already present
    const waNumber = phone.length === 10 ? `91${phone}` : phone;
    const message = `Hi ${tenant.full_name}, this is a reminder that your rent of ₹${tenant.monthly_rent_amount} was due on the ${tenant.rent_due_day}th of the month. Please make the payment.`;
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setReminderResult('✅ Opened WhatsApp!');
    setTimeout(() => setReminderResult(null), 4000);
  };

  const handleMarkLeft = async () => {
    if (!tenant || !confirm(`Are you sure you want to mark ${tenant.full_name} as left?`)) return;
    try {
      await apiClient.post(`/tenants/${tenant.tenant_id}/mark-left`);
      navigate('/tenants');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'aadhar') => {
    const file = e.target.files?.[0];
    if (!file || !tenant) return;

    const setter = type === 'photo' ? setUploadingPhoto : setUploadingAadhar;
    setter(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await apiClient.post('/tenants/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = uploadRes.data.url;
      const field = type === 'photo' ? 'photo_url' : 'aadhar_photo_url';
      await apiClient.put(`/tenants/${tenant.tenant_id}`, { [field]: url });
      await fetchTenant();
    } catch (err) {
      alert('Upload failed');
    } finally {
      setter(false);
    }
  };

  if (loading) return <div style={{ color: 'var(--text-muted)' }}>Loading profile...</div>;
  if (!tenant) return <div style={{ color: '#ef4444' }}>Tenant not found.</div>;

  const verificationColor = tenant.police_verification_status === 'done' ? '#10b981' : tenant.police_verification_status === 'pending' ? '#f59e0b' : 'var(--text-muted)';

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value?: string | number | null }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <Icon size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', minWidth: '140px' }}>{label}</span>
      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{value || '—'}</span>
    </div>
  );

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Back + Actions Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={() => navigate('/tenants')} className="btn-icon" style={{ width: 'auto', borderRadius: 'var(--radius-full)', padding: '0 20px', gap: '8px', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={18} /> Back
        </button>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to={`/tenants/${tenant.tenant_id}/edit`}>
            <button className="btn-icon" style={{ width: 'auto', borderRadius: 'var(--radius-full)', padding: '0 20px', gap: '8px', display: 'flex', alignItems: 'center' }}>
              <Edit size={16} /> Edit
            </button>
          </Link>
          <button onClick={handleMarkLeft} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-full)', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--font-body)' }}>
            <UserX size={16} /> Mark as Left
          </button>
        </div>
      </div>

      {/* Header Card */}
      <div className="form-section" style={{ marginBottom: '24px' }}>
        <div className="profile-header">
          {/* Profile Photo */}
          <div style={{ position: 'relative' }}>
            {tenant.photo_url ? (
              <img
                src={getImageUrl(tenant.photo_url)}
                alt={tenant.full_name}
                style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-primary)' }}
              />
            ) : (
              <div style={{
                width: '100px', height: '100px', borderRadius: '50%',
                background: 'var(--accent-glow)', color: 'var(--accent-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.5rem', fontWeight: 'bold', border: '3px solid var(--accent-primary)'
              }}>
                {tenant.full_name.charAt(0).toUpperCase()}
              </div>
            )}
            <label style={{
              position: 'absolute', bottom: 0, right: 0,
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'var(--accent-primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', border: '2px solid var(--bg-surface)'
            }}>
              <Upload size={14} />
              <input type="file" accept="image/*" hidden onChange={(e) => handlePhotoUpload(e, 'photo')} disabled={uploadingPhoto} />
            </label>
          </div>

          <div style={{ flex: 1 }}>
            <h1 style={{ margin: '0 0 4px', fontSize: '1.75rem' }}>{tenant.full_name}</h1>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {tenant.room && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Home size={14} /> Room {tenant.room.room_number} ({tenant.room.floor} floor)</span>}
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CreditCard size={14} /> ₹{tenant.monthly_rent_amount}/mo</span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '2px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700,
                background: verificationColor + '22', color: verificationColor, textTransform: 'uppercase'
              }}>
                <Shield size={12} /> {tenant.police_verification_status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* WhatsApp Reminder */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
            <button
              onClick={handleSendReminder}
              disabled={sendingReminder}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', padding: '10px 20px' }}
            >
              <MessageCircle size={16} /> {sendingReminder ? 'Sending...' : 'Send Rent Reminder'}
            </button>
            {reminderResult && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{reminderResult}</span>
            )}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid-2-cols">
        {/* Personal Information */}
        <div className="form-section">
          <div className="form-section-title">Personal Information</div>
          <InfoRow icon={User} label="Full Name" value={tenant.full_name} />
          <InfoRow icon={Calendar} label="Date of Birth" value={tenant.dob} />
          <InfoRow icon={User} label="Gender" value={tenant.gender} />
          <InfoRow icon={Heart} label="Blood Group" value={tenant.blood_group} />
          <InfoRow icon={FileText} label="Aadhar Number" value={tenant.aadhar_number} />
          <InfoRow icon={Car} label="Vehicle Number" value={tenant.vehicle_number} />
          <InfoRow icon={User} label="Occupation" value={tenant.occupation_or_work} />
        </div>

        {/* Contact Information */}
        <div className="form-section">
          <div className="form-section-title">Contact Details</div>
          <InfoRow icon={Phone} label="Primary Phone" value={tenant.contact_number} />
          <InfoRow icon={Phone} label="Alternate Phone" value={tenant.alternate_contact_number} />
          <InfoRow icon={Phone} label="Emergency Contact" value={tenant.emergency_contact_name ? `${tenant.emergency_contact_name} (${tenant.emergency_contact_number || '—'})` : undefined} />
          <InfoRow icon={Phone} label="Parents Phone" value={tenant.parents_contact_number} />
          <InfoRow icon={User} label="Local Guardian" value={tenant.local_guardian_name ? `${tenant.local_guardian_name} (${tenant.local_guardian_contact || '—'})` : undefined} />
          <InfoRow icon={MapPin} label="Home Address" value={tenant.home_address} />
        </div>

        {/* Hostel Details */}
        <div className="form-section">
          <div className="form-section-title">Hostel & Rent</div>
          <InfoRow icon={Home} label="Room" value={tenant.room ? `Room ${tenant.room.room_number} (${tenant.room.floor})` : tenant.room_id} />
          <InfoRow icon={Home} label="Bed Slot" value={tenant.bed_slot_number} />
          <InfoRow icon={CreditCard} label="Monthly Rent" value={`₹${tenant.monthly_rent_amount}`} />
          <InfoRow icon={Calendar} label="Rent Due Day" value={`${tenant.rent_due_day}th of each month`} />
          <InfoRow icon={Calendar} label="Date Joined" value={tenant.date_joined} />
          <InfoRow icon={CreditCard} label="Payment Pref." value={tenant.payment_mode_preference} />
        </div>

        {/* Aadhar Photo */}
        <div className="form-section">
          <div className="form-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Aadhar Card Photo
            <label style={{
              fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
              textTransform: 'none', letterSpacing: 'normal'
            }}>
              <Upload size={14} /> {uploadingAadhar ? 'Uploading...' : 'Upload'}
              <input type="file" accept="image/*" hidden onChange={(e) => handlePhotoUpload(e, 'aadhar')} disabled={uploadingAadhar} />
            </label>
          </div>
          {tenant.aadhar_photo_url ? (
            <>
              <img
                src={getImageUrl(tenant.aadhar_photo_url)}
                alt="Aadhar Card"
                onClick={() => setShowAadhar(!showAadhar)}
                style={{
                  width: '100%', maxHeight: showAadhar ? 'none' : '200px',
                  objectFit: 'cover', borderRadius: '12px', cursor: 'pointer',
                  border: '1px solid var(--border-subtle)', transition: 'max-height 0.3s ease'
                }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
                Click image to {showAadhar ? 'collapse' : 'expand'}
              </p>
            </>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface-elevated)', borderRadius: '12px' }}>
              No Aadhar photo uploaded
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {tenant.notes && (
        <div className="form-section" style={{ marginTop: '24px' }}>
          <div className="form-section-title">Notes</div>
          <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{tenant.notes}</p>
        </div>
      )}
    </div>
  );
};
