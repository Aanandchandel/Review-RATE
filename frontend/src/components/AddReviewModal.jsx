import React, { useState, useEffect } from 'react';
import { createReview } from '../api';
import './AddReviewModal.css';

const RATING_LABELS = { 1: 'Terrible', 2: 'Poor', 3: 'Average', 4: 'Satisfied', 5: 'Excellent' };
const INITIAL = { fullName: '', subject: '', reviewText: '', rating: 0 };

export default function AddReviewModal({ companyId, onClose, onSuccess }) {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Required';
    if (!form.subject.trim()) errs.subject = 'Required';
    if (!form.reviewText.trim()) errs.reviewText = 'Required';
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
      await createReview(companyId, form);
      onSuccess();
      onClose();
    } catch (err) {
      setServerError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-label="Add Review">
        {/* decorative blobs */}
        <span className="modal-blob modal-blob-1" />
        <span className="modal-blob modal-blob-2" />

        <button className="modal-close" onClick={onClose} aria-label="Close">&#10005;</button>

        <h2 className="modal-title">Add Review</h2>

        {serverError && <p className="modal-error">{serverError}</p>}

        <form onSubmit={handleSubmit} noValidate className="modal-form">
          <div className="modal-field">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter"
              value={form.fullName}
              onChange={update('fullName')}
            />
            {errors.fullName && <span className="field-error">{errors.fullName}</span>}
          </div>

          <div className="modal-field">
            <label>Subject</label>
            <input
              type="text"
              placeholder="Enter"
              value={form.subject}
              onChange={update('subject')}
            />
            {errors.subject && <span className="field-error">{errors.subject}</span>}
          </div>

          <div className="modal-field">
            <label>Enter your Review</label>
            <textarea
              placeholder="Description"
              value={form.reviewText}
              onChange={update('reviewText')}
              rows={4}
            />
            {errors.reviewText && <span className="field-error">{errors.reviewText}</span>}
          </div>

          <div className="modal-field">
            <label className="rating-heading">Rating</label>
            <div className="stars-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`modal-star ${star <= form.rating ? 'filled' : ''}`}
                  onClick={() => setForm((f) => ({ ...f, rating: star }))}
                  aria-label={`${star} star`}
                >
                  &#9733;
                </button>
              ))}
              {form.rating > 0 && (
                <span className="rating-label">{RATING_LABELS[form.rating]}</span>
              )}
            </div>
            {errors.rating && <span className="field-error">{errors.rating}</span>}
          </div>

          <button type="submit" className="modal-save-btn" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
}
