const { Op } = require('sequelize');
const Listing = require('../models/Listing');
const ListingImage = require('../models/ListingImage');
const Location = require('../models/Location');
const User = require('../models/User');

// Get all listings with filters
exports.getListings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      province_id,
      district_id,
      ward_id,
      min_price,
      max_price,
      min_area,
      max_area,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    // Build where clause
    const where = { status: 'active' };
    
    if (type) where.type = type;
    if (province_id) where.province_id = province_id;
    if (district_id) where.district_id = district_id;
    if (ward_id) where.ward_id = ward_id;
    
    if (min_price || max_price) {
      where.price = {};
      if (min_price) where.price[Op.gte] = min_price;
      if (max_price) where.price[Op.lte] = max_price;
    }
    
    if (min_area || max_area) {
      where.area = {};
      if (min_area) where.area[Op.gte] = min_area;
      if (max_area) where.area[Op.lte] = max_area;
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Query listings
    const { count, rows: listings } = await Listing.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sort, order]],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'phone', 'email']
        },
        {
          model: ListingImage,
          as: 'images',
          limit: 5
        },
        {
          model: Location,
          as: 'province',
          attributes: ['id', 'name']
        },
        {
          model: Location,
          as: 'district',
          attributes: ['id', 'name']
        },
        {
          model: Location,
          as: 'ward',
          attributes: ['id', 'name']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        listings,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Get listing by ID
exports.getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findOne({
      where: { id, status: 'active' },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'phone', 'email']
        },
        {
          model: ListingImage,
          as: 'images'
        },
        {
          model: Location,
          as: 'province',
          attributes: ['id', 'name']
        },
        {
          model: Location,
          as: 'district',
          attributes: ['id', 'name']
        },
        {
          model: Location,
          as: 'ward',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!listing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy tin đăng' 
      });
    }

    res.json({
      success: true,
      data: { listing }
    });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Create listing
exports.createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      area,
      type,
      address,
      province_id,
      district_id,
      ward_id,
      images
    } = req.body;

    // Validate required fields
    if (!title || !price || !type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc' 
      });
    }

    // Create listing
    const listing = await Listing.create({
      title,
      description,
      price,
      area,
      type,
      address,
      province_id,
      district_id,
      ward_id,
      user_id: req.user.id
    });

    // Create images if provided
    if (images && Array.isArray(images) && images.length > 0) {
      const imagePromises = images.map((imageUrl, index) => 
        ListingImage.create({
          listing_id: listing.id,
          image_url: imageUrl,
          is_primary: index === 0
        })
      );
      await Promise.all(imagePromises);
    }

    // Fetch complete listing with associations
    const completeListing = await Listing.findByPk(listing.id, {
      include: [
        { model: ListingImage, as: 'images' },
        { model: Location, as: 'province', attributes: ['id', 'name'] },
        { model: Location, as: 'district', attributes: ['id', 'name'] },
        { model: Location, as: 'ward', attributes: ['id', 'name'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Đăng tin thành công',
      data: { listing: completeListing }
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Update listing
exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      price,
      area,
      type,
      address,
      province_id,
      district_id,
      ward_id,
      status
    } = req.body;

    // Find listing
    const listing = await Listing.findByPk(id);

    if (!listing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy tin đăng' 
      });
    }

    // Check ownership
    if (listing.user_id !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Bạn không có quyền chỉnh sửa tin đăng này' 
      });
    }

    // Update listing
    await listing.update({
      title: title || listing.title,
      description: description !== undefined ? description : listing.description,
      price: price || listing.price,
      area: area !== undefined ? area : listing.area,
      type: type || listing.type,
      address: address !== undefined ? address : listing.address,
      province_id: province_id !== undefined ? province_id : listing.province_id,
      district_id: district_id !== undefined ? district_id : listing.district_id,
      ward_id: ward_id !== undefined ? ward_id : listing.ward_id,
      status: status || listing.status,
      updated_at: new Date()
    });

    // Fetch updated listing
    const updatedListing = await Listing.findByPk(id, {
      include: [
        { model: ListingImage, as: 'images' },
        { model: Location, as: 'province', attributes: ['id', 'name'] },
        { model: Location, as: 'district', attributes: ['id', 'name'] },
        { model: Location, as: 'ward', attributes: ['id', 'name'] }
      ]
    });

    res.json({
      success: true,
      message: 'Cập nhật tin đăng thành công',
      data: { listing: updatedListing }
    });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Delete listing
exports.deleteListing = async (req, res) => {
  try {
    const { id } = req.params;

    // Find listing
    const listing = await Listing.findByPk(id);

    if (!listing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy tin đăng' 
      });
    }

    // Check ownership
    if (listing.user_id !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Bạn không có quyền xóa tin đăng này' 
      });
    }

    // Soft delete by updating status
    await listing.update({ status: 'deleted' });

    res.json({
      success: true,
      message: 'Xóa tin đăng thành công'
    });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Get user's listings
exports.getMyListings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: listings } = await Listing.findAndCountAll({
      where: { 
        user_id: req.user.id,
        status: { [Op.ne]: 'deleted' }
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        { model: ListingImage, as: 'images' },
        { model: Location, as: 'province', attributes: ['id', 'name'] },
        { model: Location, as: 'district', attributes: ['id', 'name'] },
        { model: Location, as: 'ward', attributes: ['id', 'name'] }
      ]
    });

    res.json({
      success: true,
      data: {
        listings,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get my listings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};
