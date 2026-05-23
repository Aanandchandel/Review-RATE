import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCompany } from '../api';
import './FormPage.css';

const INITIAL = { name: '', description: '', location: '', city: '', foundedOn: '' };

export default function AddCompany() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogo(file);
    setPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Company name is required';
    if (!form.location.trim()) errs.location = 'Location is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.foundedOn) errs.foundedOn = 'Founded date is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    setServerError('');
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (logo) data.append('logo', logo);
      await createCompany(data);
      navigate('/');
    } catch (err) {
      setServerError(err.response?.data?.error || 'Failed to create company');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="form-page container">
      <div className="form-card card">
        <h1 className="form-title">Add Company</h1>
        <p className="form-subtitle">Fill in the details to register a new company profile.</p>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit} className="company-form" noValidate>
          <div className="form-row">
            <div className="form-group">
              <label>Company Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={update('name')}
                placeholder="e.g. Graffersid Web and App"
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                value={form.city}
                onChange={update('city')}
                placeholder="e.g. Indore"
              />
              {errors.city && <span className="form-error">{errors.city}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Address / Location *</label>
            <input
              type="text"
              value={form.location}
              onChange={update('location')}
              placeholder="e.g. 816, Shekhar Central, Manorama Ganj"
            />
            {errors.location && <span className="form-error">{errors.location}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Founded On *</label>
              <input
                type="date"
                value={form.foundedOn}
                onChange={update('foundedOn')}
              />
              {errors.foundedOn && <span className="form-error">{errors.foundedOn}</span>}
            </div>

            <div className="form-group">
              <label>Logo (optional)</label>
              <input type="file" accept="image/*" onChange={handleLogo} />
              {preview && (
                <img src={preview} alt="preview" className="logo-preview" />
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={update('description')}
              placeholder="Brief description of the company…"
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Add Company'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
