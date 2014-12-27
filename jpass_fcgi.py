#!/usr/bin/env python

import flup.server.fcgi
import jpass_web
import os

if __name__ == "__main__":
    os.chdir(os.path.dirname(__file__))
    flup.server.fcgi.WSGIServer(jpass_web.bottle.default_app()).run()
