#!/usr/bin/env python

import bottle
from jpass.config import Config
from jpass.service import Service

bottle.SimpleTemplate.defaults["get_url"] = bottle.url

def get_conf(user):
    conf = Config("../%s/jpass.conf" % user)
    return conf


@bottle.route("/")
@bottle.route("/<user>")
def index(user=None):
    # no particular conf file
    if user is None:
        return bottle.template("index", service_list=None)

    # otherwise try to open the specified conf file
    try:
        conf = get_conf(user)
    except Exception as e:
        return bottle.template("An error occured: {{e}}", e = e);

    return bottle.template("index",
            service_list = sorted(conf.linear_dict.keys()))

@bottle.route("/static/<filepath:path>", name="static")
def server_static(filepath):
    return bottle.static_file(filepath, root="static")

@bottle.post("/<user>")
def get_pwd(user=None):
    if not user:
        return bottle.template("Unknown user");

    # open the specified conf file
    try:
        conf = get_conf(user)
    except Exception as e:
        return bottle.template("An error occured: {{e}}", e = e);

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

if __name__ == "__main__":
    bottle.debug(True)
    bottle.run(reloader=True)
    bottle.run(host="localhost", port=8080)
