import { Lang } from '../theme/ThemeProvider';

const EN_PROMPTS = [
  'What is one thing you are grateful for today?',
  'What is on your mind right now?',
  'Describe a small moment that made today better.',
  'What is weighing on you, and what is one step you can take?',
  'Who did you connect with today, and how did it feel?',
  'What did you learn or notice today?',
  'What would make tomorrow feel like a good day?',
  'What are you looking forward to this week?',
  'Where did you spend your energy today?',
  'What is something you want to remember about today?',
  'What drained you, and what restored you?',
  'If today had a title, what would it be?',
  'What is a decision you are sitting with?',
  'Name three things you can see, hear, and feel right now.',
  'What did you do today that your future self will thank you for?',
];

const AR_PROMPTS = [
  'ما الشيء الذي تشعر بالامتنان له اليوم؟',
  'ما الذي يشغل بالك الآن؟',
  'صف لحظة صغيرة جعلت يومك أفضل.',
  'ما الذي يثقل كاهلك، وما الخطوة التي يمكنك اتخاذها؟',
  'بمن تواصلت اليوم، وكيف كان شعورك؟',
  'ماذا تعلمت أو لاحظت اليوم؟',
  'ما الذي يجعل الغد يومًا جيدًا؟',
  'ما الذي تتطلع إليه هذا الأسبوع؟',
  'أين صرفت طاقتك اليوم؟',
  'ما الشيء الذي تريد أن تتذكره عن هذا اليوم؟',
  'ما الذي أنهكك، وما الذي أعاد إليك نشاطك؟',
  'لو كان لهذا اليوم عنوان، فماذا سيكون؟',
  'ما القرار الذي تتأمل فيه هذه الأيام؟',
  'اذكر ثلاثة أشياء يمكنك رؤيتها وسماعها والإحساس بها الآن.',
  'ما الذي فعلته اليوم وسيشكرك عليه نفسك في المستقبل؟',
];

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

export function promptForDate(date: Date, lang: Lang): string {
  const list = lang === 'ar' ? AR_PROMPTS : EN_PROMPTS;
  return list[dayOfYear(date) % list.length];
}
