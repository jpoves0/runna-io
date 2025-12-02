import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertRouteSchema, insertFriendshipSchema } from "@shared/schema";
import * as turf from "@turf/turf";
import { seedDatabase } from "./seed";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ==================== SEED ====================
  
  // Seed database with demo data
  app.post("/api/seed", async (req, res) => {
    try {
      const defaultUser = await seedDatabase();
      res.json({ message: "Database seeded successfully", defaultUser });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get current user (returns first user for demo purposes)
  app.get("/api/current-user", async (req, res) => {
    try {
      const users = await storage.getAllUsersWithStats();
      if (users.length === 0) {
        return res.status(404).json({ error: "No users found. Please seed the database first." });
      }
      res.json(users[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ==================== USERS ====================
  
  // Create user
  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get user with stats
  app.get("/api/user/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get user rank
      const allUsers = await storage.getAllUsersWithStats();
      const userWithStats = allUsers.find(u => u.id === id);

      res.json(userWithStats || user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update user
  app.patch("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, color, avatar } = req.body;
      
      const updateData: Partial<{ name: string; color: string; avatar: string }> = {};
      if (name !== undefined) updateData.name = name;
      if (color !== undefined) updateData.color = color;
      if (avatar !== undefined) updateData.avatar = avatar;

      const updatedUser = await storage.updateUser(id, updateData);
      res.json(updatedUser);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const users = await storage.getAllUsersWithStats();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== ROUTES ====================
  
  // Create route and calculate territory
  app.post("/api/routes", async (req, res) => {
    try {
      const routeData = insertRouteSchema.parse(req.body);
      
      // Create route
      const route = await storage.createRoute(routeData);

      // Calculate territory from route coordinates
      if (routeData.coordinates.length >= 3) {
        try {
          // Create a buffer around the route to represent conquered territory
          const lineString = turf.lineString(
            routeData.coordinates.map(coord => [coord[1], coord[0]]) // [lng, lat] for GeoJSON
          );
          
          // Buffer of 50 meters around the route
          const buffered = turf.buffer(lineString, 0.05, { units: 'kilometers' });
          
          if (buffered) {
            const area = turf.area(buffered); // Area in square meters
            
            // Check for overlaps with existing territories
            const allTerritories = await storage.getAllTerritories();
            const userTerritories = allTerritories.filter(t => t.userId === routeData.userId);
            const otherTerritories = allTerritories.filter(t => t.userId !== routeData.userId);

            // Handle reconquest - remove overlapping territories from other users
            for (const otherTerritory of otherTerritories) {
              try {
                const otherPoly = turf.polygon(otherTerritory.geometry.coordinates);
                const intersection = turf.intersect(
                  turf.featureCollection([buffered, otherPoly])
                );

                if (intersection) {
                  // Remove the conquered territory
                  await storage.deleteTerritoryById(otherTerritory.id);
                  
                  // Update other user's total area
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

            // Merge with user's existing territories if they overlap
            let finalGeometry = buffered.geometry;
            for (const userTerritory of userTerritories) {
              try {
                const userPoly = turf.polygon(userTerritory.geometry.coordinates);
                const union = turf.union(
                  turf.featureCollection([turf.polygon(finalGeometry.coordinates), userPoly])
                );
                if (union) {
                  finalGeometry = union.geometry;
                  await storage.deleteTerritoryById(userTerritory.id);
                }
              } catch (err) {
                console.error('Error merging territories:', err);
              }
            }

            // Create new territory
            const territory = await storage.createTerritory({
              userId: routeData.userId,
              routeId: route.id,
              geometry: finalGeometry,
              area: turf.area(finalGeometry),
            });

            // Update user's total area
            const updatedTerritories = await storage.getTerritoriesByUserId(routeData.userId);
            const totalArea = updatedTerritories.reduce((sum, t) => sum + t.area, 0);
            await storage.updateUserTotalArea(routeData.userId, totalArea);

            res.json({ route, territory });
          } else {
            res.json({ route });
          }
        } catch (error) {
          console.error('Error calculating territory:', error);
          res.json({ route });
        }
      } else {
        res.json({ route });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get routes by user
  app.get("/api/routes/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const routes = await storage.getRoutesByUserId(userId);
      res.json(routes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== TERRITORIES ====================
  
  // Get all territories
  app.get("/api/territories", async (req, res) => {
    try {
      const territories = await storage.getAllTerritories();
      res.json(territories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== FRIENDSHIPS ====================
  
  // Create friendship
  app.post("/api/friends", async (req, res) => {
    try {
      const friendshipData = insertFriendshipSchema.parse(req.body);
      
      // Check if friendship already exists
      const exists = await storage.checkFriendship(
        friendshipData.userId,
        friendshipData.friendId
      );

      if (exists) {
        return res.status(400).json({ error: "Friendship already exists" });
      }

      const friendship = await storage.createFriendship(friendshipData);
      res.json(friendship);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get friends by user
  app.get("/api/friends/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const friends = await storage.getFriendsByUserId(userId);
      res.json(friends);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
