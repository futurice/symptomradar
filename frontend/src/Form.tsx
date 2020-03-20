import React, { FormEvent, FC, useState, ChangeEvent, Fragment } from 'react';

type RadioInputProps = {
  name: string;
  value: string;
};
const RadioInput: FC<RadioInputProps> = ({ name, value }) => (
  <Fragment>
    <input id={`${name}-${value}`} type="radio" name={name} value={value} />
    <label htmlFor={`${name}-${value}`}>{value}</label>
  </Fragment>
);

type RadioInputGroupProps = {
  title: string;
  name: string;
  values?: string[];
};
const RadioInputGroup: FC<RadioInputGroupProps> = ({ title, name, values = ['no', 'yes'] }) => (
  <div>
    <legend>{title}</legend>
    {values.map(value => (
      <RadioInput name={name} value={value} />
    ))}
  </div>
);

type FormProps = {
  submitted: (data: any) => void;
};

export const Form: FC<FormProps> = ({ submitted }) => {
  const formSubmit = (event: FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    submitted({ todo: 'Add form data' });
  };

  return (
    <form onSubmit={formSubmit}>
      <fieldset>
        <div>
          <label htmlFor="age">What's your age?</label>
          <input
            id="age"
            type="number"
            inputMode="numeric"
            size={3}
            minLength={1}
            maxLength={3}
            placeholder="years"
            autoComplete="age"
          />
        </div>
        <RadioInputGroup title="What's your gender?" name="gender" values={['female', 'male', 'other']} />
        <div>
          <label htmlFor="postcode">Where do you live?</label>
          <input
            id="postcode"
            type="text"
            inputMode="numeric"
            size={5}
            minLength={5}
            maxLength={5}
            autoComplete="postal-code"
            placeholder="post code"
          />
        </div>
      </fieldset>
      <fieldset>
        Do you have:
        <RadioInputGroup title="Fever" name="fever" values={['no', 'slight', 'high']} />
        <RadioInputGroup title="Cough" name="cough" values={['no', 'mild', 'intense']} />
        <em>If you have breathing difficulties, contact doctor immediately.</em>
        <RadioInputGroup title="Difficulty breathing" name="breathingDifficulties" />
        <RadioInputGroup title="Muscle pain" name="musclePain" />
        <RadioInputGroup title="Sore throat" name="soreThroat" />
        <RadioInputGroup title="Rhinitis" name="rhinitis" />
      </fieldset>
      <fieldset>
        <RadioInputGroup
          title="How is your general well-being?"
          name="generalWellbeing"
          values={['fine', 'not ok', 'bad']}
        />
        <div>
          <label htmlFor="duration">How long have you had symptoms?</label>
          <input id="duration" type="number" inputMode="numeric" size={2} maxLength={2} placeholder="days" />
        </div>
        <RadioInputGroup title="Do you have long-term illness that requires medication?" name="longTermMedication" />

        <RadioInputGroup title="Do you smoke?" name="smoking" />

        <RadioInputGroup title="Do you suspect you have Coronavirus?" name="coronaSuspection" />
      </fieldset>
      <button type="submit">Report symptoms</button>
    </form>
  );
};
