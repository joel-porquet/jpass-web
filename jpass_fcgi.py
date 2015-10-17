#!/usr/bin/env python

import flipflop
import jpass_web
import os

if __name__ == "__main__":
    os.chdir(os.path.dirname(__file__))
    flipflop.WSGIServer(jpass_web.bottle.default_app()).run()
