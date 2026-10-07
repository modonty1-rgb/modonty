import { clientFormSections } from "./client-form-config";
import type { ClientFormData } from "@/lib/types";

/**
 * Maps field names to their tab/group IDs
 * Used to organize updates by form tabs for better performance and security
 */
function getFieldToGroupMap(): Record<string, string> {
  const fieldToGroupMap: Record<string, string> = {};
  
  clientFormSections.forEach((section) => {
    section.fields.forEach((field) => {
      fieldToGroupMap[field] = section.id;
    });
  });
  
  return fieldToGroupMap;
}

/**
 * Groups form data by tab/group
 * Returns an object with group IDs as keys and partial form data as values
 */
export function groupFieldsByTab(data: ClientFormData): Record<string, Partial<ClientFormData>> {
  const fieldToGroupMap = getFieldToGroupMap();
  const grouped: Record<string, Partial<ClientFormData>> = {};
  
  // Initialize all groups
  clientFormSections.forEach((section) => {
    grouped[section.id] = {};
  });
  
  // Group fields by their assigned tab
  Object.entries(data).forEach(([field, value]) => {
    const groupId = fieldToGroupMap[field];
    if (groupId && grouped[groupId]) {
      (grouped[groupId] as Record<string, unknown>)[field] = value;
    }
  });
  
  return grouped;
}

/**
 * Gets fields for a specific group
 */
export function getFieldsForGroup(groupId: string): string[] {
  const section = clientFormSections.find((s) => s.id === groupId);
  return section?.fields || [];
}
