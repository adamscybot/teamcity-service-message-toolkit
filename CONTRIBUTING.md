# CONTRIBUTING.md

Hello there, Developer! I'm glad that you're interested in contributing to this project. As a collaborative effort, your participation can make a significant difference.

I am a pragmatist and so I'm not laying down some intricate processes for a small project that doesn't need it.

But please read the following loose guidelines before starting.

## Discussion

Before you dive into coding, it would be great if we could have a chat about what you'd like to do. Please open a new issue on the Github issues page and describe what you're planning. This way, we can make sure it fits well with the project's direction and that no one else is already working on it. I am determined to respond quickly and maintain an active dialogue!

While it's encouraged to discuss your plans before starting major changes or new features, it's not necessary for minor adjustments, bug fixes or other obvious improvements. If you're sure about your change, feel free to go ahead, code it and submit a pull request. For these types of changes, just make sure to provide a clear explanation in your pull request so we can understand what issue you're addressing or what improvement you're making. However, for anything substantial or non-obvious, it would be great if we could have a chat first. Please open a new issue on the Github issues page and describe what you're planning. This way, we can make sure it fits well with the project's direction. I am determined to respond quickly and maintain an active dialogue!

## Handover Pledge

If there comes a time when I can no longer maintain the project, I pledge to invite other willing contributors who can. This way, the project can continue to grow and benefit people.

## Workflow

This project is in TypeScript, and your code must be properly linted & formatted according to the project's configuration. If you're not sure how to do this, don't worry – we can guide you through it.

Whenever possible, please write tests for your code. This helps us ensure that everything works as expected, even as the project grows and changes.

Additionally, updating the documentation is as important as code changes. When adding a new feature, remember to update the project's [TypeDoc](<https://typedoc.org/) documentation to reflect the changes. Also try to generate the docs site after adding TypeDoc since that part can be fiddly.

Ensure your change works on node and the browser.

I'm trying to keep dependencies down to a minimum but you can certainly add one if it's justified.

## General code style

Try to stick to the overriding patterns by using what's there as an example. Generally we're making strong use of the builder pattern.

Everything is really quite strongly typed. That said, if you've really got to cast or do something that's considered smelly to remain pragmatic in some situation that could be fine if justified. Use your best judgement and we'll talk about it if there's an issue. Notice I have not added an insane amount of overzealous linting to this project. Trust the developers!

If it's something to do with log processing you should provide a stream interface.

## Commit Messages

At this early stage in the project, I am not worried about being pedantic about the commit message format. However, avoid obviously bad messages like "fix".

## Versioning

Don't bother bumping this yourself, we'll just discuss it on the PR.

## Pull Requests

Once you're ready to share your changes, you can submit a pull request. I actively consider and respond to pull requests. Please provide as much information as makes sense relative to the scale of the work in your pull request to make it easier to understand and integrate.

Thank you for your contribution!
