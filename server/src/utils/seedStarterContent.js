import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Lesson from '../models/Lesson.js';
import Badge from '../models/Badge.js';
import { grade1MathLessons } from '../data/math/grade1.js';
import { grade1EnglishLessons } from '../data/english/grade1.js';
import { achievementBadges } from '../data/badges/achievementBadges.js';
import connectDB from '../config/db.js';

dotenv.config();

const seedStarterContent = async () => {
  try {
    await connectDB();

    console.log('🌱 Starting seed process...\n');

    // Clear existing starter content
    console.log('🗑️  Clearing existing lessons and badges...');
    await Lesson.deleteMany({});
    await Badge.deleteMany({});
    console.log('✅ Cleared successfully\n');

    // Seed Math Lessons
    console.log('📊 Seeding Math lessons...');
    const mathLessons = await Lesson.insertMany(grade1MathLessons);
    console.log(`✅ Created ${mathLessons.length} Math lessons\n`);

    // Seed English Lessons
    console.log('🌍 Seeding English lessons...');
    const englishLessons = await Lesson.insertMany(grade1EnglishLessons);
    console.log(`✅ Created ${englishLessons.length} English lessons\n`);

    // Seed Achievement Badges
    console.log('🏆 Seeding Achievement badges...');
    const badges = await Badge.insertMany(achievementBadges);
    console.log(`✅ Created ${badges.length} badges\n`);

    // Display summary
    console.log('📋 SEED SUMMARY:');
    console.log('================');
    console.log(`Math Lessons: ${mathLessons.length}`);
    mathLessons.forEach((lesson, index) => {
      console.log(`  ${index + 1}. ${lesson.title} (${lesson.xp} XP)`);
    });
    
    console.log(`\nEnglish Lessons: ${englishLessons.length}`);
    englishLessons.forEach((lesson, index) => {
      console.log(`  ${index + 1}. ${lesson.title} (${lesson.xp} XP)`);
    });
    
    console.log(`\nAchievement Badges: ${badges.length}`);
    badges.forEach((badge, index) => {
      console.log(`  ${index + 1}. ${badge.icon} ${badge.name} - ${badge.description}`);
    });

    console.log('\n✨ Seed completed successfully!');
    console.log(`Total Lessons: ${mathLessons.length + englishLessons.length}`);
    console.log(`Total Badges: ${badges.length}`);
    console.log(`Total XP Available: ${(mathLessons.length + englishLessons.length) * 50} XP\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed immediately
seedStarterContent();

export default seedStarterContent;

// Made with Bob
