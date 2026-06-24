// 5 Achievement Badges for Chispapp
// Each badge has unlock criteria based on user progress

export const achievementBadges = [
  {
    name: "Primera Victoria",
    description: "¡Has completado tu primera lección!",
    icon: "🌟",
    criteria: {
      type: "lessons_completed",
      value: 1,
      subject: "any"
    },
    rarity: "common",
    xpReward: 10
  },
  {
    name: "Racha Ardiente",
    description: "¡3 días seguidos aprendiendo!",
    icon: "🔥",
    criteria: {
      type: "streak",
      value: 3,
      subject: "any"
    },
    rarity: "uncommon",
    xpReward: 25
  },
  {
    name: "Maestro Matemático",
    description: "¡Dominaste todas las lecciones de matemáticas!",
    icon: "🎯",
    criteria: {
      type: "subject_completed",
      value: 5,
      subject: "math"
    },
    rarity: "rare",
    xpReward: 50
  },
  {
    name: "Explorador de Inglés",
    description: "¡Completaste todas las lecciones de inglés!",
    icon: "🌍",
    criteria: {
      type: "subject_completed",
      value: 5,
      subject: "english"
    },
    rarity: "rare",
    xpReward: 50
  },
  {
    name: "Súper Estudiante",
    description: "¡Completaste TODAS las lecciones!",
    icon: "🏆",
    criteria: {
      type: "all_lessons_completed",
      value: 10,
      subject: "all"
    },
    rarity: "legendary",
    xpReward: 100
  }
];

// Helper function to check if a badge should be unlocked
export const checkBadgeUnlock = (badge, userProgress) => {
  const { criteria } = badge;
  
  switch (criteria.type) {
    case "lessons_completed":
      // Check total lessons completed across all subjects
      const totalCompleted = (userProgress.math?.completedLessons?.length || 0) + 
                            (userProgress.english?.completedLessons?.length || 0);
      return totalCompleted >= criteria.value;
    
    case "streak":
      // Check if user has maintained the required streak
      const maxStreak = Math.max(
        userProgress.math?.streak || 0,
        userProgress.english?.streak || 0
      );
      return maxStreak >= criteria.value;
    
    case "subject_completed":
      // Check if specific subject has required number of lessons completed
      const subjectProgress = userProgress[criteria.subject];
      return (subjectProgress?.completedLessons?.length || 0) >= criteria.value;
    
    case "all_lessons_completed":
      // Check if all lessons across all subjects are completed
      const allCompleted = (userProgress.math?.completedLessons?.length || 0) + 
                          (userProgress.english?.completedLessons?.length || 0);
      return allCompleted >= criteria.value;
    
    default:
      return false;
  }
};

// Get all unlocked badges for a user
export const getUnlockedBadges = (userProgress) => {
  return achievementBadges.filter(badge => checkBadgeUnlock(badge, userProgress));
};

// Get badge progress for display
export const getBadgeProgress = (badge, userProgress) => {
  const { criteria } = badge;
  let current = 0;
  let target = criteria.value;
  
  switch (criteria.type) {
    case "lessons_completed":
      current = (userProgress.math?.completedLessons?.length || 0) + 
               (userProgress.english?.completedLessons?.length || 0);
      break;
    
    case "streak":
      current = Math.max(
        userProgress.math?.streak || 0,
        userProgress.english?.streak || 0
      );
      break;
    
    case "subject_completed":
      const subjectProgress = userProgress[criteria.subject];
      current = subjectProgress?.completedLessons?.length || 0;
      break;
    
    case "all_lessons_completed":
      current = (userProgress.math?.completedLessons?.length || 0) + 
               (userProgress.english?.completedLessons?.length || 0);
      break;
  }
  
  return {
    current,
    target,
    percentage: Math.min((current / target) * 100, 100),
    unlocked: current >= target
  };
};

// Made with Bob
