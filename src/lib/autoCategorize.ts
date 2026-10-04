import { Strings } from '../i18n/strings';

export type CategoryKey =
  | 'produce'
  | 'dairy'
  | 'bakery'
  | 'meat'
  | 'pantry'
  | 'frozen'
  | 'beverages'
  | 'household'
  | 'personal'
  | 'other';

export const CATEGORY_ORDER: CategoryKey[] = [
  'produce',
  'dairy',
  'bakery',
  'meat',
  'pantry',
  'frozen',
  'beverages',
  'household',
  'personal',
  'other',
];

export const CATEGORY_LABEL_KEY: Record<CategoryKey, keyof Strings> = {
  produce: 'catProduce',
  dairy: 'catDairy',
  bakery: 'catBakery',
  meat: 'catMeat',
  pantry: 'catPantry',
  frozen: 'catFrozen',
  beverages: 'catBeverages',
  household: 'catHousehold',
  personal: 'catPersonal',
  other: 'ungrouped',
};

const fold = (s: string) =>
  s
    .toLowerCase()
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ىئ]/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));

type Keywords = { en: string[]; ar: string[] };

const KEYWORDS: Record<Exclude<CategoryKey, 'other'>, Keywords> = {
  produce: {
    en: [
      'apple', 'banana', 'tomato', 'lettuce', 'onion', 'potato', 'carrot', 'orange',
      'lemon', 'cucumber', 'grape', 'fruit', 'vegetable', 'veggie', 'salad', 'spinach',
      'pepper', 'garlic', 'avocado', 'strawberry',
    ],
    ar: [
      'خضار', 'فواكه', 'فاكهه', 'تفاح', 'موز', 'طماطم', 'بندوره', 'بصل', 'بطاطا',
      'جزر', 'خيار', 'برتقال', 'ليمون', 'عنب', 'خس', 'سبانخ', 'ثوم', 'افوكادو', 'فراوله',
    ],
  },
  dairy: {
    en: ['milk', 'cheese', 'yogurt', 'yoghurt', 'butter', 'egg', 'eggs'],
    ar: ['حليب', 'جبن', 'جبنه', 'زبادي', 'لبن', 'زبده', 'بيض'],
  },
  bakery: {
    en: ['bread', 'bun', 'bagel', 'croissant', 'cake', 'pastry', 'toast', 'donut', 'muffin'],
    ar: ['خبز', 'صمون', 'صامون', 'كعك', 'معجنات', 'فطيره', 'توست', 'دونات', 'كيك'],
  },
  meat: {
    en: ['meat', 'chicken', 'beef', 'lamb', 'fish', 'shrimp', 'pork', 'turkey', 'sausage', 'mince'],
    ar: ['لحم', 'لحمه', 'دجاج', 'سمك', 'بقر', 'غنم', 'ربيان', 'نقانق', 'مفروم'],
  },
  pantry: {
    en: [
      'rice', 'pasta', 'flour', 'sugar', 'salt', 'oil', 'beans', 'lentil', 'spice',
      'sauce', 'cereal', 'tea', 'coffee', 'honey', 'nuts', 'jam', 'vinegar',
    ],
    ar: [
      'رز', 'ارز', 'معكرونه', 'طحين', 'سكر', 'ملح', 'زيت', 'فاصوليا', 'عدس', 'بهار',
      'صلصه', 'شاي', 'قهوه', 'عسل', 'مكسرات', 'مربى', 'خل',
    ],
  },
  frozen: {
    en: ['frozen', 'ice cream', 'ice-cream', 'icecream', 'popsicle'],
    ar: ['مجمد', 'مجمده', 'مثلج', 'مثلجات', 'ايس كريم', 'بوظه'],
  },
  beverages: {
    en: ['water', 'juice', 'soda', 'cola', 'lemonade', 'soft drink', 'drink'],
    ar: ['ماء', 'مياه', 'عصير', 'مشروب', 'مشروبات', 'كولا', 'ليموناضه'],
  },
  household: {
    en: [
      'soap', 'detergent', 'cleaner', 'tissue', 'napkin', 'trash', 'garbage', 'bleach',
      'sponge', 'towel', 'laundry', 'dish',
    ],
    ar: [
      'صابون', 'منظف', 'منظفات', 'مناديل', 'قمامه', 'نفايات', 'كيس', 'اكياس', 'مكنسه',
      'غساله', 'جلي', 'مبيض',
    ],
  },
  personal: {
    en: [
      'shampoo', 'toothpaste', 'toothbrush', 'deodorant', 'razor', 'lotion', 'makeup',
      'perfume', 'diaper', 'conditioner',
    ],
    ar: ['شامبو', 'معجون', 'فرشاه', 'مزيل', 'شفره', 'كريم', 'مكياج', 'عطر', 'حفاض', 'بلسم'],
  },
};

export function categorize(title: string, ar: boolean): CategoryKey {
  const folded = fold(title);
  if (!folded.trim()) return 'other';
  for (const cat of CATEGORY_ORDER) {
    if (cat === 'other') continue;
    const kw = KEYWORDS[cat];
    const lists = ar ? [kw.ar, kw.en] : [kw.en, kw.ar];
    for (const list of lists) {
      for (const word of list) {
        if (folded.includes(fold(word))) return cat;
      }
    }
  }
  return 'other';
}
