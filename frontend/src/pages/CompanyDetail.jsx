import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCompany, getReviews } from '../api';
import StarRating from '../components/StarRating';
import ReviewCard from '../components/ReviewCard';
import AddReviewModal from '../components/AddReviewModal';
import { assetUrl } from '../utils/assetUrl';
import './CompanyDetail.css';

function LogoPlaceholder({ name }) {
  const colors = ['#7C3AED', '#059669', '#D97706', '#DC2626', '#2563EB', '#0891B2'];
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className="detail-logo-placeholder" style={{ background: color }}>
      {initials}
    </div>
  );
}

export default function CompanyDetail() {
  const { id } = useParams();

  const [company, setCompany] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getCompany(id)
      .then((r) => setCompany(r.data))
      .catch(() => setError('Company not found'));
  }, [id]);

  const fetchReviews = useCallback(async (sortParam) => {
    try {
      const res = await getReviews(id, { sort: sortParam });
      setReviews(res.data.reviews);
      setAvgRating(res.data.avgRating);
      setTotal(res.data.total);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReviews(sort);
  }, [sort, fetchReviews]);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (error) return (
    <main className="container" style={{ paddingTop: '2rem' }}>
      <div className="alert alert-error">{error}</div>
      <Link to="/" className="btn btn-outline" style={{ marginTop: '1rem' }}>← Back</Link>
    </main>
  );
  if (!company) return null;

  const foundedDate = company.foundedOn
    ? new Date(company.foundedOn).toLocaleDateString('en-GB').replace(/\//g, '-')
    : '';

  return (
    <main className="detail-page container">
      {/* Company Header */}
      <div className="detail-header card">
        {/* Founded date at top-right */}
        {foundedDate && (
          <div className="detail-founded-date">
             Founded: {foundedDate}
          </div>
        )}
        <div className="detail-company-info">
          {company.logo ? (
            <img src={assetUrl(company.logo)} alt={company.name} className="detail-logo-img" />
          ) : (
            <LogoPlaceholder name={company.name} />
          )}
          <div className="detail-company-details">
            <h1 className="detail-company-name">{company.name}</h1>
            <p className="detail-location">
              <img src="/akar-icons_location.png" alt="Location" className="detail-location-icon" />
              {company.location}, {company.city}
            </p>
            {/* {company.description && (
              <p className="detail-description">{company.description}</p>
            )} */}
            <div className="detail-rating-row">
              <div className="detail-avg-rating">
                <span className="detail-avg-rating-num">{avgRating > 0 ? avgRating : '—'}</span>
                <StarRating rating={avgRating} size={20} />
                <span className="detail-review-count">{total} Review{total !== 1 ? 's' : ''}</span>
              </div>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                + Add Review
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <div className="reviews-header">
          <div className="reviews-controls">
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="no-reviews">
            <p>No reviews yet. Be the first!</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Write a Review
            </button>
          </div>
        ) : (
          <div className="reviews-list">
            {reviews.map((r) => (
              <ReviewCard key={r._id} review={r} />
            ))}
          </div>
        )}
      </div>

      <Link to="/" className="back-link">← Back to companies</Link>

      {showModal && (
        <AddReviewModal
          companyId={id}
          onClose={() => setShowModal(false)}
          onSuccess={() => fetchReviews(sort)}
        />
      )}
    </main>
  );
}