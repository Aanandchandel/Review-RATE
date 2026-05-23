import React from 'react';
import './StarRating.css';

export default function StarRating({ rating = 0, onChange, size = 18 }) {
  const stars = [1, 2, 3, 4, 5];

  if (onChange) {
    return (
      <div className="stars-interactive" role="group" aria-label="Rating">
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`star-btn ${star <= rating ? 'filled' : ''}`}
            style={{ fontSize: size }}
            aria-label={`${star} star`}
          >
            &#9733;
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="stars-display" aria-label={`${rating} out of 5`}>
      {stars.map((star) => {
        const filled = star <= Math.floor(rating);
        const half = !filled && star - 0.5 <= rating;
        return (
          <span
            key={star}
            className={`star ${filled ? 'filled' : half ? 'half' : 'empty'}`}
            style={{ fontSize: size }}
          >
            &#9733;
          </span>
        );
      })}
    </div>
  );
}
