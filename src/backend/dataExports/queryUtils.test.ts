import { mapResponseFieldsToQuery } from './queryUtils';

describe('mapResponseFieldsToQuery', () => {
  it('maps fields to IF statements', () => {
    const fields = mapResponseFieldsToQuery((field, value) => `IF(${field} = '${value}', 1, 0) AS ${field}_${value}`);
    expect(fields).toEqual(
      `IF(fever = 'no', 1, 0) AS fever_no,
    IF(fever = 'slight', 1, 0) AS fever_slight,
    IF(fever = 'high', 1, 0) AS fever_high,
    IF(cough = 'no', 1, 0) AS cough_no,
    IF(cough = 'mild', 1, 0) AS cough_mild,
    IF(cough = 'intense', 1, 0) AS cough_intense,
    IF(breathing_difficulties = 'yes', 1, 0) AS breathing_difficulties_yes,
    IF(breathing_difficulties = 'no', 1, 0) AS breathing_difficulties_no,
    IF(muscle_pain = 'yes', 1, 0) AS muscle_pain_yes,
    IF(muscle_pain = 'no', 1, 0) AS muscle_pain_no,
    IF(headache = 'yes', 1, 0) AS headache_yes,
    IF(headache = 'no', 1, 0) AS headache_no,
    IF(sore_throat = 'yes', 1, 0) AS sore_throat_yes,
    IF(sore_throat = 'no', 1, 0) AS sore_throat_no,
    IF(rhinitis = 'yes', 1, 0) AS rhinitis_yes,
    IF(rhinitis = 'no', 1, 0) AS rhinitis_no,
    IF(stomach_issues = 'yes', 1, 0) AS stomach_issues_yes,
    IF(stomach_issues = 'no', 1, 0) AS stomach_issues_no,
    IF(sensory_issues = 'yes', 1, 0) AS sensory_issues_yes,
    IF(sensory_issues = 'no', 1, 0) AS sensory_issues_no,
    IF(healthcare_contact = 'yes', 1, 0) AS healthcare_contact_yes,
    IF(healthcare_contact = 'no', 1, 0) AS healthcare_contact_no,
    IF(general_wellbeing = 'fine', 1, 0) AS general_wellbeing_fine,
    IF(general_wellbeing = 'impaired', 1, 0) AS general_wellbeing_impaired,
    IF(general_wellbeing = 'bad', 1, 0) AS general_wellbeing_bad,
    IF(longterm_medication = 'yes', 1, 0) AS longterm_medication_yes,
    IF(longterm_medication = 'no', 1, 0) AS longterm_medication_no,
    IF(smoking = 'yes', 1, 0) AS smoking_yes,
    IF(smoking = 'no', 1, 0) AS smoking_no,
    IF(corona_suspicion = 'yes', 1, 0) AS corona_suspicion_yes,
    IF(corona_suspicion = 'no', 1, 0) AS corona_suspicion_no,
    IF(gender = 'female', 1, 0) AS gender_female,
    IF(gender = 'male', 1, 0) AS gender_male,
    IF(gender = 'other', 1, 0) AS gender_other`.replace(/^\s+/gm, ''),
    );
  });
});
