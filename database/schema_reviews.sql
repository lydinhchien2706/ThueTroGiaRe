-- Database Schema for Review System
-- Compatible with PostgreSQL

-- Drop existing tables if they exist (for clean migration)
-- Note: Only run these DROP statements if you want to reset the review tables
-- DROP TABLE IF EXISTS review_media CASCADE;
-- DROP TABLE IF EXISTS reviews CASCADE;

-- Reviews table (enhanced with role, type, status for moderation)
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'renter' CHECK (role IN ('admin', 'landlord', 'renter')),
    type VARCHAR(20) NOT NULL DEFAULT 'mixed' CHECK (type IN ('video', 'image', 'mixed')),
    title VARCHAR(255),
    content TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Review Media table (videos and images attached to reviews)
CREATE TABLE IF NOT EXISTS review_media (
    id SERIAL PRIMARY KEY,
    review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('video', 'image')),
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER, -- Duration in seconds (for videos)
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_room_id ON reviews(room_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_role ON reviews(role);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_is_featured ON reviews(is_featured);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_review_media_review_id ON review_media(review_id);
CREATE INDEX IF NOT EXISTS idx_review_media_type ON review_media(media_type);
