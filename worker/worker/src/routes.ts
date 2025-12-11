import { Hono } from 'hono';
import { createDb } from './db';
import { WorkerStorage } from './storage';
import { insertUserSchema, insertRouteSchema, insertFriendshipSchema, type InsertRoute } from '../../shared/schema';
import * as turf from '@turf/turf';
import type { Env } from './index';

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'runna_salt_2024');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computedHash = await hashPassword(password);
  return computedHash === hash;
}

export function registerRoutes(app: Hono<{ Bindings: Env }>) {
  
  app.post('/api/seed', async (c) => {
    try {
      const db = createDb(c.env.DATABASE_URL);
      const storage = new WorkerStorage(db);
      
      const existingUsers = await storage.getAllUsersWithStats();
      if (existingUsers.length > 0) {
        return c.json({ message: "Database already has users", defaultUser: existingUsers[0] });
      }

      const hashedPassword = await hashPassword('demo123');
      const user = await storage.createUser({
        username: "demo_runner",
        name: "Demo Runner",
        password: hashedPassword,
        color: "#3B82F6",
        avatar: null,
      });

      return c.json({ message: "Database seeded successfully", defaultUser: user });
    } catch (error: any) {
      return c.json({ error: error.message }, 500);
    }
  });

  app.get('/api/current-user/:userId', async (c) => {
    try {
      const db = createDb(c.env.DATABASE_URL);
      const storage = new WorkerStorage(db);
      const userId = c.req.param('userId');
      const user = await storage.getUser(userId);
      if (!user) {
        return c.json({ error: "User not found" }, 404);
      }
      const allUsers = await storage.getAllUsersWithStats();
      const userWithStats = allUsers.find(u => u.id === userId);
      const { password: _, ...userWithoutPassword } = userWithStats || user;
      return c.json(userWithoutPassword);
    } catch (error: any) {
      return c.json({ error: error.message }, 500);
    }
  });

  app.post('/api/auth/login', async (c) => {
    try {
      const db = createDb(c.env.DATABASE_URL);
      const storage = new WorkerStorage(db);
      const body = await c.req.json();
      const { username, password } = body;
      
      if (!username || !password) {
        return c.json({ error: "Username y password son requeridos" }, 400);
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return c.json({ error: "Usuario no encontrado" }, 401);
      }

      const isValid = await verifyPassword(password, user.password);
      if (!isValid) {
        return c.json({ error: "Contraseña incorrecta" }, 401);
      }

      const { password: _, ...userWithoutPassword } = user;
      return c.json(userWithoutPassword);
    } catch (error: any) {
      return c.json({ error: error.message }, 500);
    }
  });

  app.post('/api/users', async (c) => {
    try {
      const db = createDb(c.env.DATABASE_URL);
      const storage = new WorkerStorage(db);
      const body = await c.req.json();
      const { password, ...userData } = body;
      
      if (!password || password.length < 4) {
        return c.json({ error: "La contraseña debe tener al menos 4 caracteres" }, 400);
      }

      const hashedPassword = await hashPassword(password);
      const validatedData = insertUserSchema.parse({
        ...userData,
        password: hashedPassword,
      });
      const user = await storage.createUser(validatedData);
      
      const { password: _, ...userWithoutPassword } = user;
      return c.json(userWithoutPassword);
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  });

  app.get('/api/user/:id', async (c) => {
    try {
      const db = createDb(c.env.DATABASE_URL);
      const storage = new WorkerStorage(db);
      const id = c.req.param('id');
      const user = await storage.getUser(id);
      
      if (!user) {
        return c.json({ error: "User not found" }, 404);
      }

      const allUsers = await storage.getAllUsersWithStats();
      const userWithStats = allUsers.find(u => u.id === id);

      return c.json(userWithStats || user);
    } catch (error: any) {
      return c.json({ error: error.message }, 500);
    }
  });

  app.patch('/api/users/:id', async (c) => {
    try {
      const db = createDb(c.env.DATABASE_URL);
      const storage = new WorkerStorage(db);
      const id = c.req.param('id');
      const body = await c.req.json();
      const { name, color, avatar } = body;
      
      const updateData: Partial<{ name: string; color: string; avatar: string }> = {};
      if (name !== undefined) updateData.name = name;
      if (color !== undefined) updateData.color = color;
      if (avatar !== undefined) updateData.avatar = avatar;

      const updatedUser = await storage.updateUser(id, updateData);
      return c.json(updatedUser);
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  });

  app.get('/api/leaderboard', async (c) => {
    try {
      const db = createDb(c.env.DATABASE_URL);
      const storage = new WorkerStorage(db);
      const users = await storage.getAllUsersWithStats();
      return c.json(users);
    } catch (error: any) {
      return c.json({ error: error.message }, 500);
    }
  });

  app.post('/api/routes', async (c) => {
    try {
      const db = createDb(c.env.DATABASE_URL);
      const storage = new WorkerStorage(db);
      const body = await c.req.json();
      const routeData = insertRouteSchema.parse(body);
      
      const route = await storage.createRoute(routeData);

      if (routeData.coordinates.length >= 3) {
        try {
          const coords = routeData.coordinates as [number, number][];
          const lineString = turf.lineString(
            coords.map((coord: [number, number]) => [coord[1], coord[0]])
          );
          
          const buffered = turf.buffer(lineString, 0.05, { units: 'kilometers' });
          
          if (buffered) {
            const area = turf.area(buffered);
            
            const allTerritories = await storage.getAllTerritories();
            const userTerritories = allTerritories.filter(t => t.userId === routeData.userId);
            const otherTerritories = allTerritories.filter(t => t.userId !== routeData.userId);

            for (const otherTerritory of otherTerritories) {
              try {
                const otherPoly = turf.polygon(otherTerritory.geometry.coordinates);
                const intersection = turf.intersect(
                  turf.featureCollection([buffered, otherPoly])
                );

                if (intersection) {
                  await storage.deleteTerritoryById(otherTerritory.id);
                  
                  const otherUserTerritories = await storage.getTerritoriesByUserId(otherTerritory.userId);
                  const newTotalArea = otherUserTerritories
                    .filter(t => t.id !== otherTerritory.id)
                    .reduce((sum, t) => sum + t.area, 0);
                  await storage.updateUserTotalArea(otherTerritory.userId, newTotalArea);
                }
              } catch (err) {
                console.error('Error checking overlap:', err);
              }
            }

            let finalGeometry = buffered.geometry;
            for (const userTerritory of userTerritories) {
              try {
                const userPoly = turf.polygon(userTerritory.geometry.coordinates);
                const union = turf.union(
                  turf.featureCollection([turf.polygon(finalGeometry.coordinates as any), userPoly])
                );
                if (union) {
                  finalGeometry = union.geometry as any;
                  await storage.deleteTerritoryById(userTerritory.id);
                }
              } catch (err) {
                console.error('Error merging territories:', err);
              }
            }

            const territory = await storage.createTerritory({
              userId: routeData.userId,
              routeId: route.id,
              geometry: finalGeometry as any,
              area: turf.area(finalGeometry),
            });

            const updatedTerritories = await storage.getTerritoriesByUserId(routeData.userId);
            const totalArea = updatedTerritories.reduce((sum, t) => sum + t.area, 0);
            await storage.updateUserTotalArea(routeData.userId, totalArea);

            return c.json({ route, territory });
          } else {
            return c.json({ route });
          }
        } catch (error) {
          console.error('Error calculating territory:', error);
          return c.json({ route });
        }
      } else {
        return c.json({ route });
      }
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  });

  app.get('/api/routes/:userId', async (c) => {
    try {
      const db = createDb(c.env.DATABASE_URL);
      const storage = new WorkerStorage(db);
      const userId = c.req.param('userId');
      const routes = await storage.getRoutesByUserId(userId);
      return c.json(routes);
    } catch (error: any) {
      return c.json({ error: error.message }, 500);
    }
  });

  app.get('/api/territories', async (c) => {
    try {
      const db = createDb(c.env.DATABASE_URL);
      const storage = new WorkerStorage(db);
      const territories = await storage.getAllTerritories();
      return c.json(territories);
    } catch (error: any) {
      return c.json({ error: error.message }, 500);
    }
  });

  app.post('/api/friends', async (c) => {
    try {
      const db = createDb(c.env.DATABASE_URL);
      const storage = new WorkerStorage(db);
      const body = await c.req.json();
      const friendshipData = insertFriendshipSchema.parse(body);
      
      const exists = await storage.checkFriendship(
        friendshipData.userId,
        friendshipData.friendId
      );

      if (exists) {
        return c.json({ error: "Friendship already exists" }, 400);
      }

      const friendship = await storage.createFriendship(friendshipData);
      return c.json(friendship);
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  });

  app.get('/api/friends/:userId', async (c) => {
    try {
      const db = createDb(c.env.DATABASE_URL);
      const storage = new WorkerStorage(db);
      const userId = c.req.param('userId');
      const friends = await storage.getFriendsByUserId(userId);
      return c.json(friends);
    } catch (error: any) {
      return c.json({ error: error.message }, 500);
    }
  });
}
