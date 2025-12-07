import { db } from '@/db';
import { users } from '@/db/schema';

async function main() {
    const currentTimestamp = new Date().toISOString();
    
    const sampleUsers = [
        {
            email: 'test@novapal.com',
            name: 'Test User',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            email: 'demo@novapal.com',
            name: 'Demo User',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            email: 'guest@novapal.com',
            name: 'Guest User',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        }
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});