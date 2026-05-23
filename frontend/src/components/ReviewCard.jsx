import React, { useState } from 'react';
import StarRating from './StarRating';
import { likeReview } from '../api';
import './ReviewCard.css';

export default function ReviewCard({ review }) {
  const [likes, setLikes] = useState(review.likes || 0);
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    if (liked) return;
    try {
      const res = await likeReview(review._id);
      setLikes(res.data.likes);
      setLiked(true);
    } catch {
      // ignore
    }
  };

  const date = new Date(review.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Determine avatar content
  const hasProfileImage = review.user && review.user.profileUrl;
  const displayName = review.fullName; // or review.user?.name if you prefer

  return (
    <div className="review-card card">
      <div className="review-card-header">
        {/* Show profile image if available, otherwise fallback to initials */}
        {hasProfileImage ? (
          <img
            src={review.user.profileUrl}
            alt={displayName}
            className="reviewer-avatar-img"
          />
        ) : (
          <div className="reviewer-avatar">
            {displayName ? displayName[0].toUpperCase() : '?'}
          </div>
        )}
        <div className="reviewer-meta">
          <span className="reviewer-name">{displayName}</span>
          <span className="review-date">{date}</span>
        </div>
        <div className="review-rating-badge">
          <StarRating rating={review.rating} size={15} />
        </div>
      </div>

      {/* <h4 className="review-subject">{review.subject}</h4> */}
      <p className="review-text">{review.reviewText}</p>

      {/* The like/share section is commented out as in your original */}
    </div>
  );
}