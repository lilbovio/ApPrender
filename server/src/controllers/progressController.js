import Progress from '../models/Progress.js';

// @desc    Get user progress for a subject
// @route   GET /api/progress/:subject
// @access  Private
export const getProgress = async (req, res, next) => {
  try {
    const { subject } = req.params;

    if (!['math', 'english'].includes(subject)) {
      res.status(400);
      throw new Error('Invalid subject');
    }

    let progress = await Progress.findOne({ user: req.user._id, subject }).populate('completedLessons');

    if (!progress) {
      progress = await Progress.create({
        user: req.user._id,
        subject,
        completedLessons: [],
        xp: 0,
        streak: 0
      });
    }

    res.json(progress);
  } catch (error) {
    next(error);
  }
};

// @desc    Update progress (complete a lesson)
// @route   POST /api/progress/:subject/complete
// @access  Private
export const completeLesson = async (req, res, next) => {
  try {
    const { subject } = req.params;
    const { lessonId, xpEarned } = req.body;

    let progress = await Progress.findOne({ user: req.user._id, subject });

    if (!progress) {
      progress = new Progress({
        user: req.user._id,
        subject,
        completedLessons: [],
        xp: 0,
        streak: 1
      });
    }

    // Check if lesson already completed
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
      progress.xp += (xpEarned || 50);
      
      // Update streak (simplified logic for now)
      const now = new Date();
      const lastActive = new Date(progress.lastActiveDate);
      const diffTime = Math.abs(now - lastActive);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays === 1) {
        progress.streak += 1;
      } else if (diffDays > 1) {
        progress.streak = 1;
      }
      
      progress.lastActiveDate = now;
      await progress.save();
    }

    res.json(progress);
  } catch (error) {
    next(error);
  }
};
