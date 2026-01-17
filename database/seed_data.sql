-- Sample data for testing
-- Password for all users: password123

-- Insert sample users
INSERT INTO users (name, email, phone, password_hash) VALUES
('Nguyễn Văn A', 'nguyenvana@example.com', '0901234567', '$2a$10$YourHashedPasswordHere'),
('Trần Thị B', 'tranthib@example.com', '0912345678', '$2a$10$YourHashedPasswordHere'),
('Lê Văn C', 'levanc@example.com', '0923456789', '$2a$10$YourHashedPasswordHere');

-- Insert sample listings
INSERT INTO listings (title, description, price, area, type, address, province_id, district_id, ward_id, user_id) VALUES
('Phòng trọ giá rê gần ĐH Bách Khoa', 'Phòng trọ sạch sẽ, an ninh tốt, gần trường học, chợ, siêu thị. Đầy đủ tiện nghi: giường, tủ, máy lạnh, nóng lạnh.', 2500000, 25, 'phong-tro', '123 Lý Thường Kiệt, Phường Bến Nghé', 2, 21, 45, 1),
('Nhà nguyên căn 3 tầng cho thuê', 'Nhà nguyên căn mới xây, đầy đủ nội thất, 3 phòng ngủ, 2 WC, ban công rộng. Khu vực yên tĩnh, an ninh.', 15000000, 120, 'nha-nguyen-can', '456 Nguyễn Huệ, Phường Bến Thành', 2, 21, 46, 1),
('Căn hộ mini cao cấp', 'Căn hộ mini đầy đủ tiện nghi, có thang máy, bảo vệ 24/7. Gần các trung tâm thương mại.', 5000000, 35, 'can-ho', '789 Trần Hưng Đạo, Phường Cô Giang', 2, 21, 47, 2),
('Phòng trọ sinh viên giá rẻ', 'Phòng trọ dành cho sinh viên, giá rẻ, gần các trường đại học. Có ban công, cửa sổ thoáng mát.', 1800000, 20, 'phong-tro', '321 Điện Biên Phủ, Phường Điện Biên', 1, 11, 50, 2),
('Nhà phố cho thuê mặt tiền', 'Nhà phố mặt tiền đường lớn, thích hợp kinh doanh hoặc ở. 4 tầng, 5 phòng ngủ.', 25000000, 200, 'nha-nguyen-can', '555 Kim Mã, Phường Kim Mã', 1, 11, 53, 3),
('Căn hộ chung cư 2 phòng ngủ', 'Căn hộ chung cư view đẹp, đầy đủ nội thất, 2 phòng ngủ, 2 WC. Có bể bơi, gym.', 8000000, 75, 'can-ho', '888 Nguyễn Trãi, Phường Đội Cấn', 1, 11, 51, 3);

-- Insert sample images for listings
INSERT INTO listing_images (listing_id, image_url, is_primary) VALUES
(1, 'https://via.placeholder.com/800x600.png?text=Phong+Tro+1', true),
(1, 'https://via.placeholder.com/800x600.png?text=Phong+Tro+1+Image+2', false),
(2, 'https://via.placeholder.com/800x600.png?text=Nha+Nguyen+Can+1', true),
(2, 'https://via.placeholder.com/800x600.png?text=Nha+Nguyen+Can+1+Image+2', false),
(3, 'https://via.placeholder.com/800x600.png?text=Can+Ho+1', true),
(4, 'https://via.placeholder.com/800x600.png?text=Phong+Tro+2', true),
(5, 'https://via.placeholder.com/800x600.png?text=Nha+Pho+1', true),
(6, 'https://via.placeholder.com/800x600.png?text=Can+Ho+2', true);
