import mongoose from 'mongoose';

const lessonSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    subject: { type: String, enum: ['math', 'english'], required: true },
    grade: { type: String, required: true },
    icon: { type: String, default: '📚' },
    xp: { type: Number, default: 50 },
    vakType: { type: String, enum: ['visual', 'auditivo', 'kinestesico', 'all'], default: 'all' },
    content: {
      type: Object, // Stores VAK-specific content
      required: true
    }
  },
  { timestamps: true }
);

const Lesson = mongoose.model('Lesson', lessonSchema);
export default Lesson;
