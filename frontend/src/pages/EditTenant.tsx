import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import apiClient, { getImageUrl } from '../api/client';

export const EditTenant = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [aadharPreview, setAadharPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [aadharFile, setAadharFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    contact_number: '',
    alternate_contact_number: '',
    dob: '',
    gender: 'male',
    blood_group: '',
    aadhar_number: '',
    emergency_contact_name: '',
    emergency_contact_number: '',
    parents_contact_number: '',
    local_guardian_name: '',
    local_guardian_contact: '',
    home_address: '',
    occupation_or_work: '',
    vehicle_number: '',
    room_id: '',
    bed_slot_number: '',
    monthly_rent_amount: '',
    rent_due_day: '5',
    police_verification_status: 'pending',
    payment_mode_preference: '',
    notes: ''
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [tenantRes, roomsRes] = await Promise.all([
          apiClient.get(`/tenants/${id}`),
          apiClient.get('/rooms')
        ]);
        const t = tenantRes.data;
        setRooms(roomsRes.data);
        setFormData({
          full_name: t.full_name || '',
          contact_number: t.contact_number || '',
          alternate_contact_number: t.alternate_contact_number || '',
          dob: t.dob || '',
          gender: t.gender || 'male',
          blood_group: t.blood_group || '',
          aadhar_number: t.aadhar_number || '',
          emergency_contact_name: t.emergency_contact_name || '',
          emergency_contact_number: t.emergency_contact_number || '',
          parents_contact_number: t.parents_contact_number || '',
          local_guardian_name: t.local_guardian_name || '',
          local_guardian_contact: t.local_guardian_contact || '',
          home_address: t.home_address || '',
          occupation_or_work: t.occupation_or_work || '',
          vehicle_number: t.vehicle_number || '',
          room_id: t.room_id || '',
          bed_slot_number: t.bed_slot_number?.toString() || '',
          monthly_rent_amount: t.monthly_rent_amount?.toString() || '',
          rent_due_day: t.rent_due_day?.toString() || '5',
          police_verification_status: t.police_verification_status || 'pending',
          payment_mode_preference: t.payment_mode_preference || '',
          notes: t.notes || ''
        });
        if (t.photo_url) setPhotoPreview(getImageUrl(t.photo_url));
        if (t.aadhar_photo_url) setAadharPreview(getImageUrl(t.aadhar_photo_url));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'aadhar') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    if (type === 'photo') {
      setPhotoFile(file);
      setPhotoPreview(preview);
    } else {
      setAadharFile(file);
      setAadharPreview(preview);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await apiClient.post('/tenants/upload-photo', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = { ...formData };

      // Upload new photos if selected
      if (photoFile) {
        payload.photo_url = await uploadFile(photoFile);
      }
      if (aadharFile) {
        payload.aadhar_photo_url = await uploadFile(aadharFile);
      }

      // Convert numeric fields
      if (payload.monthly_rent_amount) payload.monthly_rent_amount = parseFloat(payload.monthly_rent_amount);
      if (payload.rent_due_day) payload.rent_due_day = parseInt(payload.rent_due_day);
      if (payload.bed_slot_number) payload.bed_slot_number = parseInt(payload.bed_slot_number);

      // Remove empty strings (backend rejects them as "no fields to update")
      Object.keys(payload).forEach(key => {
        if (payload[key] === '') delete payload[key];
      });

      await apiClient.put(`/tenants/${id}`, payload);
      navigate(`/tenants/${id}`);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update');
      setSaving(false);
    }
  };

  if (loading) return <div style={{ color: 'var(--text-muted)' }}>Loading...</div>;

  const PhotoUploadBox = ({ label, preview, onChange }: { label: string; preview: string | null; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <div className="form-group">
      <label>{label}</label>
      <div style={{
        border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-md)',
        padding: '20px', textAlign: 'center', cursor: 'pointer', position: 'relative',
        background: 'var(--bg-surface-elevated)', transition: 'all 0.3s ease'
      }}>
        {preview ? (
          <img src={preview} alt={label} style={{ maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }} />
        ) : (
          <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Upload size={24} />
            <span style={{ fontSize: '0.875rem' }}>Click to upload</span>
          </div>
        )}
        <input type="file" accept="image/*" onChange={onChange} style={{
          position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer'
        }} />
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button onClick={() => navigate(`/tenants/${id}`)} className="btn-icon" style={{ width: 'auto', borderRadius: 'var(--radius-full)', padding: '0 20px', gap: '8px', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={18} /> Back
        </button>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '2rem' }}>Edit Tenant</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Update {formData.full_name}'s profile details.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Photos */}
        <div className="form-section">
          <div className="form-section-title">Photos</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <PhotoUploadBox label="Profile Photo" preview={photoPreview} onChange={(e) => handleFileChange(e, 'photo')} />
            <PhotoUploadBox label="Aadhar Card Photo" preview={aadharPreview} onChange={(e) => handleFileChange(e, 'aadhar')} />
          </div>
        </div>

        {/* Personal Information */}
        <div className="form-section">
          <div className="form-section-title">Personal Information</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Full Name *</label>
              <input required name="full_name" value={formData.full_name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Blood Group</label>
              <input name="blood_group" value={formData.blood_group} onChange={handleChange} placeholder="e.g. O+" />
            </div>
            <div className="form-group">
              <label>Aadhar Number</label>
              <input name="aadhar_number" value={formData.aadhar_number} onChange={handleChange} placeholder="12-digit number" />
            </div>
            <div className="form-group">
              <label>Occupation / Work</label>
              <input name="occupation_or_work" value={formData.occupation_or_work} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Vehicle Number</label>
              <input name="vehicle_number" value={formData.vehicle_number} onChange={handleChange} placeholder="e.g. KA-01-AB-1234" />
            </div>
          </div>
        </div>

        {/* Contacts */}
        <div className="form-section">
          <div className="form-section-title">Contact & Emergency</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <div className="form-group">
              <label>Primary Contact *</label>
              <input required name="contact_number" value={formData.contact_number} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Alternate Contact</label>
              <input name="alternate_contact_number" value={formData.alternate_contact_number} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Emergency Contact Name</label>
              <input name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Emergency Contact Number</label>
              <input name="emergency_contact_number" value={formData.emergency_contact_number} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Parents Contact</label>
              <input name="parents_contact_number" value={formData.parents_contact_number} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Local Guardian Name</label>
              <input name="local_guardian_name" value={formData.local_guardian_name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Local Guardian Contact</label>
              <input name="local_guardian_contact" value={formData.local_guardian_contact} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Home Address</label>
              <textarea name="home_address" value={formData.home_address} onChange={handleChange} rows={3} />
            </div>
          </div>
        </div>

        {/* Hostel Details */}
        <div className="form-section">
          <div className="form-section-title">Hostel & Rent</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Assign Room *</label>
              <select required name="room_id" value={formData.room_id} onChange={handleChange}>
                <option value="" disabled>Select a room</option>
                {rooms.filter(r => r.room_type === 'rent').map(r => (
                  <option key={r.room_id} value={r.room_id}>
                    Room {r.room_number} (Floor: {r.floor})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Bed Slot Number</label>
              <input type="number" name="bed_slot_number" value={formData.bed_slot_number} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Monthly Rent *</label>
              <input required type="number" name="monthly_rent_amount" value={formData.monthly_rent_amount} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Rent Due Day (1-31)</label>
              <input type="number" min="1" max="31" name="rent_due_day" value={formData.rent_due_day} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Police Verification</label>
              <select name="police_verification_status" value={formData.police_verification_status} onChange={handleChange}>
                <option value="pending">Pending</option>
                <option value="done">Done</option>
                <option value="not_required">Not Required</option>
              </select>
            </div>
            <div className="form-group">
              <label>Payment Mode Preference</label>
              <input name="payment_mode_preference" value={formData.payment_mode_preference} onChange={handleChange} placeholder="e.g. UPI, Cash" />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <button type="button" onClick={() => navigate(`/tenants/${id}`)} className="btn-icon" style={{ width: 'auto', padding: '0 24px', borderRadius: 'var(--radius-full)' }}>Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '16px 40px', fontSize: '1.125rem' }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
