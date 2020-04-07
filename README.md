[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Symptomradar (Oiretutka) crowdsources coronavirus symptoms from news media audience

Symptomradar (Oiretutka in Finnish) is a service by software company Futurice and newspaper Helsingin Sanomat to crowdsource coronavirus symptoms from general public.

Crowdsourcing happens by asking questions in an embed that is placed on news media pages. The responses are stored without personally identifiable information. Results are shown in embeds and separate Oiretutka.fi or Symptomradar.com page.

The project is open source with MIT license. We encourage media outlets to collaborate within countries to create a service to map the spread of the virus. We welcome all contributors to the project.

# Links to live versions of the project

Here you can find [the release from Helsingin Sanomat](https://www.hs.fi/kotimaa/art-2000006463218.html).

[Privacy information, currently only in Finnish](https://www.oiretutka.fi/tietosuojalauseke.html).

# Open dataset released

We are releasing the results from the survey as open data. Please [read the terms (currently only in Finnish)](https://www.oiretutka.fi/tietosuojalauseke.html).

You can [download an open dataset of some 100k replies in city-level from here].(https://interactive.hs.fi/arkku/files/26431963citylevel-opendata-3-4-2020.csv)

# How to contribute

This project was developed in a hurry after the coronavirus really started spreading. So we don't have much documentation yet.

If you find any problems, please open an issue or submit a fix as a pull request.

We welcome new features, but for large changes let's discuss first to make sure the changes can be accepted and integrated smoothly. Discussion should take place in issue dedicated to the new feature.

Feel free to pick an issue and start contributing.

For good first issues regarding contributing, see [issues labeled with open sourcing improvements](https://github.com/futurice/symptomradar/labels/open%20sourcing%20improvements).

# Local development environment

This section is still under construction, if you have troubles setting the environment, please contact us (see below section).

## Project structure

The project is currently divided into three parts:

- Backend, which that takes care of collecting and storing survey answers with a stong care for privacy and security
- Frontend main app, the main pages of [Oiretutka.fi](https://oiretutka.fi)
- Frontend embed, [the survey form embedded in Helsingin Sanomat](https://www.hs.fi/kotimaa/art-2000006455647.html).

### Backend

Backend related files can be found in:

```
index-backend.ts
src/
- backend/
```

`<insert some Jarno wisdom here>`

### Frontend main app

As previously mentioned, the main app consists in the pages of [Oiretutka.fi](https://oiretutka.fi). Related files can be found in:

```
index-frontend-main.tsx
src/
- frontend/
-- main/
```

This part has been developed using [React](https://reactjs.org/) and [Typescript](https://www.typescriptlang.org/).

### Frontend embed

Our embed consists in [the survey form embedded in Helsingin Sanomat](https://www.hs.fi/kotimaa/art-2000006455647.html). Related files can be found in:

```
index-frontend-embed-v1tsx
src/
- frontend/
-- embed/
--- v1/
```

The embed has been developed using [jQuery 3.4.1](https://jquery.com/). The embed is also used in the frontend main app.

### Common files

There are files that are shared across the apps, e.g. `fonts.d.ts` and `src/common/`.

## Prerequisites

Project requires Node.js >=12 <13 to be installed; all other dependencies come from NPM via package.json.

You will need Node and npm (npm comes with Node). We recommend [using a node version manager, nvm](https://github.com/nvm-sh/nvm) to install Node, as it allows automatically switching between node versions across projects.

We recommend also installing [direnv](https://direnv.net/), which helps automatically set environment variables as you switch directories.

## Development environment setup

Clone the project from GitHub (make sure to clone it from the directory you wish to contain your project)

```shell
git clone git@github.com:futurice/symptomradar.git
```

Install NPM dependencies

```shell
cd symptomradar
rm -rf node_modules
nvm use
npm i
```

(`rm -rf node_modules` is a completely optional step needed only if you have previously attempted to install the project and things went wrong)

If you have some issues with the packages installation, please try the following:

```shell
rm -rf node_modules
nvm use
npm i --no-optional
```

## Environment variables

This application uses a number of environment variables to customise the runtime behaviour. The following steps assume that you are using [direnv](https://direnv.net/).

Copy over .envrc.sample into .envrc, at the project root

```shell
cp .envrc.sample .envrc
```

To work with the frontend, you shouldn't need any further variable than the ones already provided.
Follow the instructions inside `.envrc` if you need to set up a mock API endpoint.

Finally, you need to read the variables from `.envrc`:

```shell
source .envrc
```

This command will also make sure that you are using the right Node version for this project.

## Available NPM tasks (frontend)

- `frontend-main-start` runs the React application of Oiretutka
- `frontend-main-build` creates a build for the React application
- `frontend-embed-v1-start` runs the jQuery embed of Oiretutka
- `frontend-embed-v1-build` creates a build for the jQuery embed

## Wrap up

For the following times you will work on the project, you will need to

- enter the project folder
- run `source .env`, which will automatically set up the right node version (assuming you are using nvm)
- `npm run frontend-main-start` or `npm run frontend-embed-v1-start` according to which part of the project you want to run locally

## Developing the stand alone (React) app

## Developing the embedded form (with vanilla JS, jQuery and TypeScript)

As said earlier in this document, the crowdsourcing happens by asking questions in an embed that is placed on news media pages or articles.

Performance wise, it didn't seem like a good idea to develop the embedded form with a modern JS framework and have all the users who are opening the news articles download extra data, when the form can be implemented using basic HTML and very light-weight (vanilla) JavaScript and JS libraries (jQuery). The JavaScript is typed with TypeScript.

If you have worked previously with modern JS frameworks, these technologies might feel a bit old-fashioned and foreign. If you haven't used vanilla JavaScript in a while or haven't noticed you know vanilla JS, [read and bookmark this cheatsheet](https://htmldom.dev/), [practice JavaScript interactively online](https://learnjavascript.online/) or just [browse extensive JS documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript). If your jQuery skills are rusty, or you haven't worked with jQuery before, [take a look at jQuery basics](http://jqfundamentals.com/chapter/jquery-basics).

If you haven't worked with TypeScript before, take a look at [the TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/basic-types.html). Mostly TypeScript means that all function parameters and outputs have to be typed. If [the basic types](https://www.typescriptlang.org/docs/handbook/basic-types.html) aren't enough, take a look at [jQuery types](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/682ebb5fcda0d6d68bda36862171cd1f116121b2/types/jquery) too.

Also, as the form is emdedded through an <iframe> element, it's a good idea to read [the ultimate guide to iframes](https://blog.logrocket.com/the-ultimate-guide-to-iframes/), it'll give you more context about how the media sites will use this form.

# Contact

To contact the team behind the project, email datadeski@hs.fi

# Security

If you find a security related issue in our service, please contact datadeski@hs.fi and cert@sanoma.fi, preferred language is English or Finnish.

# Release process

- Update `app_version` and push it to `master`
- Ensure `dev` has deployed the release you're planning to put out
- [Test that basic data collection works directly](https://dev.oiretutka.fi/embed/v1/) and/or [embedded](https://www.hs.fi/datajournalismi/art-2000006450733.html)
- Take a peek at the `dev` overview dashboard on CloudWatch and make sure everything looks fine
- Run `terraform apply` to ensure there's no unapplied changes
- Release the version pin for `module "env_prod"` in `infra/main.tf` (that is, remove the `?ref=vX.Y` part from the module source string)
- Run `terraform apply` again, and apply any changes to prod (don't do this without knowing what you're doing, though; it's prod infrastructure!)
- Consult the "N commits to master since this release" link in [releases](https://github.com/futurice/symptomradar/releases) and write release notes
- Create the release on GitHub
- Check that the [related action](https://github.com/futurice/symptomradar/actions?query=workflow%3A%22Deploy+PROD%22) completes successfully
- [Test that basic data collection works directly](https://www.oiretutka.fi/embed/v1/) and/or [embedded](https://www.hs.fi/kotimaa/art-2000006452379.html)
- Take a peek at the `prod` overview dashboard on CloudWatch and make sure everything looks fine
- Set the version pin back to `infra/main.tf`, pointing to the newly created release

# MIT License

Copyright 2020 Futurice & Helsingin Sanomat

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
