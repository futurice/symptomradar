import $ from 'jquery';
import { v4 as uuidV4 } from 'uuid';

function submitSuccessfully() {
  $('#submit-success').removeClass('hidden');
  $('#symptom-questionnaire').addClass('hidden');
}

function submitFailed() {
  $('#submit-error').removeClass('hidden');
}

function init() {
  const endpoint = process.env.REACT_APP_API_ENDPOINT;
  if (!endpoint) {
    console.error('Endpoint url missing');
    return;
  }

  $('#symptom-questionnaire').submit(function(event) {
    event.preventDefault();

    // serialize form data into { name: input.name, value: input.value } format
    // unanswered fields are not included
    const answers = $(this).serializeArray();

    // TODO: check required fields

    // add uuid and timestamp to the request data
    // snake_case is preferred for keys in AWS Athena
    // see https://docs.aws.amazon.com/athena/latest/ug/tables-databases-columns-names.html
    const requestData: { [key: string]: string } = {
      participant_uuid: uuidV4(),
      response_timestamp: new Date().toISOString(),
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
