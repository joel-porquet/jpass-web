import jpass_web
import os

if __name__ == "__main__":
    os.chdir(os.path.dirname(__file__))
    jpass_web.bottle.run(server="flup")
