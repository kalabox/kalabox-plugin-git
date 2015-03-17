'use strict';

var path = require('path');

module.exports = function(argv, app, events, engine, globalConfig, tasks) {

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
        var flag = (opt.length === 1) ? '-' : '--';
        cmd.push(flag + opt);
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
    var gitUser =
      (process.platform === 'win32') ? process.env.USERNAME : process.env.USER;
    engine.run(
      'kalabox/git:stable',
      cmd,
      {
        Env: [
          'APPNAME=' +  app.name,
          'APPDOMAIN=' +  app.domain,
          'GITUSER=' + gitUser
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
    // If profile is set to dev build from source
    var opts = {
      name: 'kalabox/git:stable',
      build: false,
      src: ''
    };
    if (globalConfig.profile === 'dev') {
      opts.build = true;
      opts.src = path.resolve(__dirname, 'dockerfiles', 'git', 'Dockerfile');
    }
    engine.build(opts, done);
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
