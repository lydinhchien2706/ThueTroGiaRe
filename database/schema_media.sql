-- Database Schema for Media Review System
-- Compatible with PostgreSQL

-- Media type enum for classification
-- Types: image, video
-- Roles: owner (landlord), user (tenant/reviewer)

-- Listing Videos table (for owner/landlord uploaded videos)
CREATE TABLE IF NOT EXISTS listing_videos (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration_seconds INTEGER,
    is_hero BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    room_tag VARCHAR(50) CHECK (room_tag IN ('bedroom', 'bathroom', 'kitchen', 'balcony', 'living_room', 'entrance', 'other')),
    visibility_status VARCHAR(20) DEFAULT 'visible' CHECK (visibility_status IN ('visible', 'hidden', 'pending')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Listing Media table (enhanced unified media with metadata)
CREATE TABLE IF NOT EXISTS listing_media (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    uploader_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('image', 'video')),
    media_role VARCHAR(20) NOT NULL CHECK (media_role IN ('owner_media', 'user_review_media')),
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration_seconds INTEGER,
    display_order INTEGER DEFAULT 0,
    room_tag VARCHAR(50) CHECK (room_tag IN ('bedroom', 'bathroom', 'kitchen', 'balcony', 'living_room', 'entrance', 'other')),
    like_count INTEGER DEFAULT 0,
    report_count INTEGER DEFAULT 0,
    visibility_status VARCHAR(20) DEFAULT 'visible' CHECK (visibility_status IN ('visible', 'hidden', 'pending', 'reported')),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Media Likes table (track who liked what)
CREATE TABLE IF NOT EXISTS media_likes (
    id SERIAL PRIMARY KEY,
    media_id INTEGER NOT NULL REFERENCES listing_media(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(media_id, user_id)
);

-- Media Reports table (for moderation)
CREATE TABLE IF NOT EXISTS media_reports (
    id SERIAL PRIMARY KEY,
    media_id INTEGER NOT NULL REFERENCES listing_media(id) ON DELETE CASCADE,
    reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    reviewed_by INTEGER REFERENCES users(id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Review Images table (images attached to reviews)
CREATE TABLE IF NOT EXISTS review_images (
    id SERIAL PRIMARY KEY,
    review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_listing_videos_listing_id ON listing_videos(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_videos_is_hero ON listing_videos(is_hero);
CREATE INDEX IF NOT EXISTS idx_listing_media_listing_id ON listing_media(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_media_uploader_id ON listing_media(uploader_id);
CREATE INDEX IF NOT EXISTS idx_listing_media_type ON listing_media(media_type);
CREATE INDEX IF NOT EXISTS idx_listing_media_role ON listing_media(media_role);
CREATE INDEX IF NOT EXISTS idx_listing_media_visibility ON listing_media(visibility_status);
CREATE INDEX IF NOT EXISTS idx_media_likes_media_id ON media_likes(media_id);
CREATE INDEX IF NOT EXISTS idx_media_likes_user_id ON media_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_media_reports_media_id ON media_reports(media_id);
CREATE INDEX IF NOT EXISTS idx_media_reports_status ON media_reports(status);
CREATE INDEX IF NOT EXISTS idx_review_images_review_id ON review_images(review_id);
