import { test } from "node:test";
import assert from "node:assert/strict";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();
import {
  normalizeCollectionName,
  getCollection,
  createItem,
  updateItem,
  toggleVisibility,
  reorderCollection,
  deleteItem,
} from "./portfolioService.js";

test("normalizeCollectionName handles case and singular variations", () => {
  assert.equal(normalizeCollectionName("projects"), "Projects");
  assert.equal(normalizeCollectionName("Project"), "Projects");
  assert.equal(normalizeCollectionName("experience"), "Experiences");
  assert.equal(normalizeCollectionName("education"), "Educations");
  assert.equal(normalizeCollectionName("skills"), "Skills");
  assert.equal(normalizeCollectionName("certifications"), "Certifications");
});

test("portfolioService CRUD lifecycle on Projects in MongoDB", async () => {
  // 1. Create a test project
  const testProject = {
    name: "Automated Test Project",
    desc: "A temporary project created during automated testing.",
    lang: ["Node.js", "MongoDB"],
    githubUrl: "https://github.com/Mahbub96/test",
  };

  const createResult = await createItem("Projects", testProject, "test-runner");
  const createdId = createResult.item.id;
  assert.ok(createdId);
  assert.equal(createResult.item.name, "Automated Test Project");
  assert.equal(createResult.item.published, true);

  // 2. Fetch collection with and without hidden items
  const itemsAll = await getCollection("Projects", { includeHidden: true });
  assert.ok(itemsAll.some((item) => String(item.id) === createdId));

  // 3. Update the project
  const updateResult = await updateItem(
    "Projects",
    createdId,
    { desc: "Updated description for test verification." },
    "test-runner"
  );
  assert.equal(updateResult.item.desc, "Updated description for test verification.");

  // 4. Toggle visibility to false
  await toggleVisibility("Projects", createdId, false, "test-runner");
  const itemsPublic = await getCollection("Projects", { includeHidden: false });
  assert.equal(
    itemsPublic.some((item) => String(item.id) === createdId),
    false,
    "Hidden item must not appear in public collection query"
  );

  // 5. Reorder collection
  const reorderIds = itemsAll.map((i) => String(i.id)).reverse();
  const reorderResult = await reorderCollection("Projects", reorderIds, "test-runner");
  assert.equal(reorderResult.items[0].id, reorderIds[0]);

  // 6. Delete test project
  const deleteResult = await deleteItem("Projects", createdId, "test-runner");
  assert.equal(deleteResult.success, true);

  const finalItems = await getCollection("Projects", { includeHidden: true });
  assert.equal(
    finalItems.some((item) => String(item.id) === createdId),
    false,
    "Deleted item must be removed from MongoDB"
  );

  const mongoose = (await import("mongoose")).default;
  await mongoose.disconnect();
});
