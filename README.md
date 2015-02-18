# Kalabox Plugin Git

A simple plugin to add git commands to your apps.

## Installation

You can install this plugin by going into your app directory and running the normal

```
npm install kalabox-plugin-git --save
```

In order for your app to use the plugin you will also need to info the app of its existence. This can be done in the `kalabox.json` file in your
app root. Just add the plyugin name to the `appPlugins` key.

```json
{
  "appName": "pressflow7",
  "appPlugins": [
    "my-hot-plugin",
    "kalabox-plugin-pressflow7-env",
    "kalabox-plugin-git"
  ],
}

```

## Usage

Run any git command you normally would but start it with `kbox`. Run it from the directory that contains the app you want to run it against or pass in the appname.

Examples

```
# Returns the version of git, must run from a directory that contains a kalabox app 
kbox git version

# Clones a repo into /data for the pressflow app
kbox pressflow7 git clone http://github.com/kalamuna/playbox.git ./

# Pulls down the latest code, must run from a directory that contains a kalabox app
kbox git pull
```

## Other Resources

* [API docs](http://api.kalabox.me/)
* [Test coverage reports](http://coverage.kalabox.me/)
* [Kalabox CI dash](http://ci.kalabox.me/)
* [Mountain climbing advice](https://www.youtube.com/watch?v=tkBVDh7my9Q)
* [Boot2Docker](https://github.com/boot2docker/boot2docker)
* [Syncthing](https://github.com/syncthing/syncthing)
* [Docker](https://github.com/docker/docker)

-------------------------------------------------------------------------------------
(C) 2015 Kalamuna and friends


