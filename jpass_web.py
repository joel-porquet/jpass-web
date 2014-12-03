#!/usr/bin/env python

import bottle
from jpass.config import Config
from jpass.service import Service

## url formatting in templates
bottle.SimpleTemplate.defaults["get_url"] = bottle.url

## utils
def get_conf(user):
    conf = Config("/srv/jpass/%s/jpass.conf" % user)
    return conf


## routing
# static files
@bottle.route("/static/<filepath:path>", name="static")
def server_static(filepath):
    return bottle.static_file(filepath, root="static")

# get requests
@bottle.route("/")
@bottle.route("/<user>")
def index(user=None):
    # no particular conf file
    if user is None:
        return bottle.template("index", service_list=None)

    # otherwise try to open the specified conf file
    try:
        conf = get_conf(user)
    except Exception:
        return "Error: the specified user is unknow or unable to open the configuration file"
        #return bottle.template("An error occured: {{e}}", e = e);

    return bottle.template("index",
            service_list = sorted(conf.linear_dict.keys()))

# post requests
@bottle.post("/<user>")
def get_pwd(user=None):
    if user is None:
        return "Error: cannot post on empty user"

    # open the specified conf file
    try:
        conf = get_conf(user)
    except Exception as e:
        return "Error: the specified user is unknow or unable to open the configuration file"
        #return bottle.template("An error occured: {{e}}", e = e);

    # get the service from the conf
    service_name = bottle.request.forms.get("service")
    try:
        serv = Service(service_name, conf)
    except Exception as e:
        return dict(
                val = False,
                service_str = service_name)

    service_str = serv.basename
    extra_str = serv.get_attr("extra")
    if extra_str:
        service_str += " " + extra_str

    return dict(
            val = True,
            service_str = service_str,
            length = serv.get_attr("length"),
            pauth = serv.get_attr("pauth"),
            preq = serv.get_attr("preq"),
            iden = serv.get_attr("id"),
            comment = serv.get_attr("comment"))

## built-in webserver for development purposes
if __name__ == "__main__":
    bottle.debug(True)
    bottle.run(reloader=True)
    bottle.run(host="localhost", port=8080)
