'use strict';

var path = require('path');

module.exports = function(argv, app, events, engine, tasks) {

  // Helpers
  /**
   * Runs a git command on the app data container
   **/
  var runGitCMD = function(cmd, done) {
    // @todo: needs to come from a DEEPER PLACE
    var home = app.config.home;
    if (process.platform === 'win32') {
      home = app.config.home.replace(/\\/g, '/').replace('C:/', '/c/');
    }
    else if (process.platform === 'linux')  {
      home = app.config.home.replace('/home', '/Users');
    }
    engine.run(
      'kalabox/git:stable',
      cmd,
      process.stdout,
      {
        Env: [
          'APPNAME=' +  app.name,
          'APPDOMAIN=' +  app.domain
        ],
        HostConfig: {
          VolumesFrom: [app.dataContainerName]
        }
      },
      {
        Binds: [path.join(home, '.ssh') + ':/ssh:rw']
      },
      done
    );
  };

  // Events
  // Install the util container for our things
  events.on('post-install', function(app, done) {
    engine.build({name: 'kalabox/git:stable'}, done);
  });

  // Tasks
  // git wrapper: kbox git COMMAND
  tasks.registerTask([app.name, 'git'], function(done) {
    // We need to use this faux bin until the resolution of
    // https://github.com/syncthing/syncthing/issues/1056
    var cmd = ['kgit'].concat(argv._);
    runGitCMD(cmd, done);
  });

};
