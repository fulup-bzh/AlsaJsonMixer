
alsa-json-mixer

Linux Mixer UI for Scarlett Focurite music oriented sound equipment. This UI is 100% written in HTML5
and should run on any modern browser [Check with online demo before installing]. While based
on generic widget this UI is currently only supporting Scarlett Focurite boards, if you're willing
to add your own board feel free to propose your code.

Current version while still in Alfa mode is fully operational and control 100% of ALSA features.
On top of traditional Alsa controls, UI provides a session management mechanism to load/store configurations.
Sessions include all settings for volumes and routing as well as custom labels given control.

* Online Demo: http://breizhme.net/alsajson/mixers/ajg#/
* Video   https://vimeo.com/user36538868/alsa-html5-mixer

Dependencies:
* HTML5 Browser any modern version of Firefox,Chrome,Safari or even IE should do the job.
* Alsa Json Gateway [https://github.com/fulup-bzh/AlsaJsonGateway]

Techno:
* Angular for JavaScript
* Foundation5 for rendering and screen fluid adaptation.
* SCSS and Grunt

![SceenShot](/www/AlsaJsonMixer-Scarlett-Focurite.png?raw=true "Screen Shot")