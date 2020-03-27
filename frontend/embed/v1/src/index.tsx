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

function markInvalidInput(input: HTMLInputElement) {
  const { valid, patternMismatch } = input.validity;

  if (!valid) {
    const errorDescription = `(${patternMismatch ? 'virheellinen arvo' : 'pakollinen tieto'})`;
    const $inputWrapper = $(input).parents('.input-wrapper');

    $inputWrapper.addClass('invalid-value');
    $inputWrapper
      .find('.invalid-value-info')
      .text(errorDescription)
      .removeClass('hidden');
  }
}

function inputChanged(event: JQuery.TriggeredEvent) {
  // check input validity on value change
  const { valid } = event.target.validity;

  if (valid) {
    // remove invalid highlight from the input wrapper
    const $inputWrapper = $(event.target).parents('.invalid-value');
    $inputWrapper.removeClass('invalid-value');
    $inputWrapper
      .find('.invalid-value-info')
      .text('')
      .addClass('hidden');
  }

  // if no more :invalid inputs are left, remove error message as well
  if ($('symptom-questionnaire .input-wrapper:invalid').length === 0) {
    hideSubmitError();
  }
}

function startSurvey() {
  $('#symptom-questionnaire').removeClass('hidden');
  $('#start-survey').addClass('hidden');
  setTimeout(function() {
    $('#form-header').focus();

    // attach onchange and onblur handler to each input for dynamic validation
    $('#symptom-questionnaire input:required')
      .blur(event => {
        markInvalidInput((event as JQuery.BlurEvent<HTMLInputElement>).target);
      })
      .change(inputChanged);
  }, 500);
}

function hideSurvey() {
  $('#symptom-questionnaire').addClass('hidden');
  $('#start-survey').removeClass('hidden');

  setTimeout(function() {
    $('#page-title').focus();
  }, 500);
}

function submitSuccessfully() {
  $('#submit-success').removeClass('hidden');
  $('#symptom-questionnaire').trigger('reset');
  setTimeout(function() {
    $('#submit-success').focus();
  }, 500);
}

function showSubmitError(error: string, instructions: string) {
  const $errorElement = $('#submit-error');

  $errorElement.find('.error-message').text(error);
  $errorElement.find('.error-instructions').text(instructions);
  $errorElement.removeClass('hidden');

  setTimeout(function() {
    $('#submit-error').focus();
  }, 500);
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

  const endpoint = process.env.REACT_APP_API_ENDPOINT;
  if (!endpoint) {
    console.error('Endpoint url missing');
    return;
  }

  $('#symptom-questionnaire').submit(function(event) {
    event.preventDefault();

    // if a required input has invalid value, the form submit event won't fire at all
    // check that inputs with __required__ attribute are valid
    const $invalidFields = $('#symptom-questionnaire input:required:invalid');

    if ($invalidFields.length > 0) {
      $invalidFields.each((_, element) => markInvalidInput(element as HTMLInputElement));
      showSubmitError('Lomakkeesta puuttuu vielä vastauksia', 'Ole hyvä ja täytä puuttuvat kohdat.');
      return;
    }

    // serialize form data into { name: input.name, value: input.value } format
    // unanswered fields are not included
    const answers = $(this)
      .serializeArray()
      .map(x => (x.value === '' ? { ...x, value: null } : x)) // convert empty strings (i.e. skipped questions) to nulls
      .reduce((memo, next) => ({ ...memo, [next.name]: next.value }), {});
    const meta = { participant_id: getParticipantId() };
    const submission = { ...meta, ...answers };

    // persist participant_id – it will be reused if participant answers again
    storeParticipantId(submission.participant_id);

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
