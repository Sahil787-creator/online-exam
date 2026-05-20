const User = require('../models/User');
const Exam = require('../models/Exam');
const Result = require('../models/Result');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalStudents, totalExaminers, totalExams, totalResults, publishedExams, pendingExams] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'examiner' }),
      Exam.countDocuments(),
      Result.countDocuments({ status: { $in: ['submitted', 'auto_submitted'] } }),
      Exam.countDocuments({ status: 'published' }),
      Exam.countDocuments({ status: 'pending_approval' }),
    ]);

    const passedResults = await Result.countDocuments({ status: { $in: ['submitted', 'auto_submitted'] }, isPassed: true });
    const passPercentage = totalResults > 0 ? Math.round((passedResults / totalResults) * 100) : 0;

    // Recent activity
    const recentUsers = await User.find().sort('-createdAt').limit(5).select('name email role createdAt');
    const recentExams = await Exam.find().sort('-createdAt').limit(5).populate('createdBy', 'name').select('title subject status createdAt createdBy');

    // Monthly exam stats (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyResults = await Result.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, status: { $in: ['submitted', 'auto_submitted'] } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 }, avgScore: { $avg: '$percentage' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      success: true,
      data: {
        stats: { totalUsers, totalStudents, totalExaminers, totalExams, totalResults, publishedExams, pendingExams, passPercentage },
        recentUsers,
        recentExams,
        monthlyResults,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, isActive } = req.query;
    let query = {};
    if (role) query.role = role;
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const users = await User.find(query).sort('-createdAt').select('-password');
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle user status
// @route   PUT /api/admin/users/:id/toggle
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot deactivate admin' });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'examiner', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin' });

    await user.deleteOne();
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve / reject exam
// @route   PUT /api/admin/exams/:id/approve
exports.approveExam = async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    exam.status = action === 'approve' ? 'published' : 'draft';
    await exam.save();
    res.json({ success: true, message: `Exam ${action}d`, data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all exams (admin view)
// @route   GET /api/admin/exams
exports.getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate('createdBy', 'name email')
      .sort('-createdAt');
    res.json({ success: true, count: exams.length, data: exams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
