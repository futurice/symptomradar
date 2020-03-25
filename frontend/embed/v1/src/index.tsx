import 'iframe-resizer/js/iframeResizer.contentWindow'; // because we ONLY need the part for the page being embedded, let's not import the whole library, to shave off some bytes from our bundle
import './index.css';
import $ from 'jquery';
import { v4 as uuidV4 } from 'uuid';

function storageAvailable() {
  try {
    const storage = window.localStorage;
    const test = 'storageTest';
    storage.setItem(test, test);
    storage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

function localStorageIdKey() {
  return 'submitId';
}

function localStorageTimestampKey() {
  return 'lastSubmitAt';
}

function getParticipantId() {
  if (storageAvailable()) {
    const participantId = window.localStorage.getItem(localStorageIdKey());
    const previousTimestamp = window.localStorage.getItem(localStorageTimestampKey());

    // if id already exists and timestamp is less than 14 days old, use the same id
    // otherwise generate new id
    // always generate new timestamp
    const isValid =
      !!participantId && !!previousTimestamp && Date.now() - parseInt(previousTimestamp, 10) < 14 * 24 * 60 * 60 * 1000;

    return isValid && participantId ? participantId : uuidV4();
  }
  return uuidV4();
}

function storeParticipantId(participantId: string) {
  if (storageAvailable()) {
    window.localStorage.clear();
    window.localStorage.setItem(localStorageIdKey(), participantId);
    window.localStorage.setItem(localStorageTimestampKey(), Date.now().toString(10));
  }
}

function showForm() {
  $('#symptom-questionnaire').removeClass('hidden');
}

function submitSuccessfully() {
  $('#submit-success').removeClass('hidden');
  $('#symptom-questionnaire, #start-survey').addClass('hidden');
  $('#form-info').addClass('hidden');
}

function submitFailed() {
  $('#submit-error').removeClass('hidden');
}

function init() {
  $('#start-survey').click(function() {
    showForm();
  });

  const endpoint = process.env.REACT_APP_API_ENDPOINT;
  if (!endpoint) {
    console.error('Endpoint url missing');
    return;
  }

  $('#symptom-questionnaire').submit(function(event) {
    event.preventDefault();

    // serialize form data into { name: input.name, value: input.value } format
    // unanswered fields are not included
    const answers = $(this)
      .serializeArray()
      .map(x => (x.value === '' ? { ...x, value: null } : x)) // convert empty strings (i.e. skipped questions) to nulls
      .reduce((memo, next) => ({ ...memo, [next.name]: next.value }), {});
    const meta = { participant_uuid: getParticipantId(), timestamp: new Date().toISOString() };
    const submission = { ...meta, ...answers };

    // persist participant_uuid – it will be reused if participant answers again
    storeParticipantId(submission.participant_uuid);

    $.ajax({
      url: endpoint,
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(submission),
    })
      .done(submitSuccessfully)
      .fail(submitFailed);
  });
}

$(document).ready(init);
