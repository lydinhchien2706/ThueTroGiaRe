-- Seed data for Vietnamese locations (sample data)
-- This includes major cities and some districts

-- Insert Provinces
INSERT INTO locations (id, name, parent_id, type) VALUES
(1, 'Hà Nội', NULL, 'province'),
(2, 'Hồ Chí Minh', NULL, 'province'),
(3, 'Đà Nẵng', NULL, 'province'),
(4, 'Hải Phòng', NULL, 'province'),
(5, 'Cần Thơ', NULL, 'province'),
(6, 'Bình Dương', NULL, 'province'),
(7, 'Đồng Nai', NULL, 'province'),
(8, 'Khánh Hòa', NULL, 'province'),
(9, 'Lâm Đồng', NULL, 'province'),
(10, 'Thừa Thiên Huế', NULL, 'province');

-- Insert Districts for Hà Nội
INSERT INTO locations (id, name, parent_id, type) VALUES
(11, 'Ba Đình', 1, 'district'),
(12, 'Hoàn Kiếm', 1, 'district'),
(13, 'Đống Đa', 1, 'district'),
(14, 'Hai Bà Trưng', 1, 'district'),
(15, 'Cầu Giấy', 1, 'district'),
(16, 'Thanh Xuân', 1, 'district'),
(17, 'Tây Hồ', 1, 'district'),
(18, 'Long Biên', 1, 'district'),
(19, 'Hoàng Mai', 1, 'district'),
(20, 'Nam Từ Liêm', 1, 'district');

-- Insert Districts for Hồ Chí Minh
INSERT INTO locations (id, name, parent_id, type) VALUES
(21, 'Quận 1', 2, 'district'),
(22, 'Quận 2', 2, 'district'),
(23, 'Quận 3', 2, 'district'),
(24, 'Quận 4', 2, 'district'),
(25, 'Quận 5', 2, 'district'),
(26, 'Quận 6', 2, 'district'),
(27, 'Quận 7', 2, 'district'),
(28, 'Quận 8', 2, 'district'),
(29, 'Quận 10', 2, 'district'),
(30, 'Quận 11', 2, 'district'),
(31, 'Quận 12', 2, 'district'),
(32, 'Bình Thạnh', 2, 'district'),
(33, 'Tân Bình', 2, 'district'),
(34, 'Tân Phú', 2, 'district'),
(35, 'Phú Nhuận', 2, 'district'),
(36, 'Thủ Đức', 2, 'district'),
(37, 'Gò Vấp', 2, 'district'),
(38, 'Bình Tân', 2, 'district');

-- Insert Districts for Đà Nẵng
INSERT INTO locations (id, name, parent_id, type) VALUES
(39, 'Hải Châu', 3, 'district'),
(40, 'Thanh Khê', 3, 'district'),
(41, 'Sơn Trà', 3, 'district'),
(42, 'Ngũ Hành Sơn', 3, 'district'),
(43, 'Liên Chiểu', 3, 'district'),
(44, 'Cẩm Lệ', 3, 'district');

-- Insert sample Wards for Quận 1 (HCM)
INSERT INTO locations (id, name, parent_id, type) VALUES
(45, 'Phường Bến Nghé', 21, 'ward'),
(46, 'Phường Bến Thành', 21, 'ward'),
(47, 'Phường Cô Giang', 21, 'ward'),
(48, 'Phường Nguyễn Thái Bình', 21, 'ward'),
(49, 'Phường Đa Kao', 21, 'ward');

-- Insert sample Wards for Ba Đình (Hà Nội)
INSERT INTO locations (id, name, parent_id, type) VALUES
(50, 'Phường Điện Biên', 11, 'ward'),
(51, 'Phường Đội Cấn', 11, 'ward'),
(52, 'Phường Ngọc Hà', 11, 'ward'),
(53, 'Phường Kim Mã', 11, 'ward'),
(54, 'Phường Giảng Võ', 11, 'ward');

-- Reset sequence
SELECT setval('locations_id_seq', (SELECT MAX(id) FROM locations));
