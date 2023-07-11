# tc-message-toolkit

A toolkit to handle [TC service messages](https://www.jetbrains.com/help/teamcity/service-messages.html#Reporting+Messages+to+Build+Log). Includes a streamable parser as well as the ability to generate synthetic TC log output.

**Not yet ready for public consumption. In active dev June 2023.**

# License & Typical Enterprise Considerations

AKA How do I get my manager to accept this.

This project is MIT licensed so can be used commercially. I encourage you actively ask questions and raise issues, but that is also only an ask. You can absolutely ignore this and do whatever you please. Just know that a little bit of me died inside.

MIT requires that the license is included in the project using it. The compiled bundles in `dist` already have this embedded and that is sufficient. There is also a `dependencies.txt` file in the same directory that includes licenses of transitive deps.

I am careful to include automated whitelist license scanning of dependencies to avoid transitive licenses that are "toxic" for commerical use, like GPL. Howvever you should of course check this your end too.

I am using dependabot to keep packages up to date. This package works with any Content Security Policy that allows scripts and always will. Dependencies are kept to a minimum and carefully considered.

This package will never require postinstall scripts for consumption purposes, and wont use packages that require postinstall scripts. It won't reach to the outside world or use dependencies that do, so is good to use on firewalled CI. Note, does not apply to development.

The package source will always be included in the published tarballs so you can choose to import that rather than compiled vesrions if you prefer.

Should a security issue arise on a previous major version I will endeavour to patch it (within reason).

NPM Publish credentials are kept highly secure.

I pledge to invite contributors if I struggle to maintain the project, but have full intentions of doing so long term.

All of this, naturally, is not guaranteed and I remain not liable as per MIT license.
