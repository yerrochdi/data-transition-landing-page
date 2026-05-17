/**
 * Shape of the 3 Career OS enrichment modules (stored as JSONB on
 * OnboardingResponse). All fields are user-editable from dedicated
 * mini-flows unlocked after the first bilan.
 */

export interface CareerInflection {
  /** Approximate year of the move ("2018", "Début 2021"). */
  year: string;
  /** What you were doing before. */
  from: string;
  /** What you moved to. */
  to: string;
  /** The trigger / why you moved. */
  why: string;
  /** What you learned from this move. */
  lesson: string;
}

export interface LongTermVision {
  /** Where you see yourself in 5 years (role, scope, life). */
  fiveYears: string;
  /** Where you see yourself in 10 years. */
  tenYears: string;
  /** What "ideal life" looks like for you (concrete description). */
  idealLife: string;
  /** Things you'd never accept (dealbreakers). */
  dealbreakers: string;
}

export interface CareerAnchors {
  /** Geographic constraints (cities, countries, remote-only, etc.). */
  geoAnchors: string;
  /** Sectors or company types you'd refuse to work in. */
  sectorExclusions: string;
  /** Triggers that have caused burnout / exits in the past. */
  burnoutTriggers: string;
}
