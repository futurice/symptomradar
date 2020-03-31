process.env.BUCKET_NAME_STORAGE = 'non-existing-bucket-for-test-suite'; // for the test runner, let's use a non-existent bucket name, just in case we hit a code path that tries to upload something for real
process.env.SECRET_HASHING_PEPPER = 'D4GxgVVh0XQCrVb7FiyCal5ZgnRVkiVf'; // despite the name, this isn't actually secret; see https://github.com/futurice/symptomradar/issues/157
