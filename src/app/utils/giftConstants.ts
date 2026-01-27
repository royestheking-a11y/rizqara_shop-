import { Cake, Heart, Moon, Flame, Users, PartyPopper, Gem, Leaf, Palette, Smile } from 'lucide-react';

export const OCCASIONS = [
    { id: 'birthday', label: 'জন্মদিন', Icon: Cake, tags: ['birthday', 'gift_box'], color: 'bg-pink-100 text-pink-600' },
    { id: 'love', label: 'ভালোবাসা', Icon: Heart, tags: ['love', 'romantic', 'anniversary'], color: 'bg-red-100 text-red-600' },
    { id: 'eid', label: 'ঈদ', Icon: Moon, tags: ['eid', 'traditional', 'clothing'], color: 'bg-green-100 text-green-600' },
    { id: 'puja', label: 'পূজা', Icon: Flame, tags: ['puja', 'traditional', 'decor', 'art'], color: 'bg-orange-100 text-orange-600' },
    { id: 'friendship', label: 'বন্ধুত্ব', Icon: Users, tags: ['friend', 'gift', 'accessories'], color: 'bg-yellow-100 text-yellow-600' },
    { id: 'other', label: 'অন্যান্য', Icon: PartyPopper, tags: ['gift'], color: 'bg-purple-100 text-purple-600' },
];

export const PERSON_TYPES = [
    { id: 'gf', label: 'গার্লফ্রেন্ড', tags: ['women', 'jewelry', 'fashion', 'love'] },
    { id: 'bf', label: 'বয়ফ্রেন্ড', tags: ['men', 'watch', 'fashion', 'love'] },
    { id: 'mom', label: 'মা', tags: ['women', 'saree', 'home', 'traditional', 'mom'] },
    { id: 'dad', label: 'বাবা', tags: ['men', 'panjabi', 'decor', 'dad'] },
    { id: 'friend', label: 'বন্ধু', tags: ['friend', 'gift', 'casual'] },
    { id: 'wife', label: 'স্ত্রী', tags: ['women', 'saree', 'jewelry', 'wife'] },
    { id: 'husband', label: 'স্বামী', tags: ['men', 'fashion', 'husband'] },
    { id: 'self', label: 'নিজের জন্য', tags: ['fashion', 'hobby', 'decor'] },
];

export const MOODS = [
    { id: 'romantic', label: 'রোমান্টিক', Icon: Heart, tags: ['romantic', 'love'] },
    { id: 'premium', label: 'প্রিমিয়াম', Icon: Gem, tags: ['premium', 'luxury'] },
    { id: 'traditional', label: 'ট্র্যাডিশনাল', Icon: Leaf, tags: ['traditional', 'art', 'craft'] },
    { id: 'arty', label: 'আর্টি', Icon: Palette, tags: ['art', 'creative'] },
    { id: 'simple', label: 'সিম্পল', Icon: Smile, tags: ['simple', 'minimal'] },
];

export const BUDGETS = [
    { id: 'low', label: '৫০০৳ এর মধ্যে', min: 0, max: 500 },
    { id: 'medium', label: '৫০০ - ১০০০৳', min: 501, max: 1000 },
    { id: 'high', label: '১০০০ - ২০০০৳', min: 1001, max: 2000 },
    { id: 'premium', label: '২০০০৳+', min: 2001, max: 50000 },
];
