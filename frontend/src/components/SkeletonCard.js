import React from 'react';
import './SkeletonCard.css';

/**
 * SkeletonCard - Modern skeleton loading component for listing cards
 * Replaces traditional spinners with shimmer effect for better UX
 */
const SkeletonCard = () => {
  return (
    <div className="skeleton-card" aria-label="Loading...">
      <div className="skeleton-card-image skeleton" />
      <div className="skeleton-card-content">
        <div className="skeleton skeleton-card-title" />
        <div className="skeleton skeleton-card-price" />
        <div className="skeleton-card-details">
          <div className="skeleton skeleton-card-detail" />
          <div className="skeleton skeleton-card-detail short" />
        </div>
        <div className="skeleton-card-footer">
          <div className="skeleton skeleton-card-meta" />
          <div className="skeleton skeleton-card-meta short" />
        </div>
      </div>
    </div>
  );
};

/**
 * SkeletonGrid - Renders multiple skeleton cards in a grid
 */
export const SkeletonGrid = ({ count = 6 }) => {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};

/**
 * SkeletonText - Simple text skeleton
 */
export const SkeletonText = ({ width = '100%', height = '1rem', className = '' }) => {
  return (
    <div 
      className={`skeleton skeleton-text ${className}`}
      style={{ width, height }}
    />
  );
};

/**
 * SkeletonImage - Image placeholder skeleton
 */
export const SkeletonImage = ({ aspectRatio = '66.67%', className = '' }) => {
  return (
    <div 
      className={`skeleton skeleton-image ${className}`}
      style={{ paddingTop: aspectRatio }}
    />
  );
};

export default SkeletonCard;
