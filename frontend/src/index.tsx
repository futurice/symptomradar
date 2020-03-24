import $ from 'jquery';
import { v4 as uuidV4 } from 'uuid';

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
    const answers: { name: string; value: string }[] = $(this).serializeArray();

    // TODO: check required fields

    // add uuid and timestamp to the request data
    // snake_case is preferred for keys in AWS Athena
    // see https://docs.aws.amazon.com/athena/latest/ug/tables-databases-columns-names.html
    const requestData: { [key: string]: string | null } = {
      participant_uuid: uuidV4(),
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

    $.post(endpoint, requestData)
      .done(submitSuccessfully)
      .fail(submitFailed);
  });
}

$(document).ready(init);
