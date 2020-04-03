// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';

// Ensure a test-friendly mock environment
process.env.BUCKET_NAME_STORAGE = 'non-existing-bucket-for-test-suite';
process.env.SECRET_HASHING_PEPPER = 'D4GxgVVh0XQCrVb7FiyCal5ZgnRVkiVf'; // despite the name, this isn't actually secret; see https://github.com/futurice/symptomradar/issues/157
