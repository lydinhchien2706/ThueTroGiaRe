import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { locationsAPI } from '../services/api';
import './SearchBar.css';

const SearchBar = () => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [searchParams, setSearchParams] = useState({
    type: '',
    province_id: '',
    district_id: '',
    min_price: '',
    max_price: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProvinces();
  }, []);

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
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const handleProvinceChange = (e) => {
    const provinceId = e.target.value;
    setSearchParams({ ...searchParams, province_id: provinceId, district_id: '' });
    setDistricts([]);
    if (provinceId) {
      fetchDistricts(provinceId);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.keys(searchParams).forEach((key) => {
      if (searchParams[key]) {
        params.append(key, searchParams[key]);
      }
    });
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSearch} className="search-form">
        <div className="form-group">
          <select
            value={searchParams.type}
            onChange={(e) => setSearchParams({ ...searchParams, type: e.target.value })}
            className="form-control"
          >
            <option value="">Loại hình</option>
            <option value="phong-tro">Phòng trọ</option>
            <option value="nha-nguyen-can">Nhà nguyên căn</option>
            <option value="can-ho">Căn hộ</option>
          </select>
        </div>

        <div className="form-group">
          <select
            value={searchParams.province_id}
            onChange={handleProvinceChange}
            className="form-control"
          >
            <option value="">Tỉnh/Thành phố</option>
            {provinces.map((province) => (
              <option key={province.id} value={province.id}>
                {province.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <select
            value={searchParams.district_id}
            onChange={(e) => setSearchParams({ ...searchParams, district_id: e.target.value })}
            className="form-control"
            disabled={!searchParams.province_id}
          >
            <option value="">Quận/Huyện</option>
            {districts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <input
            type="number"
            placeholder="Giá tối thiểu"
            value={searchParams.min_price}
            onChange={(e) => setSearchParams({ ...searchParams, min_price: e.target.value })}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <input
            type="number"
            placeholder="Giá tối đa"
            value={searchParams.max_price}
            onChange={(e) => setSearchParams({ ...searchParams, max_price: e.target.value })}
            className="form-control"
          />
        </div>

        <button type="submit" className="btn btn-primary btn-search">
          Tìm kiếm
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
