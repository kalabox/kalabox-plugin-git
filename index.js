'use strict';

var path = require('path');

var PLUGIN_NAME = 'kalabox-plugin-git';

module.exports = function(kbox) {

  var _ = require('lodash');
  var yargs = require('yargs');

  var events = kbox.core.events;
  var engine = kbox.engine;
  var globalConfig = kbox.core.deps.lookup('globalConfig');

  kbox.whenApp(function(app) {

    // Helpers
    /**
     * Gets plugin conf from the appconfig or from CLI arg
     **/
    var getOpts = function(argv) {
      var options = yargs.parse(argv);
      var defaults = app.config.pluginConf[PLUGIN_NAME];
      _.each(Object.keys(defaults), function(key) {
        if (_.has(options, key)) {
          defaults[key] = options[key];
        }
      });
      return defaults;
    };

    /**
     * Runs a git command on the app data container
     **/
    var runGitCMD = function(argv, done) {
      var cmd = argv;
      var opts = getOpts(argv);
      var gitUser;
      if (opts['git-username']) {
        gitUser = opts['git-username'];
      }
      else {
        gitUser = (process.platform === 'win32') ?
          process.env.USERNAME : process.env.USER;
      }
      var gitEmail =
        (opts['git-email']) ? opts['git-email'] : gitUser + '@kbox';

      engine.run(
        'kalabox/git:stable',
        cmd,
        {
          Env: [
            'APPNAME=' +  app.name,
            'APPDOMAIN=' +  app.domain,
            'GITUSER=' + gitUser,
            'GITEMAIL=' + gitEmail
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
    kbox.tasks.add(function(task) {
      task.path = [app.name, 'git'];
      task.description = 'Run git commands.';
      task.kind = 'delegate';
      task.func = function(done) {
        // We need to use this faux bin until the resolution of
        // https://github.com/syncthing/syncthing/issues/1056
        runGitCMD(this.argv, done);
      };
    });

  });

};
