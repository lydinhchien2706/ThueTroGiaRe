import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listingsAPI, locationsAPI } from '../services/api';
import './CreateListing.css';

const CreateListing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    area: '',
    type: '',
    address: '',
    province_id: '',
    district_id: '',
    ward_id: '',
    images: [''],
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchProvinces();
  }, [isAuthenticated, navigate]);

  const fetchProvinces = async () => {
    try {
      const response = await locationsAPI.getProvinces();
      setProvinces(response.data.data.provinces);
    } catch (error) {
      console.error('Error fetching provinces:', error);
    }
  };

  const fetchDistricts = async (provinceId) => {
    try {
      const response = await locationsAPI.getDistricts(provinceId);
      setDistricts(response.data.data.districts);
      setWards([]);
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const fetchWards = async (districtId) => {
    try {
      const response = await locationsAPI.getWards(districtId);
      setWards(response.data.data.wards);
    } catch (error) {
      console.error('Error fetching wards:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProvinceChange = (e) => {
    const provinceId = e.target.value;
    setFormData({ ...formData, province_id: provinceId, district_id: '', ward_id: '' });
    setDistricts([]);
    setWards([]);
    if (provinceId) {
      fetchDistricts(provinceId);
    }
  };

  const handleDistrictChange = (e) => {
    const districtId = e.target.value;
    setFormData({ ...formData, district_id: districtId, ward_id: '' });
    setWards([]);
    if (districtId) {
      fetchWards(districtId);
    }
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const removeImageField = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Filter out empty image URLs
      const images = formData.images.filter((img) => img.trim() !== '');
      
      const data = {
        ...formData,
        images,
        province_id: parseInt(formData.province_id),
        district_id: parseInt(formData.district_id),
        ward_id: formData.ward_id ? parseInt(formData.ward_id) : null,
      };

      await listingsAPI.createListing(data);
      alert('Đăng tin thành công!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating listing:', error);
      setError(error.response?.data?.message || 'Đăng tin thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-listing-page">
      <div className="container">
        <h1 className="page-title">Đăng Tin Cho Thuê</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="listing-form">
          <div className="form-section">
            <h2>Thông tin cơ bản</h2>

            <div className="form-group">
              <label htmlFor="title">Tiêu đề <span className="required">*</span></label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-control"
                placeholder="VD: Phòng trọ giá rẻ gần trường ĐH Bách Khoa"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">Loại hình <span className="required">*</span></label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="">Chọn loại hình</option>
                <option value="phong-tro">Phòng trọ</option>
                <option value="nha-nguyen-can">Nhà nguyên căn</option>
                <option value="can-ho">Căn hộ</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Giá (VNĐ/tháng) <span className="required">*</span></label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="2500000"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="area">Diện tích (m²)</label>
                <input
                  type="number"
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="25"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Mô tả</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-control"
                rows="5"
                placeholder="Mô tả chi tiết về phòng trọ..."
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Địa chỉ</h2>

            <div className="form-group">
              <label htmlFor="address">Địa chỉ</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-control"
                placeholder="VD: 123 Nguyễn Huệ"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="province_id">Tỉnh/Thành phố <span className="required">*</span></label>
                <select
                  id="province_id"
                  name="province_id"
                  value={formData.province_id}
                  onChange={handleProvinceChange}
                  className="form-control"
                  required
                >
                  <option value="">Chọn tỉnh/thành phố</option>
                  {provinces.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="district_id">Quận/Huyện <span className="required">*</span></label>
                <select
                  id="district_id"
                  name="district_id"
                  value={formData.district_id}
                  onChange={handleDistrictChange}
                  className="form-control"
                  disabled={!formData.province_id}
                  required
                >
                  <option value="">Chọn quận/huyện</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="ward_id">Phường/Xã</label>
                <select
                  id="ward_id"
                  name="ward_id"
                  value={formData.ward_id}
                  onChange={handleChange}
                  className="form-control"
                  disabled={!formData.district_id}
                >
                  <option value="">Chọn phường/xã</option>
                  {wards.map((ward) => (
                    <option key={ward.id} value={ward.id}>
                      {ward.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Hình ảnh</h2>
            <p className="form-help">Thêm URL hình ảnh (có thể sử dụng dịch vụ như Imgur, Cloudinary)</p>

            {formData.images.map((image, index) => (
              <div key={index} className="image-field">
                <input
                  type="url"
                  value={image}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  className="form-control"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="btn btn-danger btn-sm"
                  >
                    Xóa
                  </button>
                )}
              </div>
            ))}

            <button type="button" onClick={addImageField} className="btn btn-outline">
              + Thêm hình ảnh
            </button>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/dashboard')} className="btn btn-outline">
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng tin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;
