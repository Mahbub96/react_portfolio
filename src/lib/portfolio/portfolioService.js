import { randomUUID } from "node:crypto";
import connectDB from "../mongodb.js";
import PortfolioData from "../../models/PortfolioData.js";
import { getPortfolioFallback } from "../portfolioFallback.js";
import {
  getSchemaForCollection,
  isSingletonCollection,
  PORTFOLIO_COLLECTION_SCHEMAS,
  SINGLETON_SCHEMAS,
} from "./schemas.js";

export class PortfolioError extends Error {
  constructor(message, status = 400, details = null) {
    super(message);
    this.name = "PortfolioError";
    this.status = status;
    this.details = details;
  }
}

/**
 * Normalizes collection names to handle pluralization and casing quirks.
 */
export function normalizeCollectionName(name = "") {
  const map = {
    experience: "Experiences",
    experiences: "Experiences",
    education: "Educations",
    educations: "Educations",
    skill: "Skills",
    skills: "Skills",
    project: "Projects",
    projects: "Projects",
    corestrengths: "CoreStrengths",
    corestrength: "CoreStrengths",
    certification: "Certifications",
    certifications: "Certifications",
    achievement: "Achievements",
    achievements: "Achievements",
    profile: "profile",
    banner: "Banner",
    contact: "Contact",
  };
  const key = String(name).trim().toLowerCase();
  return map[key] || name;
}

/**
 * Normalize an item so it always has a string ID, published flag, and order index.
 */
function normalizeItem(item, index = 0) {
  if (!item || typeof item !== "object") return item;
  return {
    ...item,
    id: item.id !== undefined && item.id !== null ? String(item.id) : `item_${index}`,
    published: item.published !== undefined ? Boolean(item.published) : true,
    order: typeof item.order === "number" ? item.order : index,
  };
}

/**
 * Fetch a portfolio collection.
 * If includeHidden is false, items with published === false are omitted.
 */
export async function getCollection(rawName, { includeHidden = false } = {}) {
  const collectionName = normalizeCollectionName(rawName);
  await connectDB();

  const doc = await PortfolioData.findOne({ collectionName }).lean();
  let rawData = doc?.data;

  // Fallback if not found in MongoDB
  if (!rawData) {
    const fallback = getPortfolioFallback();
    rawData = fallback[collectionName]?.data;
  }

  // Handle singletons
  if (isSingletonCollection(collectionName)) {
    return rawData || {};
  }

  // Array collections: normalize, filter, and sort
  let items = Array.isArray(rawData) ? rawData.map(normalizeItem) : [];

  if (!includeHidden) {
    items = items.filter((item) => item.published !== false);
  }

  // Sort by order ascending, then by createdAt/name as tie-breaker
  items.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return String(a.name || a.title || a.id).localeCompare(String(b.name || b.title || b.id));
  });

  return items;
}

/**
 * Fetch a single item from a collection by its ID.
 */
export async function getItem(rawName, itemId) {
  const items = await getCollection(rawName, { includeHidden: true });
  if (!Array.isArray(items)) return null;
  const targetId = String(itemId);
  return items.find((item) => String(item.id) === targetId) || null;
}

/**
 * Create a new item in an array collection.
 */
export async function createItem(rawName, rawPayload, username = "admin") {
  const collectionName = normalizeCollectionName(rawName);
  if (isSingletonCollection(collectionName)) {
    throw new PortfolioError(`Collection ${collectionName} is a singleton, use updateSingleton instead`, 400);
  }

  const schema = getSchemaForCollection(collectionName);
  if (!schema) {
    throw new PortfolioError(`Unsupported collection name: ${collectionName}`, 400);
  }

  await connectDB();
  const doc = await PortfolioData.findOne({ collectionName });
  const existingItems = Array.isArray(doc?.data) ? doc.data.map(normalizeItem) : [];

  // Generate ID if not provided
  const id = rawPayload.id ? String(rawPayload.id) : `${collectionName.toLowerCase()}_${Date.now()}_${randomUUID().slice(0, 8)}`;
  const nextOrder = existingItems.length > 0 ? Math.max(...existingItems.map((i) => i.order || 0)) + 1 : 0;

  const candidate = {
    ...rawPayload,
    id,
    order: typeof rawPayload.order === "number" ? rawPayload.order : nextOrder,
    published: rawPayload.published !== undefined ? Boolean(rawPayload.published) : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastModifiedBy: username,
  };

  const validatedItem = schema.parse(candidate);

  // Prevent duplicate names in Skills or Projects if applicable
  if (collectionName === "Skills") {
    const isDuplicate = existingItems.some(
      (s) => s.name?.toLowerCase() === validatedItem.name.toLowerCase()
    );
    if (isDuplicate) {
      throw new PortfolioError(`Skill "${validatedItem.name}" already exists`, 400);
    }
  }

  const updatedDoc = await PortfolioData.findOneAndUpdate(
    { collectionName },
    {
      $push: { data: validatedItem },
      lastUpdate: new Date(),
      lastModifiedBy: username,
    },
    { upsert: true, new: true }
  );

  return { item: validatedItem, collection: updatedDoc.collectionName };
}

