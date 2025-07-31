/**
 * Script to populate consultation page with sample provider data
 * Run this script to add sample fashion designers and tailors to your database
 * 
 * Usage: npm run populate-consultation
 */

require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  doc, 
  setDoc, 
  serverTimestamp,
  collection,
  getDocs,
  query,
  where
} = require('firebase/firestore');

// Firebase configuration (you may need to adjust this)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample data for providers
const sampleProviders = [
  {
    id: 'designer_1',
    name: 'Sophia Chen',
    email: 'sophia.chen@example.com',
    role: 'fashion_designer',
    photoURL: 'https://images.unsplash.com/photo-1494790108755-2616b6dc6653?w=400&h=400&fit=crop&crop=face',
    professional: {
      bio: 'Award-winning fashion designer with 8+ years experience in haute couture and ready-to-wear. Specialized in sustainable fashion and contemporary designs.',
      specializations: ['formal_wear', 'bridal_wear', 'custom_design', 'sustainable_fashion'],
      experience: 8,
      languages: ['English', 'Mandarin', 'French'],
      certifications: ['Fashion Institute of Technology - NYC', 'Sustainable Fashion Certificate'],
      city: 'New York',
      location: {
        city: 'New York',
        state: 'NY',
        country: 'USA'
      },
      workingHours: {
        monday: { start: '09:00', end: '18:00', available: true },
        tuesday: { start: '09:00', end: '18:00', available: true },
        wednesday: { start: '09:00', end: '18:00', available: true },
        thursday: { start: '09:00', end: '18:00', available: true },
        friday: { start: '09:00', end: '17:00', available: true },
        saturday: { start: '10:00', end: '16:00', available: true },
        sunday: { start: '10:00', end: '16:00', available: false }
      }
    },
    pricing: {
      chatRate: 45,
      callRate: 65,
      videoCallRate: 85,
      consultationRate: 120,
      pricingType: 'per_session',
      currency: 'USD'
    },
    portfolio: {
      images: [
        {
          id: '1',
          url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=400&fit=crop',
          description: 'Evening gown collection',
          uploadedAt: new Date()
        },
        {
          id: '2',
          url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&h=400&fit=crop',
          description: 'Bridal wear designs',
          uploadedAt: new Date()
        }
      ],
      description: 'Contemporary designs with sustainable materials',
      achievements: ['Fashion Week NYC 2023', 'Sustainable Fashion Award 2022']
    },
    rating: {
      average: 4.8,
      count: 127,
      reviews: []
    }
  },
  {
    id: 'designer_2',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    role: 'fashion_designer',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    professional: {
      bio: 'Traditional Indian fashion designer specializing in ethnic wear and fusion designs. Expert in handloom textiles and embroidery techniques.',
      specializations: ['ethnic_wear', 'embroidery', 'custom_design', 'traditional_wear'],
      experience: 12,
      languages: ['English', 'Hindi', 'Bengali'],
      certifications: ['NIFT Delhi', 'Traditional Textiles Certification'],
      city: 'Mumbai',
      location: {
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India'
      },
      workingHours: {
        monday: { start: '10:00', end: '19:00', available: true },
        tuesday: { start: '10:00', end: '19:00', available: true },
        wednesday: { start: '10:00', end: '19:00', available: true },
        thursday: { start: '10:00', end: '19:00', available: true },
        friday: { start: '10:00', end: '19:00', available: true },
        saturday: { start: '10:00', end: '18:00', available: true },
        sunday: { start: '11:00', end: '17:00', available: false }
      }
    },
    pricing: {
      chatRate: 35,
      callRate: 50,
      videoCallRate: 70,
      consultationRate: 90,
      pricingType: 'per_session',
      currency: 'USD'
    },
    portfolio: {
      images: [
        {
          id: '3',
          url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&h=400&fit=crop',
          description: 'Traditional sarees collection',
          uploadedAt: new Date()
        },
        {
          id: '4',
          url: 'https://images.unsplash.com/photo-1594736797933-d0fcc68d7e5c?w=600&h=400&fit=crop',
          description: 'Embroidered lehengas',
          uploadedAt: new Date()
        }
      ],
      description: 'Authentic Indian designs with modern touch',
      achievements: ['Lakme Fashion Week 2023', 'Traditional Crafts Excellence Award']
    },
    rating: {
      average: 4.9,
      count: 89,
      reviews: []
    }
  },
  {
    id: 'tailor_1',
    name: 'Maria Gonzalez',
    email: 'maria.gonzalez@example.com',
    role: 'tailor',
    photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    professional: {
      bio: 'Master tailor with 15 years of experience in alterations and custom tailoring. Specializes in perfect fits and garment modifications.',
      specializations: ['alterations', 'tailoring', 'formal_wear', 'custom_fitting'],
      experience: 15,
      languages: ['English', 'Spanish'],
      certifications: ['Master Tailor Certification', 'Pattern Making Certificate'],
      city: 'Los Angeles',
      location: {
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA'
      },
      workingHours: {
        monday: { start: '08:00', end: '17:00', available: true },
        tuesday: { start: '08:00', end: '17:00', available: true },
        wednesday: { start: '08:00', end: '17:00', available: true },
        thursday: { start: '08:00', end: '17:00', available: true },
        friday: { start: '08:00', end: '17:00', available: true },
        saturday: { start: '09:00', end: '15:00', available: true },
        sunday: { start: '10:00', end: '14:00', available: false }
      }
    },
    pricing: {
      chatRate: 25,
      callRate: 40,
      videoCallRate: 55,
      consultationRate: 75,
      pricingType: 'per_session',
      currency: 'USD'
    },
    portfolio: {
      images: [
        {
          id: '5',
          url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&h=400&fit=crop',
          description: 'Perfect suit alterations',
          uploadedAt: new Date()
        },
        {
          id: '6',
          url: 'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=600&h=400&fit=crop',
          description: 'Dress alterations and fitting',
          uploadedAt: new Date()
        }
      ],
      description: 'Precision tailoring for perfect fit',
      achievements: ['Master Tailor of the Year 2022', '20+ Years Excellence Award']
    },
    rating: {
      average: 4.7,
      count: 156,
      reviews: []
    }
  },
  {
    id: 'designer_3',
    name: 'Emma Thompson',
    email: 'emma.thompson@example.com',
    role: 'fashion_designer',
    photoURL: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face',
    professional: {
      bio: 'Contemporary fashion designer focusing on minimalist and sustainable designs. Expert in capsule wardrobes and versatile pieces.',
      specializations: ['casual_wear', 'sustainable_fashion', 'minimalist_design', 'styling'],
      experience: 6,
      languages: ['English', 'German'],
      certifications: ['Central Saint Martins', 'Sustainable Design Certificate'],
      city: 'London',
      location: {
        city: 'London',
        state: 'England',
        country: 'UK'
      },
      workingHours: {
        monday: { start: '09:00', end: '17:30', available: true },
        tuesday: { start: '09:00', end: '17:30', available: true },
        wednesday: { start: '09:00', end: '17:30', available: true },
        thursday: { start: '09:00', end: '17:30', available: true },
        friday: { start: '09:00', end: '17:00', available: true },
        saturday: { start: '10:00', end: '16:00', available: true },
        sunday: { start: '11:00', end: '15:00', available: false }
      }
    },
    pricing: {
      chatRate: 40,
      callRate: 60,
      videoCallRate: 80,
      consultationRate: 110,
      pricingType: 'per_session',
      currency: 'USD'
    },
    portfolio: {
      images: [
        {
          id: '7',
          url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop',
          description: 'Minimalist capsule collection',
          uploadedAt: new Date()
        },
        {
          id: '8',
          url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=400&fit=crop',
          description: 'Sustainable fashion line',
          uploadedAt: new Date()
        }
      ],
      description: 'Minimalist designs for modern lifestyle',
      achievements: ['London Fashion Week 2023', 'Eco Fashion Award 2022']
    },
    rating: {
      average: 4.6,
      count: 78,
      reviews: []
    }
  },
  {
    id: 'tailor_2',
    name: 'Ahmed Hassan',
    email: 'ahmed.hassan@example.com',
    role: 'tailor',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    professional: {
      bio: 'Expert tailor specializing in men\'s formal wear and traditional Middle Eastern clothing. Known for precision and attention to detail.',
      specializations: ['formal_wear', 'men_suits', 'traditional_wear', 'alterations'],
      experience: 20,
      languages: ['English', 'Arabic', 'French'],
      certifications: ['Master Tailor Dubai', 'Traditional Garments Specialist'],
      city: 'Dubai',
      location: {
        city: 'Dubai',
        state: 'Dubai',
        country: 'UAE'
      },
      workingHours: {
        saturday: { start: '09:00', end: '18:00', available: true },
        sunday: { start: '09:00', end: '18:00', available: true },
        monday: { start: '09:00', end: '18:00', available: true },
        tuesday: { start: '09:00', end: '18:00', available: true },
        wednesday: { start: '09:00', end: '18:00', available: true },
        thursday: { start: '09:00', end: '17:00', available: true },
        friday: { start: '14:00', end: '18:00', available: false }
      }
    },
    pricing: {
      chatRate: 30,
      callRate: 45,
      videoCallRate: 65,
      consultationRate: 85,
      pricingType: 'per_session',
      currency: 'USD'
    },
    portfolio: {
      images: [
        {
          id: '9',
          url: 'https://images.unsplash.com/photo-1594736797933-d0fcc68d7e5c?w=600&h=400&fit=crop',
          description: 'Bespoke men\'s suits',
          uploadedAt: new Date()
        },
        {
          id: '10',
          url: 'https://images.unsplash.com/photo-1581803118522-7b72a50f7e9f?w=600&h=400&fit=crop',
          description: 'Traditional thobes and dishdashas',
          uploadedAt: new Date()
        }
      ],
      description: 'Expert craftsmanship in formal and traditional wear',
      achievements: ['Best Tailor Dubai 2022', 'Traditional Crafts Master']
    },
    rating: {
      average: 4.9,
      count: 203,
      reviews: []
    }
  },
  {
    id: 'designer_4',
    name: 'Yuki Tanaka',
    email: 'yuki.tanaka@example.com',
    role: 'fashion_designer',
    photoURL: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
    professional: {
      bio: 'Avant-garde fashion designer blending traditional Japanese aesthetics with modern streetwear. Known for innovative silhouettes and unique textures.',
      specializations: ['streetwear', 'avant_garde', 'custom_design', 'pattern_making'],
      experience: 10,
      languages: ['English', 'Japanese', 'Korean'],
      certifications: ['Bunka Fashion College Tokyo', 'Avant-garde Design Certificate'],
      city: 'Tokyo',
      location: {
        city: 'Tokyo',
        state: 'Tokyo',
        country: 'Japan'
      },
      workingHours: {
        monday: { start: '10:00', end: '19:00', available: true },
        tuesday: { start: '10:00', end: '19:00', available: true },
        wednesday: { start: '10:00', end: '19:00', available: true },
        thursday: { start: '10:00', end: '19:00', available: true },
        friday: { start: '10:00', end: '19:00', available: true },
        saturday: { start: '11:00', end: '18:00', available: true },
        sunday: { start: '12:00', end: '17:00', available: false }
      }
    },
    pricing: {
      chatRate: 50,
      callRate: 70,
      videoCallRate: 95,
      consultationRate: 130,
      pricingType: 'per_session',
      currency: 'USD'
    },
    portfolio: {
      images: [
        {
          id: '11',
          url: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&h=400&fit=crop',
          description: 'Avant-garde streetwear collection',
          uploadedAt: new Date()
        },
        {
          id: '12',
          url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&h=400&fit=crop',
          description: 'Japanese-inspired modern designs',
          uploadedAt: new Date()
        }
      ],
      description: 'Fusion of traditional Japanese and modern aesthetics',
      achievements: ['Tokyo Fashion Week 2023', 'Innovation in Design Award']
    },
    rating: {
      average: 4.8,
      count: 95,
      reviews: []
    }
  },
  {
    id: 'tailor_3',
    name: 'Isabella Rodriguez',
    email: 'isabella.rodriguez@example.com',
    role: 'tailor',
    photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    professional: {
      bio: 'Specialized children\'s tailor with expertise in growing children\'s clothing and special occasion wear. Mother of three with passion for kids\' fashion.',
      specializations: ['children_wear', 'alterations', 'special_occasion', 'growth_adjustments'],
      experience: 12,
      languages: ['English', 'Spanish', 'Portuguese'],
      certifications: ['Children\'s Tailoring Specialist', 'Special Occasion Wear Certificate'],
      city: 'Barcelona',
      location: {
        city: 'Barcelona',
        state: 'Catalonia',
        country: 'Spain'
      },
      workingHours: {
        monday: { start: '09:30', end: '17:00', available: true },
        tuesday: { start: '09:30', end: '17:00', available: true },
        wednesday: { start: '09:30', end: '17:00', available: true },
        thursday: { start: '09:30', end: '17:00', available: true },
        friday: { start: '09:30', end: '16:00', available: true },
        saturday: { start: '10:00', end: '15:00', available: true },
        sunday: { start: '11:00', end: '14:00', available: false }
      }
    },
    pricing: {
      chatRate: 28,
      callRate: 42,
      videoCallRate: 58,
      consultationRate: 70,
      pricingType: 'per_session',
      currency: 'USD'
    },
    portfolio: {
      images: [
        {
          id: '13',
          url: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&h=400&fit=crop',
          description: 'Children\'s formal wear',
          uploadedAt: new Date()
        },
        {
          id: '14',
          url: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&h=400&fit=crop',
          description: 'Special occasion dresses for kids',
          uploadedAt: new Date()
        }
      ],
      description: 'Specialized in children\'s clothing and alterations',
      achievements: ['Best Children\'s Tailor Barcelona 2022', 'Family Fashion Excellence Award']
    },
    rating: {
      average: 4.9,
      count: 142,
      reviews: []
    }
  }
];

