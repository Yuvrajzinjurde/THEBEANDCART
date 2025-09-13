import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed';

export async function POST() {
  try {
    const result = await seedDatabase();
    return NextResponse.json({ message: 'Database seeded successfully!', result }, { status: 200 });
  } catch (error: any) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ message: 'Failed to seed database', error: error.message }, { status: 500 });
  }
}