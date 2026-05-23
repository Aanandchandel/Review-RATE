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

  return (
    <div className="review-card card">
      <div className="review-card-header">
        <div className="reviewer-avatar">{review.fullName[0].toUpperCase()}</div>
        <div className="reviewer-meta">
          <span className="reviewer-name">{review.fullName}</span>
          <span className="review-date">{date}</span>
        </div>
        <div className="review-rating-badge">
          <StarRating rating={review.rating} size={15} />
        </div>
      </div>

      {/* <h4 className="review-subject">{review.subject}</h4> */}
      <p className="review-text">{review.reviewText}</p>

      {/* <div className="review-actions">
        <button
          className={`like-btn ${liked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={liked}
          title={liked ? 'Already liked' : 'Like this review'}
        >
          <span>&#128077;</span>
          <span>{likes}</span>
        </button>
        <button
          className="share-btn"
          onClick={() => navigator.clipboard?.writeText(window.location.href)}
          title="Copy link"
        >
          <span>&#128279;</span>
          <span>Share</span>
        </button>
      </div> */}
    </div>
  );
}
