/**
 * Form Interaction & Character Dynamics Collector
 * Complies with Sections 17, 64, 71:
 * - Tracks keystroke counts, correction counts, hesitation (dwell), and blur
 * - STRICT PRIVACY: NEVER records or stores text values
 * - Tracks form submissions, submission successes, and validation errors
 */

import { getElementIdentifier, isSensitiveInput } from "./elementResolver";

export class FormCollector {
  constructor(trackFn, onCriticalActionFn) {
    this.track = trackFn;
    this.onCriticalAction = onCriticalActionFn;
    this.inputSessions = new Map();

    this.handleFocusIn = this.handleFocusIn.bind(this);
    this.handleFocusOut = this.handleFocusOut.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInvalid = this.handleInvalid.bind(this);
  }

  init() {
    if (typeof window === "undefined") return;
    document.addEventListener("focusin", this.handleFocusIn, { passive: true });
    document.addEventListener("focusout", this.handleFocusOut, { passive: true });
    document.addEventListener("input", this.handleInput, { passive: true });
    document.addEventListener("submit", this.handleSubmit, { capture: true, passive: true });
    document.addEventListener("invalid", this.handleInvalid, { capture: true, passive: true });
  }

  destroy() {
    if (typeof window === "undefined") return;
    document.removeEventListener("focusin", this.handleFocusIn);
    document.removeEventListener("focusout", this.handleFocusOut);
    document.removeEventListener("input", this.handleInput);
    document.removeEventListener("submit", this.handleSubmit, { capture: true });
    document.removeEventListener("invalid", this.handleInvalid, { capture: true });
    this.inputSessions.clear();
  }

  handleFocusIn(e) {
    const target = e.target;
    if (!target || !["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
    if (isSensitiveInput(target)) return;

    const fieldId = getElementIdentifier(target);
    this.inputSessions.set(target, {
      fieldId,
      startTime: Date.now(),
      charsTyped: 0,
      backspaces: 0,
    });

    this.track("form_focus", {}, fieldId);
  }

  handleFocusOut(e) {
    const target = e.target;
    if (!target || !this.inputSessions.has(target)) return;

    const session = this.inputSessions.get(target);
    this.inputSessions.delete(target);

    const dwellMs = Date.now() - session.startTime;
    if (dwellMs < 200 && session.charsTyped === 0) return;

    this.track(
      "input_interaction",
      {
        dwellMs,
        charsTyped: session.charsTyped,
        backspaces: session.backspaces,
      },
      session.fieldId
    );

    this.track("form_blur", { dwellMs }, session.fieldId);
  }

  handleInput(e) {
    const target = e.target;
    if (!target || !this.inputSessions.has(target)) return;

    const session = this.inputSessions.get(target);
    if (e.inputType === "deleteContentBackward" || e.inputType === "deleteContentForward") {
      session.backspaces++;
    } else {
      session.charsTyped++;
    }
  }

  handleSubmit(e) {
    if (this.onCriticalAction) this.onCriticalAction();

    const form = e.target;
    const formId = form.id || form.getAttribute("name") || "contact_form";

    this.track("form_submit", {}, formId);
  }

  handleInvalid(e) {
    const target = e.target;
    const fieldId = getElementIdentifier(target);
    const formId = target.form?.id || "form";

    this.track(
      "form_error",
      {
        formId,
        validationMessage: (target.validationMessage || "").substring(0, 100),
      },
      fieldId
    );
  }
}