// Function to check if providers already exist
async function checkExistingProviders() {
  console.log('Checking for existing providers...');
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('role', 'in', ['fashion_designer', 'tailor']));
  const snapshot = await getDocs(q);
  
  return snapshot.size;
}

// Function to create a provider
async function createProvider(providerData) {
  try {
    const userRef = doc(db, 'users', providerData.id);
    
    const userData = {
      ...providerData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      last_sign_in_at: serverTimestamp(),
      likedBlogs: [],
      activity: [],
      blogCount: 0
    };
    
    await setDoc(userRef, userData);
    console.log(`✅ Created provider: ${providerData.name} (${providerData.role})`);
    return true;
  } catch (error) {
    console.error(`❌ Error creating provider ${providerData.name}:`, error);
    return false;
  }
}

// Main function to populate data
async function populateConsultationData() {
  console.log('🚀 Starting consultation data population...\n');
  
  try {
    // Check if data already exists
    const existingCount = await checkExistingProviders();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing providers.`);
      console.log('Do you want to continue and add more providers? (This script will not create duplicates by ID)');
      // In a real scenario, you might want to prompt for user input here
    }
    
    console.log(`📝 Creating ${sampleProviders.length} sample providers...\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Create all providers
    for (const provider of sampleProviders) {
      const success = await createProvider(provider);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n📊 Summary:');
    console.log(`✅ Successfully created: ${successCount} providers`);
    console.log(`❌ Errors: ${errorCount} providers`);
    
    if (successCount > 0) {
      console.log('\n🎉 Consultation data population completed successfully!');
      console.log('You can now visit your consultation page to see the providers.');
      
      console.log('\n📋 Created providers:');
      sampleProviders.forEach((provider, index) => {
        console.log(`${index + 1}. ${provider.name} - ${provider.role} (${provider.professional.city})`);
      });
    }
    
  } catch (error) {
    console.error('💥 Fatal error during population:', error);
    process.exit(1);
  }
}

// Helper function to display usage information
function displayUsage() {
  console.log(`
📚 Consultation Data Population Script

This script creates sample fashion designers and tailors for your consultation page.

🔧 Setup:
1. Ensure your Firebase environment variables are set in .env.local
2. Make sure your Firebase project has the necessary permissions

📦 What this script creates:
- 4 Fashion Designers with diverse specializations
- 3 Tailors with different expertise areas
- Complete profiles with ratings, portfolios, and pricing
- Providers from different cities worldwide

🌍 Sample providers include:
- Sophia Chen (NYC) - Haute couture & sustainable fashion
- Rajesh Kumar (Mumbai) - Traditional Indian wear
- Maria Gonzalez (LA) - Master tailor & alterations
- Emma Thompson (London) - Minimalist & sustainable design
- Ahmed Hassan (Dubai) - Men's formal & traditional wear
- Yuki Tanaka (Tokyo) - Avant-garde streetwear
- Isabella Rodriguez (Barcelona) - Children's specialist

🚀 Run the script:
node scripts/populate-consultation-data.js
  `);
}

// Check if this script is being run directly
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  displayUsage();
  process.exit(0);
}

// Run the population script
populateConsultationData()
  .then(() => {
    console.log('\n✨ Script completed. Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
