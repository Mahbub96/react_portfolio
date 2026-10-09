"use client";

import { useMemo, useState } from "react";
import { LuLayoutGrid, LuList, LuSearch, LuX } from "react-icons/lu";
import PostCard from "./PostCard";
import styles from "@/app/blog/blog.module.css";

export default function BlogFeed({ posts = [] }) {
  const [selectedTag, setSelectedTag] = useState("all");
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState("list"); // "list" (70/30) | "grid"

  // Gather unique tags with count
  const { allTags, tagCounts } = useMemo(() => {
    const counts = {};
    for (const post of posts) {
      for (const tag of post.tags || []) {
        counts[tag] = (counts[tag] || 0) + 1;
      }
    }
    const tags = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    return { allTags: tags, tagCounts: counts };
  }, [posts]);

  // Filter posts
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchTag = selectedTag === "all" || post.tags?.includes(selectedTag);
      const matchQuery =
        !q ||
        post.title?.toLowerCase().includes(q) ||
        post.excerpt?.toLowerCase().includes(q) ||
        post.tags?.some((t) => t.toLowerCase().includes(q));
      return matchTag && matchQuery;
    });
  }, [posts, selectedTag, query]);

  const [featured, ...rest] = filtered;

  return (
    <div className={styles.feedWrapper}>
      {/* Feed Filter & Search Toolbar */}
      <div className={styles.feedToolbar}>
        <div className={styles.tagsScroll} role="tablist" aria-label="Filter topics">
          <button
            type="button"
            role="tab"
            aria-selected={selectedTag === "all"}
            className={`${styles.filterChip} ${selectedTag === "all" ? styles.filterChipActive : ""}`}
            onClick={() => setSelectedTag("all")}
          >
            All <span>{posts.length}</span>
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              role="tab"
              aria-selected={selectedTag === tag}
              className={`${styles.filterChip} ${selectedTag === tag ? styles.filterChipActive : ""}`}
              onClick={() => setSelectedTag(tag)}
            >
              {tag} <span>{tagCounts[tag]}</span>
            </button>
          ))}
        </div>

        <div className={styles.toolbarRight}>
          <div className={styles.searchBox}>
            <LuSearch aria-hidden="true" />
            <input
              type="search"
              placeholder="Search articles…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search articles"
            />
            {query ? (
              <button
                type="button"
                className={styles.clearSearch}
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                <LuX aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <div className={styles.viewToggle} role="group" aria-label="Layout view">
            <button
              type="button"
              className={`${styles.viewBtn} ${viewMode === "list" ? styles.viewBtnActive : ""}`}
              onClick={() => setViewMode("list")}
              title="Compact list view (70% text / 30% image)"
              aria-label="List view"
            >
              <LuList aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`${styles.viewBtn} ${viewMode === "grid" ? styles.viewBtnActive : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid cards view"
              aria-label="Grid view"
            >
              <LuLayoutGrid aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Posts Content */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon} aria-hidden="true">
            {"{ }"}
          </span>
          <h2>No articles found</h2>
          <p>
            No notes match your search or filter. Try another keyword or clear filters.
          </p>
          <button
            type="button"
            className={`${styles.resetBtn}`}
            onClick={() => {
              setSelectedTag("all");
              setQuery("");
            }}
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className={viewMode === "grid" ? styles.grid : styles.feedList}>
          {/* If on 'all' and no search, feature the latest article */}
          {selectedTag === "all" && !query && featured ? (
            <PostCard post={featured} featured eager variant={viewMode} />
          ) : null}

          {(selectedTag === "all" && !query ? rest : filtered).map((post) => (
            <PostCard key={post.slug} post={post} variant={viewMode} />
          ))}
        </div>
      )}
    </div>
  );
}
