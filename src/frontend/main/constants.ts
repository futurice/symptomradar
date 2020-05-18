export enum SYMPTOMS {
  corona_suspicion = 'corona_suspicion',
  fever = 'fever',
  cough = 'cough',
  breathing_difficulties = 'breathing_difficulties',
  muscle_pain = 'muscle_pain',
  headache = 'headache',
  sore_throat = 'sore_throat',
  rhinitis = 'rhinitis',
  stomach_issues = 'stomach_issues',
  sensory_issues = 'sensory_issues',
}

export const FILTERS = {
  corona_suspicion_yes: { id: 'corona_suspicion_yes', label: 'corona_suspicion' },
  cough_yes: { id: 'cough_yes', label: 'cough' },
  fever_yes: { id: 'fever_yes', label: 'fever' },
  breathing_difficulties_yes: { id: 'breathing_difficulties_yes', label: 'breathing_difficulties' },
  muscle_pain_yes: { id: 'muscle_pain_yes', label: 'muscle_pain' },
  headache_yes: { id: 'headache_yes', label: 'headache' },
  sore_throat_yes: { id: 'sore_throat_yes', label: 'sore_throat' },
  rhinitis_yes: { id: 'rhinitis_yes', label: 'rhinitis' },
  stomach_issues_yes: { id: 'stomach_issues_yes', label: 'stomach_issues' },
  sensory_issues_yes: { id: 'sensory_issues_yes', label: 'sensory_issues' },
} as Record<string, { id: string; label: SYMPTOMS }>;

export type FilterKey = keyof typeof FILTERS;

export const symptomLabels = {
  suspicion: 'corona_infection_suspicion',
  cough: 'cough',
  fever: 'fever',
  breathingDifficulties: 'breathing_difficulties',
  musclePain: 'muscle_pain',
  headache: 'headache',
  soreThroat: 'sore_throat',
  rhinitis: 'rhinitis',
  stomachIssues: 'stomach_issues',
  sensoryIssues: 'loss_smell_or_taste',
};

export const theme = {
  grey: '#757575',
  lightGrey: '#ECECEC',
  white: '#FFFFFF',
  black: '#000000',
  blue: '#0047FF',
  green: '#328709',
  headerHeight: 90,
  navHeight: 40,
  citySelectHeight: 58,
  mobileWidth: 624,
};
