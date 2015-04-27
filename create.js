'use strict';

var taskOpts = require('./tasks')

module.exports = function(kbox, appName) {

  var deps = kbox.core.deps;

  // Add an option
  kbox.create.add(appName, {
    option: {
      name: 'git-username',
      task: taskOpts.gitUsername,
      properties: {
        message: 'Git username'.green,
        required: true,
        type: 'string',
        validator: /^[a-z0-9 ]+$/i,
        warning: 'Git username must be alphanumeric.'
      },
      conf: {
        type: 'plugin',
        plugin: 'kalabox-plugin-git',
        key: 'git-username'
      }
    }
  });

  // Add an option
  kbox.create.add(appName, {
    option: {
      name: 'git-email',
      task: taskOpts.gitEmail,
      properties: {
        message: 'Git email'.green,
        required: true,
        type: 'string',
        validator: /^[a-z0-9@.]+$/i,
        warning: 'Git email must be alphanumeric plus . and @'
      },
      conf: {
        type: 'plugin',
        plugin: 'kalabox-plugin-git',
        key: 'git-email'
      }
    }
  });

};
