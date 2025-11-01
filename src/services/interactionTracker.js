/**
 * Interaction Tracker Service
 * Enhanced tracking structure for comprehensive user interaction analytics
 */

/**
 * Create an interaction event with complete metadata
 */
export function createInteractionEvent(
  type,
  target,
  position,
  additionalData = {}
) {
  const event = {
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type, // 'click', 'hover', 'focus', 'scroll', 'keypress', etc.
    timestamp: new Date(),
    position: {
      x: position.x || 0,
      y: position.y || 0,
    },
    target: {
      tagName: target?.tagName || "unknown",
      id: target?.id || null,
      className:
        typeof target?.className === "string"
          ? target.className
              .split(" ")
              .filter((c) => c && !c.includes("module"))
          : [],
      text: target?.textContent?.trim().substring(0, 100) || null,
      href: target?.href || target?.getAttribute?.("href") || null,
      role: target?.getAttribute?.("role") || null,
      ariaLabel: target?.getAttribute?.("aria-label") || null,
      dataComponent: target?.getAttribute?.("data-component") || null,
      dataTestid: target?.getAttribute?.("data-testid") || null,
    },
    page: typeof window !== "undefined" ? window.location.pathname : null,
    scrollDepth: typeof window !== "undefined" ? calculateScrollDepth() : 0,
    viewport:
      typeof window !== "undefined"
        ? {
            width: window.innerWidth,
            height: window.innerHeight,
          }
        : null,
    ...additionalData,
  };

  return event;
}

/**
 * Calculate current scroll depth percentage
 */
export function calculateScrollDepth() {
  if (typeof window === "undefined") return 0;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight =
    document.documentElement.scrollHeight - window.innerHeight;
  return scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
}

/**
 * Get component identifier from target element
 */
export function getComponentIdentifier(target) {
  if (!target) return "unknown";

  // Priority order for component identification
  const identifiers = [
    target.getAttribute?.("data-component"),
    target.getAttribute?.("data-testid"),
    target.id,
    target.getAttribute?.("aria-label"),
    target.getAttribute?.("role"),
  ].filter(Boolean);

  if (identifiers.length > 0) {
    return identifiers[0];
  }

  // Try to extract meaningful class name
  if (target.className) {
    const classes =
      typeof target.className === "string"
        ? target.className
            .split(" ")
            .filter((c) => c && !c.includes("module") && c.length > 2)
        : [];
    if (classes.length > 0) {
      return classes[0];
    }
  }

  // Check parent elements (up to 3 levels)
  let parent = target.parentElement;
  let depth = 0;
  while (parent && depth < 3) {
    const parentId = parent.id || parent.getAttribute?.("data-component");
    if (parentId) {
      return parentId;
    }
    parent = parent.parentElement;
    depth++;
  }

  // Fallback to tag name with context
  const type = target.getAttribute?.("type");
  const href = target.getAttribute?.("href");
  const text = target.textContent?.trim().substring(0, 30);

  if (type) return `${target.tagName.toLowerCase()}[type=${type}]`;
  if (href) return `link[${href.substring(0, 20)}]`;
  if (text) return `${target.tagName.toLowerCase()}[${text}]`;
  return target.tagName.toLowerCase();
}

/**
 * Create interaction timeline entry
 */
export function createTimelineEntry(eventType, data) {
  return {
    eventType,
    timestamp: new Date(),
    ...data,
  };
}

/**
 * Aggregate interactions by component for efficient storage
 */
export function aggregateInteractions(interactions) {
  const aggregated = {};

  interactions.forEach((interaction) => {
    const componentId =
      interaction.target?.dataComponent ||
      interaction.target?.id ||
      interaction.target?.className?.[0] ||
      interaction.target?.tagName ||
      "unknown";

    if (!aggregated[componentId]) {
      aggregated[componentId] = {
        component: componentId,
        interactions: [],
        count: 0,
        firstInteraction: interaction.timestamp,
        lastInteraction: interaction.timestamp,
        types: {},
        positions: [],
      };
    }

    aggregated[componentId].count++;
    aggregated[componentId].interactions.push({
      type: interaction.type,
      timestamp: interaction.timestamp,
      position: interaction.position,
    });

    if (!aggregated[componentId].types[interaction.type]) {
      aggregated[componentId].types[interaction.type] = 0;
    }
    aggregated[componentId].types[interaction.type]++;

    // Track positions (sample)
    if (interaction.position && aggregated[componentId].positions.length < 50) {
      aggregated[componentId].positions.push({
        x: interaction.position.x,
        y: interaction.position.y,
        timestamp: interaction.timestamp,
      });
    }

    if (interaction.timestamp > aggregated[componentId].lastInteraction) {
      aggregated[componentId].lastInteraction = interaction.timestamp;
    }
    if (interaction.timestamp < aggregated[componentId].firstInteraction) {
      aggregated[componentId].firstInteraction = interaction.timestamp;
    }
  });

  return Object.values(aggregated);
}
