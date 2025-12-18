// Predefined badge definitions
export const badges = [
  // First Steps
  {
    badgeId: 'first-login',
    name: 'First Login',
    description: 'Successfully logged in to Cyberguard for the first time',
    icon: 'user-check',
    category: 'achievement',
    level: 'all',
    criteria: {
      type: 'first-module',
      value: 0,
    },
    rarity: 'common',
    points: 10,
    order: 1,
  },
  {
    badgeId: 'first-module-complete',
    name: 'Getting Started',
    description: 'Completed your first learning module',
    icon: 'award',
    category: 'achievement',
    level: 'all',
    criteria: {
      type: 'modules-completed',
      value: 1,
    },
    rarity: 'common',
    points: 25,
    order: 2,
  },
  
  // Beginner Level
  {
    badgeId: 'beginner-complete',
    name: 'Beginner Graduate',
    description: 'Completed all beginner level modules',
    icon: 'graduation-cap',
    category: 'milestone',
    level: 'beginner',
    criteria: {
      type: 'level-completed',
      specificLevel: 'beginner',
    },
    rarity: 'common',
    points: 100,
    order: 10,
  },
  {
    badgeId: 'beginner-perfectionist',
    name: 'Beginner Perfectionist',
    description: 'Achieved perfect scores on all beginner modules',
    icon: 'star',
    category: 'mastery',
    level: 'beginner',
    criteria: {
      type: 'perfect-score',
      specificLevel: 'beginner',
    },
    rarity: 'rare',
    points: 150,
    order: 11,
  },
  
  // Intermediate Level
  {
    badgeId: 'intermediate-complete',
    name: 'Intermediate Graduate',
    description: 'Completed all intermediate level modules',
    icon: 'graduation-cap',
    category: 'milestone',
    level: 'intermediate',
    criteria: {
      type: 'level-completed',
      specificLevel: 'intermediate',
    },
    rarity: 'rare',
    points: 200,
    order: 20,
  },
  {
    badgeId: 'intermediate-perfectionist',
    name: 'Intermediate Perfectionist',
    description: 'Achieved perfect scores on all intermediate modules',
    icon: 'star',
    category: 'mastery',
    level: 'intermediate',
    criteria: {
      type: 'perfect-score',
      specificLevel: 'intermediate',
    },
    rarity: 'epic',
    points: 250,
    order: 21,
  },
  
  // Advanced Level
  {
    badgeId: 'advanced-complete',
    name: 'Advanced Graduate',
    description: 'Completed all advanced level modules',
    icon: 'graduation-cap',
    category: 'milestone',
    level: 'advanced',
    criteria: {
      type: 'level-completed',
      specificLevel: 'advanced',
    },
    rarity: 'epic',
    points: 300,
    order: 30,
  },
  {
    badgeId: 'advanced-perfectionist',
    name: 'Advanced Perfectionist',
    description: 'Achieved perfect scores on all advanced modules',
    icon: 'star',
    category: 'mastery',
    level: 'advanced',
    criteria: {
      type: 'perfect-score',
      specificLevel: 'advanced',
    },
    rarity: 'legendary',
    points: 400,
    order: 31,
  },
  
  // Point Milestones
  {
    badgeId: 'points-100',
    name: 'Century',
    description: 'Earned 100 total points',
    icon: 'target',
    category: 'milestone',
    level: 'all',
    criteria: {
      type: 'points-earned',
      value: 100,
    },
    rarity: 'common',
    points: 0,
    order: 40,
  },
  {
    badgeId: 'points-500',
    name: 'Half Thousand',
    description: 'Earned 500 total points',
    icon: 'target',
    category: 'milestone',
    level: 'all',
    criteria: {
      type: 'points-earned',
      value: 500,
    },
    rarity: 'rare',
    points: 50,
    order: 41,
  },
  {
    badgeId: 'points-1000',
    name: 'Millennium',
    description: 'Earned 1000 total points',
    icon: 'target',
    category: 'milestone',
    level: 'all',
    criteria: {
      type: 'points-earned',
      value: 1000,
    },
    rarity: 'epic',
    points: 100,
    order: 42,
  },
  {
    badgeId: 'points-2500',
    name: 'Elite Scorer',
    description: 'Earned 2500 total points',
    icon: 'trophy',
    category: 'milestone',
    level: 'all',
    criteria: {
      type: 'points-earned',
      value: 2500,
    },
    rarity: 'legendary',
    points: 250,
    order: 43,
  },
  
  // Module Completion Milestones
  {
    badgeId: 'modules-5',
    name: 'Quick Learner',
    description: 'Completed 5 learning modules',
    icon: 'book-open',
    category: 'achievement',
    level: 'all',
    criteria: {
      type: 'modules-completed',
      value: 5,
    },
    rarity: 'common',
    points: 50,
    order: 50,
  },
  {
    badgeId: 'modules-10',
    name: 'Dedicated Student',
    description: 'Completed 10 learning modules',
    icon: 'book-open',
    category: 'achievement',
    level: 'all',
    criteria: {
      type: 'modules-completed',
      value: 10,
    },
    rarity: 'rare',
    points: 100,
    order: 51,
  },
  {
    badgeId: 'modules-all',
    name: 'Master of All',
    description: 'Completed every single learning module',
    icon: 'crown',
    category: 'mastery',
    level: 'all',
    criteria: {
      type: 'modules-completed',
      value: 15, // Total modules (5 per level)
    },
    rarity: 'legendary',
    points: 500,
    order: 52,
  },
  
  // Special Achievements
  {
    badgeId: 'speed-demon',
    name: 'Speed Demon',
    description: 'Completed a module in record time',
    icon: 'zap',
    category: 'special',
    level: 'all',
    criteria: {
      type: 'speed-completion',
      value: 300, // 5 minutes in seconds
    },
    rarity: 'rare',
    points: 75,
    order: 60,
  },
  {
    badgeId: 'perfectionist',
    name: 'Perfectionist',
    description: 'Achieved 5 perfect scores',
    icon: 'check-circle',
    category: 'mastery',
    level: 'all',
    criteria: {
      type: 'perfect-score',
      value: 5,
    },
    rarity: 'epic',
    points: 200,
    order: 61,
  },
  {
    badgeId: 'cyber-guardian',
    name: 'Cyber Guardian',
    description: 'Mastered all aspects of cybersecurity education',
    icon: 'shield',
    category: 'special',
    level: 'all',
    criteria: {
      type: 'all-modules-level',
      value: 100, // 100% completion rate
    },
    rarity: 'legendary',
    points: 1000,
    order: 62,
  },
];

export default badges;