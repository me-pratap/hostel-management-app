import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Upload } from 'lucide-react';
import apiClient from '../api/client';

export const AddTenant = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [aadharPreview, setAadharPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [aadharFile, setAadharFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    contact_number: '',
    dob: '',
    gender: 'male',
    blood_group: '',
    aadhar_number: '',
    emergency_contact_name: '',
    emergency_contact_number: '',
    local_guardian_name: '',
    local_guardian_contact: '',
    home_address: '',
    room_id: '',
    monthly_rent_amount: '',
    rent_due_day: '5',
    police_verification_status: 'pending'
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms-list'],
    queryFn: async () => {
      const res = await apiClient.get('/rooms');
      return res.data;
    }
  });

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
    setLoading(true);
    try {
      const payload: any = {
        ...formData,
        monthly_rent_amount: parseFloat(formData.monthly_rent_amount),
        rent_due_day: parseInt(formData.rent_due_day)
      };

      if (photoFile) {
        payload.photo_url = await uploadFile(photoFile);
      }
      if (aadharFile) {
        payload.aadhar_photo_url = await uploadFile(aadharFile);
      }

      await apiClient.post('/tenants', payload);
      await queryClient.invalidateQueries({ queryKey: ['tenants'] });
      navigate('/tenants');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to add tenant');
      setLoading(false);
    }
  };

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
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem' }}>Onboard New Tenant</h1>
        <p style={{ color: 'var(--text-muted)' }}>Enter the resident's full details below to complete onboarding.</p>
      </div>

      <form onSubmit={handleSubmit}>

        {/* SECTION 0: Photos */}
        <div className="form-section">
          <div className="form-section-title">Photos</div>
          <div className="grid-2-cols">
            <PhotoUploadBox label="Profile Photo" preview={photoPreview} onChange={(e) => handleFileChange(e, 'photo')} />
            <PhotoUploadBox label="Aadhar Card Photo" preview={aadharPreview} onChange={(e) => handleFileChange(e, 'aadhar')} />
          </div>
        </div>
        
        {/* SECTION 1: Personal Info */}
        <div className="form-section">
          <div className="form-section-title">1. Personal Information</div>
          <div className="grid-2-cols">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Full Name *</label>
              <input required name="full_name" value={formData.full_name} onChange={handleChange} placeholder="e.g. John Doe" />
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
          </div>
        </div>

        {/* SECTION 2: Contacts */}
        <div className="form-section">
          <div className="form-section-title">2. Contact & Emergency</div>
          <div className="grid-2-cols">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Primary Contact Number *</label>
              <input required name="contact_number" value={formData.contact_number} onChange={handleChange} placeholder="+91 XXXXX XXXXX" />
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
              <label>Local Guardian Name</label>
              <input name="local_guardian_name" value={formData.local_guardian_name} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Local Guardian Contact</label>
              <input name="local_guardian_contact" value={formData.local_guardian_contact} onChange={handleChange} />
            </div>
            
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Home Address</label>
              <textarea name="home_address" value={formData.home_address} onChange={handleChange} rows={3} placeholder="Full permanent address" />
            </div>
          </div>
        </div>

        {/* SECTION 3: Hostel Details */}
        <div className="form-section">
          <div className="form-section-title">3. Hostel & Rent Details</div>
          <div className="grid-2-cols">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Assign Room *</label>
              <select required name="room_id" value={formData.room_id} onChange={handleChange}>
                <option value="" disabled>Select a room</option>
                {rooms.filter((r: any) => r.room_type === 'rent').map((r: any) => (
                  <option key={r.room_id} value={r.room_id}>
                    Room {r.room_number} (Floor: {r.floor})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Monthly Rent Amount *</label>
              <input required type="number" name="monthly_rent_amount" value={formData.monthly_rent_amount} onChange={handleChange} placeholder="e.g. 5000" />
            </div>

            <div className="form-group">
              <label>Rent Due Day (1-31)</label>
              <input required type="number" min="1" max="31" name="rent_due_day" value={formData.rent_due_day} onChange={handleChange} />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Police Verification Status</label>
              <select name="police_verification_status" value={formData.police_verification_status} onChange={handleChange}>
                <option value="pending">Pending</option>
                <option value="done">Done</option>
                <option value="not_required">Not Required</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <button type="button" onClick={() => navigate('/tenants')} className="btn-icon" style={{ width: 'auto', padding: '0 24px', borderRadius: 'var(--radius-full)' }}>Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '16px 40px', fontSize: '1.125rem' }}>
            {loading ? 'Onboarding...' : 'Complete Onboarding'}
          </button>
        </div>
      </form>
    </div>
  );
};
