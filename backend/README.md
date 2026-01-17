# Backend API - Thuê Trọ Giá Rẻ

REST API cho website tìm kiếm và đăng tin cho thuê phòng trọ, nhà nguyên căn, căn hộ.

## Yêu cầu hệ thống

- Node.js >= 14.x
- PostgreSQL >= 12.x
- npm hoặc yarn

## Cài đặt

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình database

Tạo database PostgreSQL:

```bash
createdb thuetrodb
```

Hoặc sử dụng psql:

```sql
CREATE DATABASE thuetrodb;
```

### 3. Cấu hình môi trường

Copy file `.env.example` thành `.env`:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env` với thông tin database của bạn:

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

### 4. Khởi tạo database

Chạy các file SQL theo thứ tự:

```bash
psql -U postgres -d thuetrodb -f ../database/schema.sql
psql -U postgres -d thuetrodb -f ../database/seed_locations.sql
psql -U postgres -d thuetrodb -f ../database/seed_data.sql
```

## Chạy ứng dụng

### Development mode (với nodemon)

```bash
npm run dev
```

### Production mode

```bash
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại (cần token)

### Listings

- `GET /api/listings` - Lấy danh sách tin đăng (có filter, pagination)
- `GET /api/listings/:id` - Lấy chi tiết tin đăng
- `POST /api/listings` - Tạo tin đăng mới (cần token)
- `PUT /api/listings/:id` - Cập nhật tin đăng (cần token)
- `DELETE /api/listings/:id` - Xóa tin đăng (cần token)
- `GET /api/listings/user/my-listings` - Lấy tin đăng của user (cần token)

### Locations

- `GET /api/locations/provinces` - Lấy danh sách tỉnh/thành phố
- `GET /api/locations/districts?province_id=X` - Lấy danh sách quận/huyện
- `GET /api/locations/wards?district_id=X` - Lấy danh sách phường/xã

## Cấu trúc thư mục

```
backend/
├── src/
│   ├── config/         # Cấu hình database
│   ├── controllers/    # Controllers xử lý logic
│   ├── middleware/     # Middleware (auth, validation)
│   ├── models/         # Sequelize models
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   └── server.js       # Entry point
├── uploads/            # Thư mục chứa file upload
├── .env.example        # Mẫu file environment
├── .gitignore
└── package.json
```

## Ví dụ sử dụng API

### Đăng ký

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn A",
    "email": "test@example.com",
    "phone": "0901234567",
    "password": "password123"
  }'
```

### Đăng nhập

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Lấy danh sách tin đăng

```bash
curl http://localhost:5000/api/listings?page=1&limit=10&type=phong-tro&province_id=2
```

### Tạo tin đăng (cần token)

```bash
curl -X POST http://localhost:5000/api/listings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Phòng trọ giá rẻ",
    "description": "Phòng trọ sạch sẽ, an ninh tốt",
    "price": 2500000,
    "area": 25,
    "type": "phong-tro",
    "address": "123 Nguyễn Huệ",
    "province_id": 2,
    "district_id": 21,
    "images": [
      "https://via.placeholder.com/800x600"
    ]
  }'
```
