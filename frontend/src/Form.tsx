import React, { FormEvent, FC, useState, ChangeEvent, Fragment } from 'react';
import styled from 'styled-components';
import PrimaryButton from './PrimaryButton';

const Input = styled.input`
  height: 40px;
  border: 1px solid #000;
  display: block;
  width: 100%;
  padding: 0 5px;

  &::-webkit-input-placeholder {
    font-size: 14px;
  }
`;

const Fieldset = styled.fieldset`
  border: none;
  padding: 0 0 10px 0;
`;

const QuestionWrapper = styled.div`
  margin: 0 0 24px 0;
`;

const Label = styled.label`
  margin: 0 0 5px 0;
  display: block;
`;

const Legend = styled.legend`
  margin: 0 0 5px 0;
  display: block;
`;

const QuestionGroupTitle = styled.p`
  font-weight: bold;
  margin: 0 0 10px 0;
`;

const Em = styled.em`
  margin: 0 0 20px 0;
  display: block;
`;

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
  currentValue: string;
  valueChanged: (value: string) => void;
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
    <QuestionWrapper>
      <Legend>{title}</Legend>
      {values.map(value => (
        <RadioInput
          name={name}
          value={value}
          isChecked={value === currentValue}
          onChange={inputChanged}
          key={`${name}-${value}`}
        />
      ))}
    </QuestionWrapper>
  );
};

type FormProps = {
  submitted: (data: any) => void;
};

export const Form: FC<FormProps> = ({ submitted }) => {
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [postcode, setPostcode] = useState<string>('');
  const [fever, setFever] = useState<string>('');
  const [cough, setCough] = useState<string>('');
  const [difficultyBreathing, setDifficultyBreathing] = useState<string>('');
  const [musclePain, setMusclePain] = useState<string>('');
  const [soreThroat, setSoreThroat] = useState<string>('');
  const [rhinitis, setRhinitis] = useState<string>('');
  const [generalWellbeing, setGeneralWellbeing] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [longTermMedication, setLongTermMedication] = useState<string>('');
  const [smoking, setSmoking] = useState<string>('');
  const [coronaSuspicion, setCoronaSuspicion] = useState<string>('');

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
      <Fieldset>
        <QuestionWrapper>
          <Label htmlFor="age">What's your age?</Label>
          <Input
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
        </QuestionWrapper>
        <RadioInputGroup
          title="What's your gender?"
          name="gender"
          currentValue={gender}
          valueChanged={setGender}
          values={['female', 'male', 'other']}
        />
        <QuestionWrapper>
          <Label htmlFor="postcode">Where do you live?</Label>
          <Input
            id="postcode"
            type="text"
            inputMode="numeric"
            size={5}
            minLength={5}
            maxLength={5}
            autoComplete="postal-code"
            placeholder="postal code"
            value={postcode || ''}
            onChange={valueChange(setPostcode)}
          />
        </QuestionWrapper>
      </Fieldset>
      <Fieldset>
        <QuestionGroupTitle>Do you have:</QuestionGroupTitle>
        <RadioInputGroup
          title="Fever"
          name="fever"
          currentValue={fever}
          valueChanged={setFever}
          values={['none', 'slight', 'high']}
        />
        <RadioInputGroup
          title="Cough"
          name="cough"
          currentValue={cough}
          valueChanged={setCough}
          values={['none', 'mild', 'intense']}
        />
        <RadioInputGroup
          title="Difficulty breathing"
          name="breathingDifficulties"
          currentValue={difficultyBreathing}
          valueChanged={setDifficultyBreathing}
        />
        <Em>If you have breathing difficulties, contact doctor immediately.</Em>
        <RadioInputGroup title="Muscle pain" name="musclePain" currentValue={musclePain} valueChanged={setMusclePain} />
        <RadioInputGroup title="Sore throat" name="soreThroat" currentValue={soreThroat} valueChanged={setSoreThroat} />
        <RadioInputGroup title="Rhinitis" name="rhinitis" currentValue={rhinitis} valueChanged={setRhinitis} />
      </Fieldset>
      <Fieldset>
        <RadioInputGroup
          title="How is your general well-being?"
          name="generalWellbeing"
          currentValue={generalWellbeing}
          valueChanged={setGeneralWellbeing}
          values={['fine', 'impaired', 'bad']}
        />
        <QuestionWrapper>
          <Label htmlFor="duration">How long have you had symptoms?</Label>
          <Input
            id="duration"
            type="number"
            inputMode="numeric"
            size={2}
            maxLength={2}
            placeholder="days"
            value={duration || ''}
            onChange={valueChange(setDuration)}
          />
        </QuestionWrapper>
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
      </Fieldset>
      <PrimaryButton type="submit" label={'Report symptoms'} />
    </form>
  );
};
