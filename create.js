'use strict';

module.exports = function(kbox) {

  var deps = kbox.core.deps;

  // Add an option
  kbox.create.add('drupal7', {
    option: {
      name: 'git-username',
      task: {
        name: 'git-username',
        kind: 'string',
        description: 'Your git username.',
      },
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
  kbox.create.add('drupal7', {
    option: {
      name: 'git-email',
      task: {
        name: 'git-email',
        kind: 'string',
        description: 'Your git email.',
      },
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
