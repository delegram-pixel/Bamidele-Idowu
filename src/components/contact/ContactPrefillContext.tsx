"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { ContactProjectType } from "@/types";

/**
 * Contact-form pre-selection.
 *
 * Selecting a service should carry the visitor's intent into the contact form
 * rather than making them pick the same thing twice (app-flow section 4:
 * "preselect the relevant project type").
 *
 * A context is used instead of a URL query parameter because the contact form
 * lives on the same page as the services — there is no navigation to encode
 * state into, and rewriting the URL solely to move a value between two
 * components on one page would be worse for link sharing, not better.
 *
 * Pre-selection is a convenience only: the visitor can always change the value,
 * and nothing is submitted without them seeing it.
 */
interface ContactPrefillValue {
  projectType: ContactProjectType | undefined;
  /** Set the pre-selected project type. Called by service and pricing CTAs. */
  requestProjectType: (projectType: ContactProjectType) => void;
  /** Clear the pre-selection once the visitor has edited the field themselves. */
  clearProjectType: () => void;
}

const ContactPrefillContext = createContext<ContactPrefillValue | undefined>(undefined);

export function ContactPrefillProvider({ children }: { children: ReactNode }) {
  const [projectType, setProjectType] = useState<ContactProjectType | undefined>(undefined);

  const requestProjectType = useCallback((next: ContactProjectType) => {
    setProjectType(next);
  }, []);

  const clearProjectType = useCallback(() => {
    setProjectType(undefined);
  }, []);

  const value = useMemo(
    () => ({ projectType, requestProjectType, clearProjectType }),
    [projectType, requestProjectType, clearProjectType],
  );

  return (
    <ContactPrefillContext.Provider value={value}>
      {children}
    </ContactPrefillContext.Provider>
  );
}

/**
 * Read the pre-selection state. Falls back to an inert implementation when used
 * outside the provider, so a component can be rendered in isolation — in a test,
 * for example — without crashing.
 */
export function useContactPrefill(): ContactPrefillValue {
  const context = useContext(ContactPrefillContext);

  return (
    context ?? {
      projectType: undefined,
      requestProjectType: () => {},
      clearProjectType: () => {},
    }
  );
}
