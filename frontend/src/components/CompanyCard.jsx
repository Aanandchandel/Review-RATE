import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt } from 'react-icons/fa'; // ← location icon
import StarRating from './StarRating';
import { assetUrl } from '../utils/assetUrl';
import './CompanyCard.css';

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
    <div className="company-logo-placeholder" style={{ background: color }}>
      {initials}
    </div>
  );
}

export default function CompanyCard({ company }) {
  const navigate = useNavigate();
  const { _id, name, logo, location, city, foundedOn, avgRating, reviewCount } = company;

  const foundedDate = foundedOn
    ? new Date(foundedOn).toLocaleDateString('en-GB').replace(/\//g, '-')
    : '';

  return (
    <div className="company-card card">
      <div className="company-card-logo">
        {logo ? (
          <img src={assetUrl(logo)} alt={name} className="company-logo-img" />
        ) : (
          <LogoPlaceholder name={name} />
        )}
      </div>

      <div className="company-card-body">
        <h3 className="company-name">{name}</h3>
        <p className="company-location">
          <span className="pin-icon">
            <FaMapMarkerAlt /> {/* ← replaced location emoji */}
          </span>
          {location}, {city}
        </p>
        <div className="company-rating-row">
          <span className="rating-value">{avgRating > 0 ? avgRating : '—'}</span>
          <StarRating rating={avgRating} size={16} />
          <span className="review-count">{reviewCount} Review{reviewCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="company-card-actions">
        <span className="founded-date">
          Founded on {foundedDate}
        </span>
        <button className="btn btn-dark btn-sm" onClick={() => navigate(`/company/${_id}`)}>
          Detail Review
        </button>
      </div>
    </div>
  );
}