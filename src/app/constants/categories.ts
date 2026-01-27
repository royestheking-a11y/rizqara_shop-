export const PRODUCT_CATEGORIES = [
    {
        id: 'clay',
        name: 'ক্লে (Clay)',
        subcategories: [
            { id: 'clay_vase', name: 'মাটির ফুলদানি (Clay Vase)' },
            { id: 'dinnerware', name: 'ডিনারওয়্যার (Dinnerware)' },
            { id: 'tea_coffee_set', name: 'চা ও কফি সেট (Tea & Coffee Set)' },
            { id: 'cooking_utensils', name: 'রান্নার সরঞ্জাম (Cooking Utensils)' },
            { id: 'decor_items', name: 'ডেকোরেশন আইটেম (Decoration Items)' },
            { id: 'customized_clay', name: 'কাস্টমাইজড (Customized)' },
        ]
    },
    {
        id: 'women',
        name: 'উইমেন প্রোডাক্ট (Women\'s Items)',
        subcategories: [
            { id: 'handmade_jewelry', name: 'হ্যান্ডমেড জুয়েলারি (Handmade Jewelry)' },
            { id: 'accessories', name: 'এক্সেসরিজ (Accessories)' },
            { id: 'bag_collection', name: 'ব্যাগ কালেকশন (Bag Collection)' },
            { id: 'clothing', name: 'পোশাক ও অন্যান্য (Clothing & Others)' },
        ]
    },
    {
        id: 'gift',
        name: 'গিফট বক্স (Gift Boxes)',
        subcategories: [
            { id: 'personal_gift', name: 'পার্সোনাল গিফট (Personal Gift)' },
            { id: 'couple_family', name: 'কাপল ও ফ্যামিলি (Couple & Family)' },
            { id: 'festival_special', name: 'উৎসব স্পেশাল (Festival Special)' },
            { id: 'corporate', name: 'কর্পোরেট (Corporate)' },
            { id: 'combo', name: 'কম্বো (Combo)' },
        ]
    },
    {
        id: 'art',
        name: 'ওয়াল আর্ট (Wall Art / Sketch)',
        subcategories: [
            { id: 'sketch_portrait', name: 'স্কেচ পোর্ট্রেট (Sketch Portrait)' },
            { id: 'custom_art', name: 'কাস্টম আর্ট (Custom Art)' },
            { id: 'calligraphy', name: 'ক্যালিগ্রাফি (Calligraphy)' },
            { id: 'frame_art', name: 'ফ্রেম আর্ট (Frame Art)' },
            { id: 'modern_art', name: 'মডার্ন আর্ট (Modern Art)' },
        ]
    },
    {
        id: 'plants',
        name: 'ইনডোর প্ল্যান্টস (Indoor Plants)',
        subcategories: [
            { id: 'popular_plants', name: 'জনপ্রিয় গাছ (Popular Plants)' },
            { id: 'gardening_tools', name: 'গার্ডেনিং টুলস (Gardening Tools)' },
        ]
    },
    {
        id: 'customized',
        name: 'কাস্টমাইজড (Customized Products)',
        subcategories: [
            { id: 'wearable', name: 'পরিধানযোগ্য (Wearable)' },
            { id: 'living_decor', name: 'লিভিং ও ডেকোর (Living & Decor)' },
            { id: 'stationery', name: 'স্টেশনারি (Stationery)' },
            { id: 'daily_usage', name: 'প্রতিদিনের ব্যবহার্য (Daily Usage)' },
            // 3rd Level Subcategories treated as Subcategories here for simplicity, 
            // or we can add a 'types' array if we want 3 levels strictly.
            // Based on user request "under customized product have this section", 
            // treating Jute, Wood, Bamboo as subcategories seems robust.
            // But they need their OWN sub-items. 
            // Let's use a 'types' field for them.
            {
                id: 'jute',
                name: 'পাটের পণ্য (Jute / Pat Items)',
                types: [
                    { id: 'jute_bags', name: 'পাটের ব্যাগ (Jute Bags)' },
                    { id: 'home_decor', name: 'হোম ডেকোর (Home Decor)' },
                    { id: 'organizer', name: 'অর্গানাইজার (Organizer)' },
                    { id: 'jute_stationery', name: 'স্টেশনারি (Stationery)' }
                ]
            },
            {
                id: 'wood',
                name: 'কাঠের পণ্য (Wood Items)',
                types: [
                    { id: 'kitchen_dining', name: 'কিচেন ও ডাইনিং (Kitchen & Dining)' },
                    { id: 'wood_decor', name: 'ডেকোর (Decor)' },
                    { id: 'wood_personal_gift', name: 'পার্সোনাল গিফট (Personal Gift)' },
                    { id: 'furniture', name: 'ফার্নিচার (Furniture)' }
                ]
            },
            {
                id: 'bamboo',
                name: 'বাঁশ ও বেতের পণ্য (Bamboo & Cane Items)',
                types: [
                    { id: 'basket_bowl', name: 'ঝুড়ি ও বাটি (Basket & Bowl)' },
                    { id: 'lighting', name: 'লাইটিং (Lighting)' },
                    { id: 'wall_art', name: 'ওয়াল আর্ট (Wall Art)' },
                    { id: 'accessories', name: 'এক্সেসরিজ (Accessories)' }
                ]
            },
        ]
    }
];
