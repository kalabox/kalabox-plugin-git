'use strict';

var path = require('path');

module.exports = function(argv, app, events, engine, tasks) {

  // Helpers
  /**
   * Returns an arrayed set of git-ready commands
   **/
  var getCmd = function() {
    // @todo: not sure if the command structure is different on D7 vs D6
    // Grab our options from config so we can filter these out
    var cmd = argv._;
    delete argv._;

    for (var opt in argv) {
      if (argv[opt] === true) {
        cmd.push('--' + opt);
      }
      else {
        cmd.push('--' + opt + '=' + argv[opt]);
      }
    }

    return cmd;
  };

  /**
   * Runs a git command on the app data container
   **/
  var runGitCMD = function(cmd, done) {
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
        Binds: [app.config.homeBind + ':/ssh:rw']
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
    var cmd = getCmd();
    runGitCMD(cmd, done);
  });

};
