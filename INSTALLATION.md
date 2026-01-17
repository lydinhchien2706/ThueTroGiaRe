# Website Thuê Trọ Giá Rẻ - Hướng Dẫn Cài Đặt & Sử Dụng

Website tìm kiếm và đăng tin cho thuê phòng trọ, nhà nguyên căn, căn hộ được xây dựng hoàn chỉnh theo roadmap.

## Tính Năng Đã Hoàn Thành

### ✅ Backend (REST API)
- Authentication (Đăng ký, Đăng nhập, JWT)
- CRUD Listings (Tạo, Đọc, Cập nhật, Xóa tin đăng)
- API Locations (Tỉnh, Quận/Huyện, Phường/Xã)
- Upload & quản lý hình ảnh
- Phân quyền user/chủ tin
- Tìm kiếm & filter tin đăng
- Phân trang

### ✅ Frontend (React SPA)
- Trang chủ với form tìm kiếm
- Trang danh sách kết quả với filter
- Trang chi tiết tin đăng
- Đăng ký / Đăng nhập
- Dashboard quản lý tin đăng
- Form đăng tin cho thuê
- Responsive design

### ✅ Database (PostgreSQL)
- Schema hoàn chỉnh
- Seed data locations (Việt Nam)
- Sample data để test

## Cấu Trúc Dự Án

```
ThueTroGiaRe/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/         # Database config
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth middleware
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # API routes
│   │   └── server.js       # Entry point
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── README.md
├── frontend/               # React SPA
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # Auth context
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── App.js
│   │   └── index.js
│   ├── .env
│   ├── package.json
│   └── public/
├── database/              # SQL files
│   ├── schema.sql
│   ├── seed_locations.sql
│   └── seed_data.sql
└── README.md
```

## Yêu Cầu Hệ Thống

- Node.js >= 14.x
- PostgreSQL >= 12.x
- npm hoặc yarn
- Git

## Cài Đặt

### 1. Clone Repository

```bash
git clone https://github.com/quangha2706-crypto/ThueTroGiaRe.git
cd ThueTroGiaRe
```

### 2. Cài Đặt Database

#### Tạo Database

```bash
# Sử dụng psql
createdb thuetrodb

# Hoặc trong psql
psql -U postgres
CREATE DATABASE thuetrodb;
```

#### Chạy Schema và Seed Data

```bash
psql -U postgres -d thuetrodb -f database/schema.sql
psql -U postgres -d thuetrodb -f database/seed_locations.sql
psql -U postgres -d thuetrodb -f database/seed_data.sql
```

### 3. Cài Đặt Backend

```bash
cd backend
npm install

# Tạo file .env
cp .env.example .env
```

Chỉnh sửa file `.env`:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=thuetrodb
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

### 4. Cài Đặt Frontend

```bash
cd ../frontend
npm install
```

File `.env` đã được tạo sẵn với:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Chạy Ứng Dụng

### 1. Chạy Backend (Terminal 1)

```bash
cd backend
npm run dev
```

Backend sẽ chạy tại: `http://localhost:5000`

### 2. Chạy Frontend (Terminal 2)

```bash
cd frontend
npm start
```

Frontend sẽ chạy tại: `http://localhost:3000`

## Sử Dụng

### 1. Truy Cập Website

Mở trình duyệt và truy cập: `http://localhost:3000`

### 2. Đăng Ký Tài Khoản

- Click "Đăng ký" ở header
- Điền thông tin: Họ tên, Email, Số điện thoại, Mật khẩu
- Submit để tạo tài khoản

### 3. Đăng Nhập

- Click "Đăng nhập" ở header
- Nhập Email và Mật khẩu
- Hoặc dùng tài khoản mẫu (nếu đã chạy seed_data.sql)

### 4. Tìm Kiếm Phòng Trọ

- Sử dụng form tìm kiếm ở trang chủ
- Chọn loại hình, tỉnh/thành, quận/huyện
- Nhập khoảng giá
- Click "Tìm kiếm"

### 5. Xem Chi Tiết Tin Đăng

- Click vào bất kỳ tin đăng nào
- Xem đầy đủ thông tin: giá, diện tích, mô tả, hình ảnh
- Xem thông tin liên hệ chủ nhà

### 6. Đăng Tin Cho Thuê

- Đăng nhập vào tài khoản
- Click "Dashboard" hoặc "+ Đăng tin mới"
- Điền đầy đủ thông tin tin đăng
- Thêm URL hình ảnh
- Submit để đăng tin

### 7. Quản Lý Tin Đăng

- Vào Dashboard
- Xem danh sách tin đã đăng
- Xóa tin đăng không còn sử dụng

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user (cần token)

### Listings
- `GET /api/listings` - Danh sách tin đăng (có filter)
- `GET /api/listings/:id` - Chi tiết tin đăng
- `POST /api/listings` - Tạo tin đăng (cần token)
- `PUT /api/listings/:id` - Cập nhật tin đăng (cần token)
- `DELETE /api/listings/:id` - Xóa tin đăng (cần token)
- `GET /api/listings/user/my-listings` - Tin đăng của user (cần token)

### Locations
- `GET /api/locations/provinces` - Danh sách tỉnh/thành phố
- `GET /api/locations/districts?province_id=X` - Danh sách quận/huyện
- `GET /api/locations/wards?district_id=X` - Danh sách phường/xã

## Database Schema

### Users
- id, name, email, phone, password_hash, created_at

### Listings
- id, title, description, price, area, type, address
- province_id, district_id, ward_id, user_id
- status, created_at, updated_at

### Locations
- id, name, parent_id, type (province/district/ward)

### ListingImages
- id, listing_id, image_url, is_primary

## Công Nghệ Sử Dụng

### Backend
- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT Authentication
- bcryptjs
- CORS

### Frontend
- React 18
- React Router v6
- Axios
- Context API
- CSS3

## Tính Năng Có Thể Mở Rộng

- [ ] Upload ảnh lên server
- [ ] Google Maps integration
- [ ] Đánh giá & review
- [ ] Chat realtime
- [ ] Tin nổi bật trả phí
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] Social login
- [ ] SEO optimization

## Troubleshooting

### Lỗi kết nối Database
- Kiểm tra PostgreSQL đã chạy: `pg_isready`
- Kiểm tra thông tin đăng nhập trong `.env`
- Kiểm tra database đã được tạo: `psql -l`

### Lỗi CORS
- Đảm bảo backend đã cài `cors` package
- Kiểm tra backend đang chạy ở port 5000

### Lỗi Module Not Found
- Chạy `npm install` trong cả backend và frontend
- Xóa `node_modules` và chạy lại `npm install`

## License

MIT License

## Tác Giả

Được xây dựng theo roadmap trong README.md

## Liên Hệ

- Repository: https://github.com/quangha2706-crypto/ThueTroGiaRe
- Issues: https://github.com/quangha2706-crypto/ThueTroGiaRe/issues
