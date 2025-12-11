import { storage } from "./storage";
import { getUserColorByIndex } from "@shared/colors";
import bcrypt from "bcryptjs";

export async function seedDatabase() {
  console.log('Seeding database...');

  try {
    // Hash default password for demo users
    const defaultPassword = await bcrypt.hash('demo123', 10);

    // Create demo users
    const users = [
      {
        username: 'runner_pro',
        name: 'Carlos Martinez',
        password: defaultPassword,
        color: getUserColorByIndex(0),
        avatar: '',
      },
      {
        username: 'maria_runner',
        name: 'Maria Gonzalez',
        password: defaultPassword,
        color: getUserColorByIndex(1),
        avatar: '',
      },
      {
        username: 'juancho_run',
        name: 'Juan Perez',
        password: defaultPassword,
        color: getUserColorByIndex(2),
        avatar: '',
      },
      {
        username: 'ana_fitness',
        name: 'Ana Lopez',
        password: defaultPassword,
        color: getUserColorByIndex(3),
        avatar: '',
      },
      {
        username: 'pedro_trail',
        name: 'Pedro Sanchez',
        password: defaultPassword,
        color: getUserColorByIndex(4),
        avatar: '',
      },
    ];

    const createdUsers = [];
    for (const userData of users) {
      const existingUser = await storage.getUserByUsername(userData.username);
      if (!existingUser) {
        const user = await storage.createUser(userData);
        createdUsers.push(user);
        console.log(`✓ Created user: ${user.name} (@${user.username})`);
      } else {
        createdUsers.push(existingUser);
        console.log(`- User already exists: ${existingUser.name} (@${existingUser.username})`);
      }
    }

    // Create some friendships
    if (createdUsers.length >= 3) {
      // User 1 is friends with users 2, 3, 4
      for (let i = 1; i < 4; i++) {
        const exists = await storage.checkFriendship(createdUsers[0].id, createdUsers[i].id);
        if (!exists) {
          await storage.createFriendship({
            userId: createdUsers[0].id,
            friendId: createdUsers[i].id,
          });
          console.log(`✓ Created friendship: ${createdUsers[0].name} -> ${createdUsers[i].name}`);
        }
      }
    }

    console.log('Database seeded successfully!');
    console.log(`Default user for testing: ${createdUsers[0].name} (@${createdUsers[0].username})`);
    console.log(`User ID: ${createdUsers[0].id}`);
    console.log(`Default password for all demo users: demo123`);
    
    return createdUsers[0];
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}
