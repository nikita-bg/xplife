import type { QuizQuestion, TaskCategory, TaskDifficulty } from '@/lib/types'

// Keep QUIZ_QUESTIONS as template with just structure
// Actual questions will come from translations
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'When you wake up, what energizes you most?',
    options: [
      { label: 'A thrilling new challenge or adventure', value: 'a', personality: 'dopamine' },
      { label: 'Learning something new or creative work', value: 'b', personality: 'acetylcholine' },
      { label: 'A calm, structured morning routine', value: 'c', personality: 'gaba' },
      { label: 'Connecting with loved ones or community', value: 'd', personality: 'serotonin' },
    ],
  },
  {
    id: 2,
    question: 'How do you prefer to handle stress?',
    options: [
      { label: 'Intense physical activity or competition', value: 'a', personality: 'dopamine' },
      { label: 'Journaling, reading, or problem-solving', value: 'b', personality: 'acetylcholine' },
      { label: 'Meditation, yoga, or deep breathing', value: 'c', personality: 'gaba' },
      { label: 'Talking it out with friends or family', value: 'd', personality: 'serotonin' },
    ],
  },
  {
    id: 3,
    question: 'What type of goals excite you the most?',
    options: [
      { label: 'Bold, ambitious goals with big rewards', value: 'a', personality: 'dopamine' },
      { label: 'Skills mastery and intellectual growth', value: 'b', personality: 'acetylcholine' },
      { label: 'Stability, consistency, and inner peace', value: 'c', personality: 'gaba' },
      { label: 'Building relationships and helping others', value: 'd', personality: 'serotonin' },
    ],
  },
  {
    id: 4,
    question: 'How would your friends describe you?',
    options: [
      { label: 'Energetic, bold, and spontaneous', value: 'a', personality: 'dopamine' },
      { label: 'Curious, creative, and thoughtful', value: 'b', personality: 'acetylcholine' },
      { label: 'Calm, reliable, and grounded', value: 'c', personality: 'gaba' },
      { label: 'Warm, empathetic, and supportive', value: 'd', personality: 'serotonin' },
    ],
  },
  {
    id: 5,
    question: 'What is your ideal way to recharge?',
    options: [
      { label: 'Trying something exciting and new', value: 'a', personality: 'dopamine' },
      { label: 'Deep focus on a passion project', value: 'b', personality: 'acetylcholine' },
      { label: 'Rest, nature, and quiet time', value: 'c', personality: 'gaba' },
      { label: 'Quality time with people I care about', value: 'd', personality: 'serotonin' },
    ],
  },
]

// Function to get translated quiz questions
export function getQuizQuestions(t: (key: string) => string, tArray: (key: string) => any): QuizQuestion[] {
  return [
    {
      id: 1,
      question: t('questions.0.question'),
      options: [
        { label: tArray('questions.0.options')[0], value: 'a', personality: 'dopamine' },
        { label: tArray('questions.0.options')[1], value: 'b', personality: 'acetylcholine' },
        { label: tArray('questions.0.options')[2], value: 'c', personality: 'gaba' },
        { label: tArray('questions.0.options')[3], value: 'd', personality: 'serotonin' },
      ],
    },
    {
      id: 2,
      question: t('questions.1.question'),
      options: [
        { label: tArray('questions.1.options')[0], value: 'a', personality: 'dopamine' },
        { label: tArray('questions.1.options')[1], value: 'b', personality: 'acetylcholine' },
        { label: tArray('questions.1.options')[2], value: 'c', personality: 'gaba' },
        { label: tArray('questions.1.options')[3], value: 'd', personality: 'serotonin' },
      ],
    },
    {
      id: 3,
      question: t('questions.2.question'),
      options: [
        { label: tArray('questions.2.options')[0], value: 'a', personality: 'dopamine' },
        { label: tArray('questions.2.options')[1], value: 'b', personality: 'acetylcholine' },
        { label: tArray('questions.2.options')[2], value: 'c', personality: 'gaba' },
        { label: tArray('questions.2.options')[3], value: 'd', personality: 'serotonin' },
      ],
    },
    {
      id: 4,
      question: t('questions.3.question'),
      options: [
        { label: tArray('questions.3.options')[0], value: 'a', personality: 'dopamine' },
        { label: tArray('questions.3.options')[1], value: 'b', personality: 'acetylcholine' },
        { label: tArray('questions.3.options')[2], value: 'c', personality: 'gaba' },
        { label: tArray('questions.3.options')[3], value: 'd', personality: 'serotonin' },
      ],
    },
    {
      id: 5,
      question: t('questions.4.question'),
      options: [
        { label: tArray('questions.4.options')[0], value: 'a', personality: 'dopamine' },
        { label: tArray('questions.4.options')[1], value: 'b', personality: 'acetylcholine' },
        { label: tArray('questions.4.options')[2], value: 'c', personality: 'gaba' },
        { label: tArray('questions.4.options')[3], value: 'd', personality: 'serotonin' },
      ],
    },
  ]
}

export const XP_REWARDS: Record<TaskDifficulty, number> = {
  easy: 25,
  medium: 50,
  hard: 100,
  epic: 200,
}

export const TASK_CATEGORIES: { value: TaskCategory; label: string; icon: string }[] = [
  { value: 'fitness', label: 'Fitness', icon: 'Dumbbell' },
  { value: 'mindfulness', label: 'Mindfulness', icon: 'Brain' },
  { value: 'learning', label: 'Learning', icon: 'BookOpen' },
  { value: 'productivity', label: 'Productivity', icon: 'Target' },
  { value: 'social', label: 'Social', icon: 'Users' },
  { value: 'health', label: 'Health', icon: 'Heart' },
  { value: 'creativity', label: 'Creativity', icon: 'Palette' },
]

export const PERSONALITY_DESCRIPTIONS: Record<string, { title: string; description: string }> = {
  dopamine: {
    title: 'The Adventurer',
    description: 'You thrive on excitement, novelty, and bold challenges. Your quests will focus on pushing boundaries and achieving ambitious goals.',
  },
  acetylcholine: {
    title: 'The Thinker',
    description: 'You love learning, creativity, and deep focus. Your quests will center around skill mastery and intellectual growth.',
  },
  gaba: {
    title: 'The Guardian',
    description: 'You value stability, consistency, and inner peace. Your quests will build strong habits and promote balance.',
  },
  serotonin: {
    title: 'The Connector',
    description: 'You draw energy from relationships and community. Your quests will strengthen bonds and promote meaningful connections.',
  },
}