/**
 * Update an existing item in an array collection.
 */
export async function updateItem(rawName, itemId, rawPayload, username = "admin") {
  const collectionName = normalizeCollectionName(rawName);
  const schema = getSchemaForCollection(collectionName);
  if (!schema) {
    throw new PortfolioError(`Unsupported collection name: ${collectionName}`, 400);
  }

  await connectDB();
  const doc = await PortfolioData.findOne({ collectionName });
  if (!doc || !Array.isArray(doc.data)) {
    throw new PortfolioError(`Collection ${collectionName} not found`, 404);
  }

  const targetId = String(itemId);
  const existingIndex = doc.data.findIndex((item) => String(item.id) === targetId);
  if (existingIndex === -1) {
    throw new PortfolioError(`Item with ID ${itemId} not found in ${collectionName}`, 404);
  }

  const existingItem = normalizeItem(doc.data[existingIndex], existingIndex);
  const candidate = {
    ...existingItem,
    ...rawPayload,
    id: existingItem.id, // prevent changing ID
    createdAt: existingItem.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastModifiedBy: username,
  };

  const validatedItem = schema.parse(candidate);

  doc.data[existingIndex] = validatedItem;
  doc.lastUpdate = new Date();
  doc.markModified("data");
  await doc.save();

  return { item: validatedItem };
}

/**
 * Toggle visibility of an item.
 */
export async function toggleVisibility(rawName, itemId, published, username = "admin") {
  return updateItem(rawName, itemId, { published: Boolean(published) }, username);
}

/**
 * Reorder items in a collection based on an ordered array of IDs.
 */
export async function reorderCollection(rawName, orderedIds, username = "admin") {
  const collectionName = normalizeCollectionName(rawName);
  if (!Array.isArray(orderedIds)) {
    throw new PortfolioError("orderedIds must be an array of IDs", 400);
  }

  await connectDB();
  const doc = await PortfolioData.findOne({ collectionName });
  if (!doc || !Array.isArray(doc.data)) {
    throw new PortfolioError(`Collection ${collectionName} not found`, 404);
  }

  const idToOrder = new Map(orderedIds.map((id, index) => [String(id), index]));

  doc.data = doc.data.map((item, index) => {
    const sId = String(item.id);
    const order = idToOrder.has(sId) ? idToOrder.get(sId) : index + orderedIds.length;
    return {
      ...item,
      order,
      updatedAt: new Date().toISOString(),
      lastModifiedBy: username,
    };
  });

  doc.data.sort((a, b) => a.order - b.order);
  doc.lastUpdate = new Date();
  doc.markModified("data");
  await doc.save();

  return { items: doc.data.map(normalizeItem) };
}

/**
 * Delete an item from an array collection.
 */
export async function deleteItem(rawName, itemId, username = "admin") {
  const collectionName = normalizeCollectionName(rawName);
  await connectDB();

  const targetId = String(itemId);
  const doc = await PortfolioData.findOne({ collectionName });
  if (!doc || !Array.isArray(doc.data)) {
    throw new PortfolioError(`Collection ${collectionName} not found`, 404);
  }

  const initialCount = doc.data.length;
  doc.data = doc.data.filter((item) => String(item.id) !== targetId);

  if (doc.data.length === initialCount) {
    throw new PortfolioError(`Item with ID ${itemId} not found in ${collectionName}`, 404);
  }

  doc.lastUpdate = new Date();
  doc.markModified("data");
  await doc.save();

  return { success: true, deletedId: targetId };
}

/**
 * Update a singleton section (profile, Banner, Contact).
 */
export async function updateSingleton(rawName, rawPayload, username = "admin") {
  const collectionName = normalizeCollectionName(rawName);
  const schema = getSchemaForCollection(collectionName);
  if (!schema || !isSingletonCollection(collectionName)) {
    throw new PortfolioError(`Collection ${collectionName} is not a valid singleton`, 400);
  }

  const validatedData = schema.parse(rawPayload);

  await connectDB();
  const result = await PortfolioData.findOneAndUpdate(
    { collectionName },
    {
      data: validatedData,
      lastUpdate: new Date(),
      lastModifiedBy: username,
    },
    { upsert: true, new: true }
  );

  return { collectionName, data: result.data };
}
