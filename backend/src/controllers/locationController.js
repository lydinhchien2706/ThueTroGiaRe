const Location = require('../models/Location');

// Get provinces
exports.getProvinces = async (req, res) => {
  try {
    const provinces = await Location.findAll({
      where: { type: 'province' },
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: { provinces }
    });
  } catch (error) {
    console.error('Get provinces error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Get districts by province
exports.getDistricts = async (req, res) => {
  try {
    const { province_id } = req.query;

    if (!province_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng cung cấp province_id' 
      });
    }

    const districts = await Location.findAll({
      where: { 
        type: 'district',
        parent_id: province_id 
      },
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: { districts }
    });
  } catch (error) {
    console.error('Get districts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Get wards by district
exports.getWards = async (req, res) => {
  try {
    const { district_id } = req.query;

    if (!district_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng cung cấp district_id' 
      });
    }

    const wards = await Location.findAll({
      where: { 
        type: 'ward',
        parent_id: district_id 
      },
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: { wards }
    });
  } catch (error) {
    console.error('Get wards error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};
