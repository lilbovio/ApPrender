import Lesson from '../models/Lesson.js';

// @desc    Get all lessons for a specific subject
// @route   GET /api/lessons/:subject
// @access  Private
export const getLessons = async (req, res, next) => {
  try {
    const subject = req.params.subject;
    const userVakType = req.user.vakType;

    if (!['math', 'english'].includes(subject)) {
      res.status(400);
      throw new Error('Invalid subject');
    }

    // Get lessons matching subject and user's VAK type (or 'all' fallback)
    const query = {
      subject,
      $or: [{ vakType: userVakType }, { vakType: 'all' }]
    };

    const lessons = await Lesson.find(query).sort({ grade: 1, createdAt: 1 });
    res.json(lessons);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single lesson by ID
// @route   GET /api/lessons/lesson/:id
// @access  Private
export const getLessonById = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (lesson) {
      res.json(lesson);
    } else {
      res.status(404);
      throw new Error('Lesson not found');
    }
  } catch (error) {
    next(error);
  }
};
