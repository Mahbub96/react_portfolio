/**
 * Analytics Core Constants & Event Priorities
 * Complies with Sections 13, 22, 64, 94:
 * Priority 1: Business critical (Never dropped)
 * Priority 2: Behavioral interaction (Retained unless severe memory pressure)
 * Priority 3: Continuous movement & scrolling (Aggressively sampled/pruned under load)
 */

export const EVENT_PRIORITIES = {
  // Priority 1 — Critical (Never dropped)
  session_start: 1,
  session_end: 1,
  page_view: 1,
  page_exit: 1,
  route_change: 1,
  card_click: 1,
  button_click: 1,
  link_click: 1,
  click: 1,
  rage_click: 1,
  form_submit: 1,
  form_submit_success: 1,
  form_submit_error: 1,
  form_abandon: 1,
  form_error: 1,
  modal_open: 1,
  modal_close: 1,
  tab_change: 1,
  error: 1,

  // Priority 2 — Behavioral Interactions
  mouse_segment: 2,
  scroll_segment: 2,
  form_view: 2,
  form_focus: 2,
  form_blur: 2,
  hover: 2,
  long_hover: 2,
  scroll_milestone: 2,
  input_interaction: 2,
  section_view: 2,

  // Priority 3 — Continuous Telemetry
  mouse_movement: 3,
  rapid_scroll: 3,
  scroll: 3,
};

export const CRITICAL_EVENTS = new Set([
  "session_start",
  "session_end",
  "page_view",
  "page_exit",
  "route_change",
  "card_click",
  "button_click",
  "link_click",
  "click",
  "rage_click",
  "form_submit",
  "form_submit_success",
  "form_submit_error",
  "form_abandon",
  "modal_open",
  "modal_close",
  "error",
]);
