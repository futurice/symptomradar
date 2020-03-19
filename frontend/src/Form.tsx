import React, { FormEvent, FC } from 'react';

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
        <div>
          <legend>Difficulty breathing</legend>
          <em>If you have breathing difficulties, contact doctor immediately.</em>
          <input id="respiratoryNone" type="radio" name="respiratory" value="no" />
          <label htmlFor="respiratoryNone">no</label>
          <input id="respiratoryYes" type="radio" name="respiratory" value="yes" />
          <label htmlFor="respiratoryYes">yes</label>
        </div>
        <div>
          <legend>Muscle pain</legend>
          <input id="muscularNone" type="radio" name="muscular" value="no" />
          <label htmlFor="muscularNone">no</label>
          <input id="muscularYes" type="radio" name="muscular" value="yes" />
          <label htmlFor="muscularYes">yes</label>
        </div>
        <div>
          <legend>Sore throat</legend>
          <input id="throatNone" type="radio" name="throat" value="no" />
          <label htmlFor="throatNone">no</label>
          <input id="throatYes" type="radio" name="throat" value="yes" />
          <label htmlFor="throatYes">yes</label>
        </div>
        <div>
          <legend>Rhinitis</legend>
          <input id="rhinitisNone" type="radio" name="rhinitis" value="no" />
          <label htmlFor="rhinitisNone">no</label>
          <input id="rhinitisYes" type="radio" name="rhinitis" value="yes" />
          <label htmlFor="rhinitisYes">yes</label>
        </div>
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

        <div>
          <legend>Do you have long-term illness that requires medication?</legend>
          <input id="medicationNone" type="radio" name="medication" value="no" />
          <label htmlFor="medicationNone">no</label>
          <input id="medicationYes" type="radio" name="medication" value="yes" />
          <label htmlFor="medicationYes">yes</label>
        </div>

        <div>
          <legend>Do you smoke?</legend>
          <input id="smokingNone" type="radio" name="smoking" value="no" />
          <label htmlFor="smokingNone">no</label>
          <input id="smokingYes" type="radio" name="smoking" value="yes" />
          <label htmlFor="smokingYes">yes</label>
        </div>

        <div>
          <legend>Do you suspect you have Coronavirus?</legend>
          <input id="suspicionNone" type="radio" name="suspicion" value="no" />
          <label htmlFor="suspicionNone">no</label>
          <input id="suspicionYes" type="radio" name="suspicion" value="yes" />
          <label htmlFor="suspicionYes">yes</label>
        </div>
      </fieldset>
      <button type="submit">Report symptoms</button>
    </form>
  );
};
