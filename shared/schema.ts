import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, real, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull().default(''), // Hashed password (empty for legacy users)
  color: text("color").notNull(), // Hex color for territory visualization
  avatar: text("avatar"), // Avatar URL or placeholder
  totalArea: real("total_area").notNull().default(0), // Total m² conquered
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const routes = pgTable("routes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  coordinates: jsonb("coordinates").notNull().$type<Array<[number, number]>>(), // Array of [lat, lng]
  distance: real("distance").notNull(), // meters
  duration: integer("duration").notNull(), // seconds
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at").notNull(),
});

export const territories = pgTable("territories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  routeId: varchar("route_id").notNull().references(() => routes.id, { onDelete: 'cascade' }),
  geometry: jsonb("geometry").notNull().$type<any>(), // GeoJSON polygon
  area: real("area").notNull(), // square meters
  conqueredAt: timestamp("conquered_at").notNull().defaultNow(),
});

export const friendships = pgTable("friendships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  friendId: varchar("friend_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  routes: many(routes),
  territories: many(territories),
  friendships: many(friendships),
}));

export const routesRelations = relations(routes, ({ one, many }) => ({
  user: one(users, {
    fields: [routes.userId],
    references: [users.id],
  }),
  territories: many(territories),
}));

export const territoriesRelations = relations(territories, ({ one }) => ({
  user: one(users, {
    fields: [territories.userId],
    references: [users.id],
  }),
  route: one(routes, {
    fields: [territories.routeId],
    references: [routes.id],
  }),
}));

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  user: one(users, {
    fields: [friendships.userId],
    references: [users.id],
  }),
  friend: one(users, {
    fields: [friendships.friendId],
    references: [users.id],
  }),
}));

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  totalArea: true,
  createdAt: true,
});

export const insertRouteSchema = createInsertSchema(routes).omit({
  id: true,
});

export const insertTerritorySchema = createInsertSchema(territories).omit({
  id: true,
  conqueredAt: true,
});

export const insertFriendshipSchema = createInsertSchema(friendships).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Route = typeof routes.$inferSelect;
export type InsertRoute = z.infer<typeof insertRouteSchema>;

export type Territory = typeof territories.$inferSelect;
export type InsertTerritory = z.infer<typeof insertTerritorySchema>;

export type Friendship = typeof friendships.$inferSelect;
export type InsertFriendship = z.infer<typeof insertFriendshipSchema>;

// Extended types for frontend
export type UserWithStats = User & {
  rank?: number;
  friendCount?: number;
};

export type TerritoryWithUser = Territory & {
  user: Pick<User, 'id' | 'username' | 'name' | 'color'>;
};

export type RouteWithTerritory = Route & {
  territory?: Territory;
};
