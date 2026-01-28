const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');
const Review = require('./models/Review');
const Message = require('./models/Message');
const Notification = require('./models/Notification');
const Voucher = require('./models/Voucher');
const Carousel = require('./models/Carousel');
const Payment = require('./models/Payment');
const Refund = require('./models/Refund');
const Setting = require('./models/Setting');
const connectDB = require('./config/db');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const seedData = async () => {
    try {
        await connectDB();
        console.log('DB Connected for Seeding');

        // Note: Intentionally NOT clearing key collections like Users/Orders to prevent data loss during fix.
        // Only checking if empty to initialize.

        // Create Admin User if not exists
        // Create or Update Admin User
        const adminEmail = 'admin@rizqara.com';
        const adminPassword = 'rizqara88';

        const adminUser = await User.findOne({ email: adminEmail });

        if (adminUser) {
            adminUser.password = adminPassword;
            await adminUser.save();
            console.log('Admin User Password Updated');
        } else {
            await User.create({
                name: 'Admin User',
                email: adminEmail,
                password: adminPassword,
                role: 'admin',
                phone: '01700000000'
            });
            console.log('Admin User Created');
        }

        // Products
        await Product.deleteMany({});
        const products = await Product.create([
            {
                id: 'p1',
                title_bn: 'মসলিন শাড়ি',
                title_en: 'Muslin Saree',
                desc_bn: 'ঐতিহ্যবাহী ঢাকাই মসলিন শাড়ি',
                desc_en: 'Traditional Dhakai Muslin Saree',
                price: 15000,
                discount_price: 12000,
                category: 'Women',
                stock: 10,
                images: ['https://images.unsplash.com/photo-1616682708307-e85dfc093a19?auto=format&fit=crop&q=80&w=600']
            },
            {
                id: 'p2',
                title_bn: 'টেরাকোটা ঘর সাজানোর সামগ্রী',
                title_en: 'Terracotta Home Decor',
                desc_bn: 'হাতের তৈরি মাটির শিল্পকর্ম',
                desc_en: 'Handmade clay artwork',
                price: 1200,
                category: 'Clay',
                stock: 25,
                images: ['https://images.unsplash.com/photo-1594498653385-d5172c532c00?auto=format&fit=crop&q=80&w=600']
            },
            {
                id: 'p3',
                title_bn: 'মাটির ফুলদানি',
                title_en: 'Clay Flower Vase',
                desc_bn: 'সৌন্দর্য বর্ধনকারী মাটির ফুলদানি',
                desc_en: 'Beautiful clay flower vase for home decor',
                price: 850,
                category: 'Clay',
                stock: 15,
                images: ['https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=600']
            },
            {
                id: 'p4',
                title_bn: 'মাটির থালা ও বাটি সেট',
                title_en: 'Clay Dinner Set',
                desc_bn: 'ঐতিহ্যবাহী মাটির থালা ও বাটি',
                desc_en: 'Traditional clay dinner set with plates and bowls',
                price: 2500,
                category: 'Clay',
                stock: 8,
                images: ['https://images.unsplash.com/photo-1622378363740-4f535352c80c?auto=format&fit=crop&q=80&w=600']
            },
            {
                id: 'p5',
                title_bn: 'মাটির প্রদীপ',
                title_en: 'Clay Lamp (Pradip)',
                desc_bn: 'উৎসবের জন্য মাটির প্রদীপ',
                desc_en: 'Handcrafted clay lamps for festivals and decoration',
                price: 350,
                category: 'Clay',
                stock: 50,
                images: ['https://images.unsplash.com/photo-1516961642265-531546e84af2?auto=format&fit=crop&q=80&w=600']
            },
            {
                id: 'p6',
                title_bn: 'স্নেক প্ল্যান্ট',
                title_en: 'Snake Plant',
                desc_bn: 'অক্সিজেন সরবরাহকারী ইনডোর প্ল্যান্ট',
                desc_en: 'Oxygen-producing indoor plant',
                price: 450,
                category: 'Plants',
                stock: 20,
                images: ['https://images.unsplash.com/photo-1593482892290-f54927ae1ebb?auto=format&fit=crop&q=80&w=600']
            },
            {
                id: 'p7',
                title_bn: 'অ্যালোভেরা',
                title_en: 'Aloe Vera',
                desc_bn: 'প্রাকৃতিক ও ঔষধি গুণসম্পন্ন গাছ',
                desc_en: 'Natural and medicinal indoor plant',
                price: 300,
                category: 'Plants',
                stock: 30,
                images: ['https://images.unsplash.com/photo-1596547609652-9cf5d8d7f93f?auto=format&fit=crop&q=80&w=600']
            }
        ]);
        console.log('Products Re-seeded');

        // Vouchers
        await Voucher.deleteMany({});
        await Voucher.create([
            {
                code: 'WELCOME10',
                discount: 10,
                description_bn: 'প্রথম অর্ডারে ১০% ছাড়',
                description_en: '10% OFF on first order',
                minPurchase: 500,
                maxDiscount: 500,
                validUntil: '2026-12-31',
                isActive: true,
                usageLimit: 1000,
                usedCount: 45
            },
            {
                code: 'FLASH20',
                discount: 20,
                description_bn: 'ফ্ল্যাশ সেল - ২০% ছাড়',
                description_en: 'Flash Sale - 20% OFF',
                minPurchase: 1000,
                maxDiscount: 1000,
                validUntil: '2026-02-28',
                isActive: true,
                usageLimit: 500,
                usedCount: 123
            }
        ]);
        console.log('Vouchers Re-seeded');

        // Carousels
        await Carousel.deleteMany({});
        await Carousel.create([
            {
                image: 'https://images.unsplash.com/photo-1692992193981-d3d92fabd9cb?auto=format&fit=crop&q=80&w=1920',
                link: '/shop?cat=Women',
                isActive: true,
                order: 1
            },
            {
                image: 'https://images.unsplash.com/photo-1642582615780-35343a19fd65?auto=format&fit=crop&q=80&w=1920',
                link: '/shop?cat=Clay',
                isActive: true,
                order: 2
            },
            {
                image: 'https://images.unsplash.com/photo-1640253621029-7ec13d3b1ece?auto=format&fit=crop&q=80&w=1920',
                link: '/shop?cat=Gifts',
                isActive: true,
                order: 3
            }
        ]);
        console.log('Carousels Re-seeded');

        // Reviews
        await Review.deleteMany({});
        await Review.create([
            {
                productId: 'p1',
                userName: 'Sadia Rahman',
                rating: 5,
                comment: 'খুবই সুন্দর শাড়ি, ঠিক যেমন চেয়েছিলাম।',
                date: '2025-10-12',
            },
            {
                productId: 'p2',
                userName: 'Karim Ahmed',
                rating: 4,
                comment: 'Good quality, but delivery was a bit late.',
                date: '2025-10-10',
            }
        ]);
        console.log('Reviews Re-seeded');


        // Settings (Sketch Pricing)
        if (await Setting.countDocuments() === 0) {
            await Setting.create({
                key: 'sketch_pricing',
                value: {
                    A5: { onePieceNoFrame: 500, onePieceWithFrame: 700, twoPieceNoFrame: 900, twoPieceWithFrame: 1300 },
                    A4: { onePieceNoFrame: 800, onePieceWithFrame: 1200, twoPieceNoFrame: 1400, twoPieceWithFrame: 2100 }
                }
            });
            console.log('Settings Seeded');
        }

        // Dummy Payment
        if (await Payment.countDocuments() === 0) {
            await Payment.create({
                userId: 'dummy',
                orderId: 'dummy_ord',
                amount: 100,
                method: 'cod',
                status: 'pending'
            });
            console.log('Payment Collection Initialized');
        }

        // Dummy Refund
        if (await Refund.countDocuments() === 0) {
            await Refund.create({
                userId: 'dummy',
                orderId: 'dummy_ord',
                amount: 100,
                reason: 'test',
                status: 'pending'
            });
            console.log('Refund Collection Initialized');
        }

        // Dummy Message
        if (await Message.countDocuments() === 0) {
            await Message.create({
                senderId: 'system',
                receiverId: 'admin',
                text: 'System Initialized'
            });
            console.log('Message Collection Initialized');
        }

        // Dummy Notification
        if (await Notification.countDocuments() === 0) {
            await Notification.create({
                userId: 'admin',
                type: 'general',
                title_en: 'System Ready'
            });
            console.log('Notification Collection Initialized');
        }

        console.log('All Collections Seeded/Checked');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
