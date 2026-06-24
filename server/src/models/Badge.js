import mongoose from 'mongoose';

const badgeSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    criteria: { type: Object, required: true },
    rarity: { type: String, enum: ['common', 'uncommon', 'rare', 'legendary'], default: 'common' },
    xpReward: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const Badge = mongoose.model('Badge', badgeSchema);
export default Badge;
