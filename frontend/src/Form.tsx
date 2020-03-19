import React, { FormEvent, FC } from 'react';
type RadioInputYesNoProps = {
  title: string;
  name: string;
};

const RadioInputYesNo: FC<RadioInputYesNoProps> = ({ title, name }) => (
  <div>
    <legend>{title}</legend>
    <input id={`${name}No`} type="radio" name={name} value={'no'} />
    <label htmlFor={`${name}No`}>no</label>
    <input id={`${name}Yes`} type="radio" name={name} value={'yes'} />
    <label htmlFor={`${name}Yes`}>yes</label>
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
        <div>
          <legend>What's your gender?</legend>
          <input id="genderFemale" type="radio" name="gender" value="female" />
          <label htmlFor="genderFemale">female</label>
          <input id="genderFemale" type="radio" name="gender" value="male" />
          <label htmlFor="genderMale">male</label>
          <input id="genderFemale" type="radio" name="gender" value="other" />
          <label htmlFor="genderOther">other</label>
        </div>
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
        <div>
          <legend>Fever</legend>
          <input id="feverNone" type="radio" name="fever" value="no" />
          <label htmlFor="feverNone">no</label>
          <input id="feverNormal" type="radio" name="fever" value="normal" />
          <label htmlFor="feverNormal">less than 38,5 degrees</label>
          <input id="feverHigh" type="radio" name="fever" value="high" />
          <label htmlFor="feverHigh">38,5 degrees or more</label>
        </div>
        <div>
          <legend>Cough</legend>
          <input id="coughNone" type="radio" name="cough" value="none" />
          <label htmlFor="coughNone">no</label>
          <input id="coughMild" type="radio" name="cough" value="mild" />
          <label htmlFor="coughMild">mild</label>
          <input id="coughIntense" type="radio" name="cough" value="intense" />
          <label htmlFor="coughIntense">intense</label>
        </div>
        <em>If you have breathing difficulties, contact doctor immediately.</em>
        <RadioInputYesNo title="Difficulty breathing" name="breathingDifficulties" />
        <RadioInputYesNo title="Muscle pain" name="musclePain" />
        <RadioInputYesNo title="Sore throat" name="soreThroat" />
        <RadioInputYesNo title="Rhinitis" name="rhinitis" />
      </fieldset>
      <fieldset>
        <div>
          <legend>How is your general well-being?</legend>
          <em>If you are unable to get out of bed, contact doctor immediately.</em>
          <input id="wellbeingOk" type="radio" name="wellbeing" value="ok" />
          <label htmlFor="wellbeingOk">I can stay up</label>
          <input id="wellbeingMild" type="radio" name="wellbeing" value="mild" />
          <label htmlFor="wellbeingMild"> I can take care of basic everyday chores, but need rest</label>
          <input id="wellbeingIntense" type="radio" name="wellbeing" value="intense" />
          <label htmlFor="wellbeingIntense">I can hardly get up from bed</label>
        </div>

        <div>
          <label htmlFor="duration">How long have you had symptoms?</label>
          <input id="duration" type="number" inputMode="numeric" size={2} maxLength={2} placeholder="days" />
        </div>

        <RadioInputYesNo title="Do you have long-term illness that requires medication?" name="longTermMedication" />

        <RadioInputYesNo title="Do you smoke?" name="smoking" />

        <RadioInputYesNo title="Do you suspect you have Coronavirus?" name="coronaSuspection" />
      </fieldset>
      <button type="submit">Report symptoms</button>
    </form>
  );
};
