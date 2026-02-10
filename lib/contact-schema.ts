import { z } from "zod";

/**
 * Contact form validation schema
 */
export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  email: z
    .string()
    .email("Format d'email invalide")
    .max(255, "L'email ne peut pas dépasser 255 caractères"),
  profile: z
    .string()
    .max(500, "Le profil ne peut pas dépasser 500 caractères")
    .optional()
    .default(""),
  goal: z
    .string()
    .max(2000, "L'objectif ne peut pas dépasser 2000 caractères")
    .optional()
    .default(""),
  offer: z
    .string()
    .max(100, "L'offre ne peut pas dépasser 100 caractères")
    .optional(),
  // Honeypot field - should always be empty
  website: z
    .string()
    .max(0, "")
    .optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;

/**
 * Validate contact form data
 * @returns Object with success boolean and either data or error
 */
export function validateContactForm(data: unknown):
  | { success: true; data: ContactFormData }
  | { success: false; error: string } {
  try {
    const parsed = contactSchema.parse(data);

    // Check honeypot
    if (parsed.website && parsed.website.length > 0) {
      // Silently reject spam but return success to not reveal honeypot
      return { success: true, data: parsed };
    }

    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { success: false, error: firstError.message };
    }
    return { success: false, error: "Données invalides" };
  }
}

/**
 * Check if submission is likely spam (honeypot filled)
 */
export function isSpam(data: ContactFormData): boolean {
  return Boolean(data.website && data.website.length > 0);
}
