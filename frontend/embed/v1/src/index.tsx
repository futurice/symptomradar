import 'iframe-resizer/js/iframeResizer.contentWindow'; // because we ONLY need the part for the page being embedded, let's not import the whole library, to shave off some bytes from our bundle
import 'normalize.css';
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

function startSurvey() {
  $('#symptom-questionnaire').removeClass('hidden');
  $('#start-survey').addClass('hidden');
}

function hideSurvey() {
  $('#symptom-questionnaire').addClass('hidden');
  $('#start-survey').removeClass('hidden');
}

function submitSuccessfully() {
  $('#submit-success').removeClass('hidden');
}

function showSubmitError(error: string, instructions: string) {
  const $errorElement = $('#submit-error');

  $errorElement.find('.error-message').text(error);
  $errorElement.find('.error-instructions').text(instructions);
  $errorElement.removeClass('hidden');
}

function hideSubmitError() {
  $('#submit-error').addClass('hidden');
}

function init() {
  $('#start-survey').click(function() {
    startSurvey();
  });

  $('#collapse-survey').click(function() {
    hideSurvey();
  });

  $('#cancel-survey').click(function() {
    hideSurvey();
    $('#symptom-questionnaire').trigger('reset');
  });

  $('#symptom-questionnaire input:required').change(function(event) {
    // attach onchange handler to each input
    // on value change, remove invalid highlight from the input wrapper if exists
    const $inputWrapper = $(this).parents('.invalid-value');

    if ($inputWrapper.hasClass('invalid-value') && $inputWrapper.not(':invalid')) {
      $inputWrapper.removeClass('invalid-value');
    }

    // if no more :invalid inputs are left, remove error message as well
    if ($('symptom-questionnaire .input-wrapper:invalid').length === 0) {
      hideSubmitError();
    }
  });

  $('#submit-survey').click(function(event) {
    // if a required input has invalid value, the form submit event won't fire at all
    // check that inputs with __required__ attribute are filled
    const $invalidFields = $('#symptom-questionnaire .input-wrapper:invalid');

    if ($invalidFields.length > 0) {
      $invalidFields.addClass('invalid-value');
      showSubmitError('Lomakkeesta puuttuu vielä vastauksia', 'Ole hyvä ja täytä puuttuvat kohdat.');
    }
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
      .fail(() => showSubmitError('Tietojen lähetys epäonnistui', 'Ole hyvä ja yritä uudelleen.'));
  });
}

$(document).ready(init);
