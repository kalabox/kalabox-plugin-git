'use strict';

var path = require('path');

var PLUGIN_NAME = 'kalabox-plugin-git';

module.exports = function(kbox) {

  var argv = kbox.core.deps.lookup('argv');
  var events = kbox.core.events;
  var engine = kbox.engine;
  var globalConfig = kbox.core.deps.lookup('globalConfig');

  kbox.whenApp(function(app) {

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

    // Helpers
    /**
     * Gets plugin conf from the appconfig or from CLI arg
     **/
    var getOpts = function() {
      // Grab our options from config
      var opts = app.config.pluginConf[PLUGIN_NAME];
      // Override any config coming in on the CLI
      for (var key in opts) {
        if (argv[key]) {
          opts[key] = argv[key];
        }
      }
      return opts;
    };

    /**
     * Runs a git command on the app data container
     **/
    var runGitCMD = function(cmd, done) {
      var opts = getOpts();
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
      task.allowArgv = true;
      task.func = function(done) {
        // We need to use this faux bin until the resolution of
        // https://github.com/syncthing/syncthing/issues/1056
        var cmd = getCmd();
        runGitCMD(cmd, done);
      };
    });

  });

};
