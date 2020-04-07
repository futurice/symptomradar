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

Please contribute by writing a document about local development environment. See above.

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
