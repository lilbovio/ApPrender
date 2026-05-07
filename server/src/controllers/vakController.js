import User from '../models/User.js';

// @desc    Update user VAK type
// @route   PUT /api/vak
// @access  Private
export const updateVakType = async (req, res, next) => {
  try {
    const { vakType } = req.body;
    
    if (!['visual', 'auditivo', 'kinestesico'].includes(vakType)) {
      res.status(400);
      throw new Error('Invalid VAK type');
    }

    const user = await User.findById(req.user._id);

    if (user) {
      user.vakType = vakType;
      const updatedUser = await user.save();
      
      res.json({
        vakType: updatedUser.vakType
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};
