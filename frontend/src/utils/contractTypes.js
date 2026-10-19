/**
 * Centralized Contract Types Definition for System Tree House
 * "الفرش كامل" is the first-class contract type across the entire platform.
 */

export const CONTRACT_TYPES = [
  {
    id: 'full_furnishing',
    title: 'الفرش كامل',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'تأثيث كامل للمنزل شامل المطابخ، الدريسنج، الغرف، ووحدات الحمام'
  },
  {
    id: 'kitchen',
    title: 'مطبخ',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'مطابخ خشب، بولي لاك، أكريليك، وألمونيوم'
  },
  {
    id: 'dressing',
    title: 'دريسنج',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'غرف ملابس ودواليب حديثة'
  },
  {
    id: 'rooms',
    title: 'غرف',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'غرف نوم رئيسية، أطفال، ومعيشة'
  },
  {
    id: 'bathroom',
    title: 'وحدات حمام',
    badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    description: 'وحدات موبيليا للحمام ضد الرطوبة والمياه'
  }
];

export const CONTRACT_TYPE_NAMES = CONTRACT_TYPES.map(t => t.title);
