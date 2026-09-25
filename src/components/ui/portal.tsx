import { createPortal } from "react-dom";
import type React from "react";

/**
 * Renders overlays at the document root. Tabs animate with transforms, which
 * trap `position: fixed` children below the bottom navigation.
 */
export const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  typeof document === "undefined" ? null : createPortal(children, document.body);
