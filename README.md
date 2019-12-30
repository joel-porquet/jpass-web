# jpass-web: a web-frontend for jpass password manager/generator

## Unmaintained project

**I no longer use or develop this project, as I have switched to Bitwarden to
handle all my passwords.**

## Introduction

While [jpass][jpass] is a flexible and configurable password manager and
generator, **jpass-web** is a web-frontend for it.

**jpass-web** can operate in two modes (simultaneously):

1. standalone mode: following the principles described in this
   [article](https://joel.porquet.org/wiki/hacking/password_management_history/),
   **jpass-web** can generate a password based on a *passphrase* and a *master
   password*.

2. user git mode: **jpass-web** can be connected to a configuration file (i.e.
   the same you are also using with **jpass**, and that of course you are
   versioning on your server using gitolite).

Important: **jpass-web** generates passwords locally, i.e. in your browser
using Javascript. It means that your passwords are never exchanged on the
Internet.

## Setup (basic)

With the basic setup, you can use **jpass-web** in standalone mode.

### Installation

First of all, for the lucky ones who use ArchLinux, there is a package on
[AUR](https://aur.archlinux.org/packages/jpass-web-git/).

Otherwise, the following files and folders should be installed somewhere (for
example in `/usr/share/webapps/jpass`):

* `jpass_fcgi.py`
* `jpass_web.py`
* `static/`
* `views/`

### Webserver configuration (lighttpd)

Now here is a possible configuration in lighttpd:

    var.jpass_url = "/jpass"
    var.jpass_path = "/usr/share/webapps/jpass"
    var.jpass_fcgi = "jpass_fcgi.py"

    # jpass rule
    $HTTP["url"] =~ "^" + jpass_url + "(|/.*)" {
        # use this path instead of the normal document-root
        alias.url += (jpass_url => jpass_path)
        # new index file
        index-file.names = (jpass_fcgi)
        # special configuration for python
        fastcgi.server = (
            ".py" => (
                "jpass" => (
                    "bin-path" => jpass_path + "/jpass_fcgi.py",
                    "socket" => "/var/run/lighttpd/python-fastcgi-jpass.socket",
                    "max-procs" => 1,
                    "check-local" => "disable",
                    )
                )
            )
        }

## Setup for git mode (advanced)

This is the most interesting mode, where you can access a synchronized list of
services.

Here is the typical scenario:

* On your local computer, you already use [jpass][jpass] for managing your
  passwords.
* Your configuration file for **jpass** is put under version control on your
  server, using gitolite.
* **jpass-web** enables the access to this configuration file so you have
  access to the same list of services as in the CLI.

### Installation

In addition to the basic installation, the file `bin/jpass_hook` should be
installed in `/usr/bin/`.

Now, assuming you installed **jpass-web** in `/usr/share/webapps/jpass` as
suggested above, you have to create a configuration file named `jpassrc` in the
same directory. Or even better, the configuration should be in
`/etc/webapps/jpass/` and only a link to it in `/usr/share/webapps/jpass`.

This file must define three variables (see `docs/jpassrc.example`):

    [jpass]
    vcspath=/srv/jpass
    pwdname=jpass.conf
    hookdir=%(vcspath)s/hooks

* `vcspath` is the path where **jpass-web** will find the local working copy of
  your jpass configuration file (containing the list of services).

* `pwdname` is the name of the jpass configuration file.

* `hookdir` is where the hook for gitolite should be generated, so the local
  working copy of your jpass configuration file can be updated when gitolite
  receives commits.

#### Git repository setup

Ideally, to maintain a good safety and isolation, `vcspath` should be home to a
`jpass` user. The `http` user should then be in the `jpass` group, so it has
access to the path. For example (assuming `vcspath` is `/srv/jpass`):

    $ sudo groupadd --system jpass
    $ sudo useradd --system -c 'jpass user' -g jpass -m -d /srv/jpass jpass
    $ sudo gpasswd -a http jpass

Let's assume you want to configure **jpass-web** for a user named *toto*. This
user *toto* uses **jpass** on its local computer and has put his configure file
under gitolite on the server (in a repo named `jpass`). We need to connect the
local working copy and the bare git repository.

**The following commands should be executed by the jpass user. Basically, run
those commands with `sudo -u jpass`.**

    $ mkdir /srv/jpass/toto
    $ cd /srv/jpass/toto
    $ git clone git@localhost:jpass

Now the repositories are connect and there should be a local copy of the
password configuration file in `/srv/jpass/toto`. However, whenever *toto* will
edit his file on his local computer and push to the server, the local copy will
not be updated. That is why we need a post-update git hook.

Still as the `jpass` user, run the following commands in order to generate the
hook:

    $ mkdir /srv/jpass/hooks
    $ jpass_hook toto -c /usr/share/webapps/jpass/jpassrc

Finally, the hook has to be installed in gitolite:

    $ sudo ln -s /srv/jpass/hooks/toto.post-update /srv/git/repositories/jpass.git/hooks

And that's it! Now, when *toto* commits changes on his password file, the local
working copy for **jpass-web** will be automatically updated.

#### Webserver configuration (lighttpd)

There are a couple more tweaks to apply to the lighttpd configuration presented
above.

First, in order to be able to access to `http://yourwebsite/jpass/toto` instead
of `http://yourwebsite/jpass/jpass_fcgi.py/toto`, we need to add rewriting
rules:

    url.rewrite-once = (
        # do not rewrite an already well formatted url
        "^" + jpass_url + "/" + jpass_fcgi + "(|/.*)$" => "$0",
        # rewrite only if looking like /jpass/<toto> (to /jpass/jpass_fcgi.py/toto)
        "^" + jpass_url + "(/.*)$" => jpass_url + "/" + jpass_fcgi + "$1",
        )

Second, you might want to protect the access to `http://yourwebsite/jpass/toto`
from unauthorized access. While the URL does not give access to any of your
passwords (there locally generated in your browser, based on your master
password), it still gives access to sensitive information (identifier, etc.)

To protect the URL with a simple protection, you can add the following lines to
your lighttpd configuration (see the
[documentation](http://redmine.lighttpd.net/projects/1/wiki/docs_modauth) for
more information):

    # authentication required when accessing a user path but not static url
    $HTTP["url"] =~ "^" + jpass_url + "/" + jpass_fcgi + "/(?!(static)).+$" {
        auth.require = ( "" =>
            (
                "method" => "digest",
                "realm" => "Authenticated users only",
                "require" => "valid-user"
                )
            )
        }

Call it a good idea or not, but the authenticated user must be the same as the
user specified to **jpass-web**. So if *toto* wants to access
`http://yourwebsite/jpass/toto`, he must authenticate himself as *toto* with lighttpd.

# Mirrors

This project is mirrored on:

* [github](https://github.com/joel-porquet/jpass-web)
* [my cgit](https://joel.porquet.org/cgit/cgit.cgi/jpass-web.git/about/)

[jpass]: https://github.com/joel-porquet/jpass
