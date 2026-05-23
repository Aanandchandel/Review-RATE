import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createReview, getCompany } from '../api';
import StarRating from '../components/StarRating';
import './FormPage.css';

const INITIAL = { fullName: '', subject: '', reviewText: '', rating: 0 };

export default function AddReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    getCompany(id).then((r) => setCompany(r.data)).catch(() => {});
  }, [id]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.subject.trim()) errs.subject = 'Subject is required';
    if (!form.reviewText.trim()) errs.reviewText = 'Review text is required';
    if (!form.rating) errs.rating = 'Please select a rating';
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
      await createReview(id, form);
      navigate(`/company/${id}`);
    } catch (err) {
      setServerError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="form-page container">
      <div className="form-card card">
        <h1 className="form-title">Add Review</h1>
        {company && (
          <p className="form-subtitle">
            Reviewing: <strong>{company.name}</strong>
          </p>
        )}

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit} className="review-form" noValidate>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                value={form.fullName}
                onChange={update('fullName')}
                placeholder="Your full name"
              />
              {errors.fullName && <span className="form-error">{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label>Subject *</label>
              <input
                type="text"
                value={form.subject}
                onChange={update('subject')}
                placeholder="Summary of your review"
              />
              {errors.subject && <span className="form-error">{errors.subject}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Rating *</label>
            <div className="rating-label-row">
              <StarRating
                rating={form.rating}
                onChange={(r) => setForm((f) => ({ ...f, rating: r }))}
                size={28}
              />
              {form.rating > 0 && (
                <span className="rating-hint">{form.rating} / 5</span>
              )}
            </div>
            {errors.rating && <span className="form-error">{errors.rating}</span>}
          </div>

          <div className="form-group">
            <label>Review *</label>
            <textarea
              value={form.reviewText}
              onChange={update('reviewText')}
              placeholder="Share your experience with this company…"
              rows={5}
            />
            {errors.reviewText && <span className="form-error">{errors.reviewText}</span>}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate(`/company/${id}`)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
