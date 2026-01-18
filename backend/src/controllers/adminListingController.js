const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Listing = require('../models/Listing');
const ListingImage = require('../models/ListingImage');
const Location = require('../models/Location');
const User = require('../models/User');
const AdminLog = require('../models/AdminLog');

// Get all listings for admin (including all statuses)
exports.getListings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      type,
      status,
      approval_status,
      user_id,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where clause - admin can see all listings except hard-deleted
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (type) where.type = type;
    if (status) where.status = status;
    if (approval_status) where.approval_status = approval_status;
    if (user_id) where.user_id = user_id;

    const { count, rows: listings } = await Listing.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sort, order]],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: ListingImage,
          as: 'images',
          limit: 1
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
    console.error('Admin get listings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Get pending listings for moderation
exports.getPendingListings = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: listings } = await Listing.findAndCountAll({
      where: { 
        approval_status: 'pending',
        status: { [Op.ne]: 'deleted' }
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'ASC']], // Oldest first for queue
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
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
    console.error('Get pending listings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Approve listing
exports.approveListing = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { admin_note } = req.body;
    const adminId = req.user.id;

    const listing = await Listing.findByPk(id, { transaction });

    if (!listing) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy tin đăng' 
      });
    }

    await listing.update({
      approval_status: 'approved',
      admin_note,
      reviewed_by: adminId,
      reviewed_at: new Date(),
      updated_at: new Date()
    }, { transaction });

    // Log admin action
    await AdminLog.create({
      admin_id: adminId,
      action: 'APPROVE_LISTING',
      target_type: 'listing',
      target_id: listing.id,
      details: { admin_note },
      ip_address: req.ip
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Duyệt tin đăng thành công',
      data: { listing }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Approve listing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Reject listing
exports.rejectListing = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { admin_note } = req.body;
    const adminId = req.user.id;

    if (!admin_note) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng cung cấp lý do từ chối' 
      });
    }

    const listing = await Listing.findByPk(id, { transaction });

    if (!listing) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy tin đăng' 
      });
    }

    await listing.update({
      approval_status: 'rejected',
      admin_note,
      reviewed_by: adminId,
      reviewed_at: new Date(),
      updated_at: new Date()
    }, { transaction });

    // Log admin action
    await AdminLog.create({
      admin_id: adminId,
      action: 'REJECT_LISTING',
      target_type: 'listing',
      target_id: listing.id,
      details: { admin_note },
      ip_address: req.ip
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Từ chối tin đăng thành công',
      data: { listing }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Reject listing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Toggle listing visibility (hide/show)
exports.toggleListingVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const adminId = req.user.id;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status không hợp lệ' 
      });
    }

    const listing = await Listing.findByPk(id);

    if (!listing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy tin đăng' 
      });
    }

    const oldStatus = listing.status;
    await listing.update({ 
      status,
      updated_at: new Date()
    });

    // Log admin action
    await AdminLog.logAction(
      adminId,
      status === 'active' ? 'SHOW_LISTING' : 'HIDE_LISTING',
      'listing',
      listing.id,
      { oldStatus, newStatus: status, reason },
      req.ip
    );

    res.json({
      success: true,
      message: status === 'active' ? 'Hiển thị tin đăng thành công' : 'Ẩn tin đăng thành công',
      data: { listing }
    });
  } catch (error) {
    console.error('Toggle listing visibility error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Admin update listing (can edit any listing)
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
      status,
      approval_status,
      admin_note
    } = req.body;
    const adminId = req.user.id;

    const listing = await Listing.findByPk(id);

    if (!listing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy tin đăng' 
      });
    }

    const oldValues = {
      title: listing.title,
      description: listing.description,
      price: listing.price,
      status: listing.status,
      approval_status: listing.approval_status
    };

    await listing.update({
      title: title !== undefined ? title : listing.title,
      description: description !== undefined ? description : listing.description,
      price: price !== undefined ? price : listing.price,
      area: area !== undefined ? area : listing.area,
      type: type !== undefined ? type : listing.type,
      address: address !== undefined ? address : listing.address,
      province_id: province_id !== undefined ? province_id : listing.province_id,
      district_id: district_id !== undefined ? district_id : listing.district_id,
      ward_id: ward_id !== undefined ? ward_id : listing.ward_id,
      status: status !== undefined ? status : listing.status,
      approval_status: approval_status !== undefined ? approval_status : listing.approval_status,
      admin_note: admin_note !== undefined ? admin_note : listing.admin_note,
      updated_at: new Date()
    });

    // Log admin action
    await AdminLog.logAction(
      adminId,
      'UPDATE_LISTING',
      'listing',
      listing.id,
      { oldValues, changes: req.body },
      req.ip
    );

    // Fetch updated listing with associations
    const updatedListing = await Listing.findByPk(id, {
      include: [
        { model: ListingImage, as: 'images' },
        { model: Location, as: 'province', attributes: ['id', 'name'] },
        { model: Location, as: 'district', attributes: ['id', 'name'] },
        { model: Location, as: 'ward', attributes: ['id', 'name'] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.json({
      success: true,
      message: 'Cập nhật tin đăng thành công',
      data: { listing: updatedListing }
    });
  } catch (error) {
    console.error('Admin update listing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Soft delete listing (admin)
exports.deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    const listing = await Listing.findByPk(id);

    if (!listing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy tin đăng' 
      });
    }

    await listing.update({ 
      status: 'deleted',
      admin_note: reason,
      updated_at: new Date()
    });

    // Log admin action
    await AdminLog.logAction(
      adminId,
      'DELETE_LISTING',
      'listing',
      listing.id,
      { reason },
      req.ip
    );

    res.json({
      success: true,
      message: 'Xóa tin đăng thành công'
    });
  } catch (error) {
    console.error('Admin delete listing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};
