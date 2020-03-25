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

    return isValid ? participantId : uuidV4();
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
  $('#symptom-questionnaire').addClass('hidden');
  $('#form-info').addClass('hidden');
}

function submitFailed() {
  $('#submit-error').removeClass('hidden');
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
    $("#symptom-questionnaire").trigger("reset")
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
    const answers: { name: string; value: string }[] = $(this).serializeArray();

    // TODO: check required fields

    // add uuid and timestamp to the request data
    // snake_case is preferred for keys in AWS Athena
    // see https://docs.aws.amazon.com/athena/latest/ug/tables-databases-columns-names.html
    const requestData: { [key: string]: string | null } = {
      participant_uuid: getParticipantId(),
      timestamp: new Date().toISOString(),
      fever: null,
      cough: null,
      breathing_difficulties: null,
      muscle_pain: null,
      sore_throat: null,
      rhinitis: null,
      general_wellbeing: null,
      duration: null,
      longterm_medication: null,
      smoking: null,
      corona_suspicion: null,
      age: null,
      gender: null,
      postal_code: null,
    };

    // populate request data with answers
    for (const answer of answers) {
      requestData[answer.name] = answer.value;
    }

    console.log(requestData);

    // persist participant_uuid – it will be reused if participant answers again
    storeParticipantId(requestData.participant_uuid as string);

    $.post(endpoint, requestData)
      .done(submitSuccessfully)
      .fail(submitFailed);
  });
}

$(document).ready(init);
