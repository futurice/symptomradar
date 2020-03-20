import React, { FormEvent, FC, useState, ChangeEvent, Fragment } from 'react';

type RadioInputProps = {
  name: string;
  value: string;
  isChecked: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};
const RadioInput: FC<RadioInputProps> = ({ name, value, isChecked, onChange }) => (
  <Fragment>
    <input id={`${name}-${value}`} type="radio" name={name} value={value} checked={isChecked} onChange={onChange} />
    <label htmlFor={`${name}-${value}`}>{value}</label>
  </Fragment>
);

type RadioInputGroupProps = {
  title: string;
  name: string;
  currentValue: string | null;
  valueChanged: (value: any) => any;
  values?: string[];
};
const RadioInputGroup: FC<RadioInputGroupProps> = ({
  title,
  name,
  currentValue,
  valueChanged,
  values = ['no', 'yes'],
}) => {
  const inputChanged = (event: ChangeEvent<HTMLInputElement>) => valueChanged(event.target.value);
  return (
    <div>
      <legend>{title}</legend>
      {values.map(value => (
        <RadioInput
          name={name}
          value={value}
          isChecked={value === currentValue}
          onChange={inputChanged}
          key={`${name}-${value}`}
        />
      ))}
    </div>
  );
};

type FormProps = {
  submitted: (data: any) => void;
};

export const Form: FC<FormProps> = ({ submitted }) => {
  const [age, setAge] = useState(null);
  const [gender, setGender] = useState(null);
  const [postcode, setPostcode] = useState(null);
  const [fever, setFever] = useState(null);
  const [cough, setCough] = useState(null);
  const [difficultyBreathing, setDifficultyBreathing] = useState(null);
  const [musclePain, setMusclePain] = useState(null);
  const [soreThroat, setSoreThroat] = useState(null);
  const [rhinitis, setRhinitis] = useState(null);
  const [generalWellbeing, setGeneralWellbeing] = useState(null);
  const [duration, setDuration] = useState(null);
  const [longTermMedication, setLongTermMedication] = useState(null);
  const [smoking, setSmoking] = useState(null);
  const [coronaSuspicion, setCoronaSuspicion] = useState(null);

  const valueChange = (stateUpdater: any) => (event: ChangeEvent<HTMLInputElement>) => stateUpdater(event.target.value);

  const formSubmit = (event: FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    submitted({
      age,
      gender,
      postcode,
      fever,
      cough,
      difficultyBreathing,
      musclePain,
      soreThroat,
      rhinitis,
      generalWellbeing,
      duration,
      longTermMedication,
      smoking,
      coronaSuspicion,
    });
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
            value={age || ''}
            onChange={valueChange(setAge)}
          />
        </div>
        <RadioInputGroup
          title="What's your gender?"
          name="gender"
          currentValue={gender}
          valueChanged={setGender}
          values={['female', 'male', 'other']}
        />
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
            value={postcode || ''}
            onChange={valueChange(setPostcode)}
          />
        </div>
      </fieldset>
      <fieldset>
        Do you have:
        <RadioInputGroup
          title="Fever"
          name="fever"
          currentValue={fever}
          valueChanged={setFever}
          values={['no', 'slight', 'high']}
        />
        <RadioInputGroup
          title="Cough"
          name="cough"
          currentValue={cough}
          valueChanged={setCough}
          values={['no', 'mild', 'intense']}
        />
        <em>If you have breathing difficulties, contact doctor immediately.</em>
        <RadioInputGroup
          title="Difficulty breathing"
          name="breathingDifficulties"
          currentValue={difficultyBreathing}
          valueChanged={setDifficultyBreathing}
        />
        <RadioInputGroup title="Muscle pain" name="musclePain" currentValue={musclePain} valueChanged={setMusclePain} />
        <RadioInputGroup title="Sore throat" name="soreThroat" currentValue={soreThroat} valueChanged={setSoreThroat} />
        <RadioInputGroup title="Rhinitis" name="rhinitis" currentValue={rhinitis} valueChanged={setRhinitis} />
      </fieldset>
      <fieldset>
        <RadioInputGroup
          title="How is your general well-being?"
          name="generalWellbeing"
          currentValue={generalWellbeing}
          valueChanged={setGeneralWellbeing}
          values={['fine', 'not ok', 'bad']}
        />
        <div>
          <label htmlFor="duration">How long have you had symptoms?</label>
          <input
            id="duration"
            type="number"
            inputMode="numeric"
            size={2}
            maxLength={2}
            placeholder="days"
            value={duration || ''}
            onChange={valueChange(setDuration)}
          />
        </div>
        <RadioInputGroup
          title="Do you have long-term illness that requires medication?"
          name="longTermMedication"
          currentValue={longTermMedication}
          valueChanged={setLongTermMedication}
        />
        <RadioInputGroup title="Do you smoke?" name="smoking" currentValue={smoking} valueChanged={setSmoking} />
        <RadioInputGroup
          title="Do you suspect you have Coronavirus?"
          name="coronaSuspection"
          currentValue={coronaSuspicion}
          valueChanged={setCoronaSuspicion}
        />
      </fieldset>
      <button type="submit">Report symptoms</button>
    </form>
  );
};
