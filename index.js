'use strict';

var path = require('path');
var _ = require('lodash');
var taskOpts = require('./tasks.js');
var PLUGIN_NAME = 'kalabox-plugin-git';

module.exports = function(kbox) {

  var events = kbox.core.events;
  var engine = kbox.engine;
  var globalConfig = kbox.core.deps.lookup('globalConfig');

  kbox.whenApp(function(app) {

    // Helpers
    /**
     * Gets plugin conf from the appconfig or from CLI arg
     **/
    var getOpts = function(options) {
      // Override kalabox.json options with command line args
      var defaults = app.config.pluginConf[PLUGIN_NAME];
      _.each(Object.keys(defaults), function(key) {
        if (_.has(options, key) && options[key]) {
          defaults[key] = options[key];
        }
      });
      return defaults;
    };

    /**
     * Runs a git command on the app data container
     **/
    var runGitCMD = function(payload, options, done) {
      var cmd = payload;
      var opts = getOpts(options);
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

      // Run the git command in the correct directory in the container if the
      // user is somewhere inside the code directory on the host side.
      // @todo: consider if this is better in the actual engine.run command
      // vs here.
      var workingDirExtra = '';
      var cwd = process.cwd();
      var codeRoot = app.config.codeRoot;
      if (_.startsWith(cwd, codeRoot)) {
        workingDirExtra = cwd.replace(codeRoot, '');
      }
      var codeDir = globalConfig.codeDir;
      var workingDir = '/' + codeDir + workingDirExtra;

      engine.run(
        'kalabox/git:dev',
        cmd,
        {
          WorkingDir: workingDir,
          Env: [
            'CODEDIR=' + codeDir,
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
      var opts = {
        name: 'kalabox/git:dev',
        srcRoot: path.resolve(__dirname)
      };
      engine.build(opts, done);
    });

    // Tasks
    // git wrapper: kbox git COMMAND
    kbox.tasks.add(function(task) {
      task.path = [app.name, 'git'];
      task.description = 'Run git commands.';
      task.kind = 'delegate';
      task.options.push(taskOpts.gitUsername);
      task.options.push(taskOpts.gitEmail);
      task.func = function(done) {
        // We need to use this faux bin until the resolution of
        // https://github.com/syncthing/syncthing/issues/1056
        runGitCMD(this.payload, this.options, done);
      };
    });

  });

};
