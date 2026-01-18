const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Report = require('../models/Report');
const User = require('../models/User');
const Listing = require('../models/Listing');
const AdminLog = require('../models/AdminLog');

// Get all reports
exports.getReports = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      severity,
      target_type,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (target_type) where.target_type = target_type;

    const { count, rows: reports } = await Report.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sort, order]],
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'handler',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Get pending reports
exports.getPendingReports = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: reports } = await Report.findAndCountAll({
      where: { status: 'pending' },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [
        ['severity', 'DESC'], // Critical first
        ['created_at', 'ASC'] // Then oldest
      ],
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get pending reports error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Get report by ID with target details
exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findByPk(id, {
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'handler',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!report) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy báo cáo' 
      });
    }

    // Get target details based on target_type
    let target = null;
    if (report.target_type === 'listing') {
      target = await Listing.findByPk(report.target_id, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
        ]
      });
    } else if (report.target_type === 'user') {
      target = await User.findByPk(report.target_id, {
        attributes: ['id', 'name', 'email', 'role', 'is_locked']
      });
    }

    res.json({
      success: true,
      data: { 
        report,
        target
      }
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Update report status
exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, severity, admin_note } = req.body;
    const adminId = req.user.id;

    const report = await Report.findByPk(id);

    if (!report) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy báo cáo' 
      });
    }

    const updateData = {
      handled_by: adminId,
      handled_at: new Date()
    };

    if (status) updateData.status = status;
    if (severity) updateData.severity = severity;
    if (admin_note !== undefined) updateData.admin_note = admin_note;

    await report.update(updateData);

    // Log admin action
    await AdminLog.logAction(
      adminId,
      'UPDATE_REPORT',
      'report',
      report.id,
      { status, severity, admin_note },
      req.ip
    );

    res.json({
      success: true,
      message: 'Cập nhật báo cáo thành công',
      data: { report }
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Handle report with action
exports.handleReport = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { action, admin_note } = req.body;
    const adminId = req.user.id;

    const report = await Report.findByPk(id, { transaction });

    if (!report) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy báo cáo' 
      });
    }

    let actionResult = null;

    // Execute action based on report type
    if (action === 'hide_content' && report.target_type === 'listing') {
      const listing = await Listing.findByPk(report.target_id, { transaction });
      if (listing) {
        await listing.update({ status: 'inactive' }, { transaction });
        actionResult = 'Đã ẩn tin đăng';
        
        await AdminLog.create({
          admin_id: adminId,
          action: 'HIDE_LISTING_FROM_REPORT',
          target_type: 'listing',
          target_id: listing.id,
          details: { report_id: report.id },
          ip_address: req.ip
        }, { transaction });
      }
    } else if (action === 'lock_user' && report.target_type === 'user') {
      const user = await User.findByPk(report.target_id, { transaction });
      if (user && user.role !== User.ROLES.SUPER_ADMIN) {
        await user.update({ is_locked: true }, { transaction });
        actionResult = 'Đã khóa tài khoản';
        
        await AdminLog.create({
          admin_id: adminId,
          action: 'LOCK_USER_FROM_REPORT',
          target_type: 'user',
          target_id: user.id,
          details: { report_id: report.id },
          ip_address: req.ip
        }, { transaction });
      }
    } else if (action === 'dismiss') {
      actionResult = 'Đã bỏ qua báo cáo';
    }

    // Update report status
    await report.update({
      status: action === 'dismiss' ? 'dismissed' : 'resolved',
      admin_note,
      handled_by: adminId,
      handled_at: new Date()
    }, { transaction });

    // Log admin action
    await AdminLog.create({
      admin_id: adminId,
      action: 'HANDLE_REPORT',
      target_type: 'report',
      target_id: report.id,
      details: { action, admin_note, actionResult },
      ip_address: req.ip
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: actionResult || 'Xử lý báo cáo thành công',
      data: { report }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Handle report error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};
