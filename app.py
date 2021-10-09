#!/usr/bin/env python

import os
import sys
from pathlib import Path
import mimetypes

from flask import Flask, request
from flask.helpers import send_file
import webview

ROOT = Path(__file__).parent

server = Flask(__name__, static_folder=ROOT.joinpath("www"), static_url_path="/")


@server.get("/")
def index():
    return server.send_static_file("index.html")


@server.get("/api/init")
def api_init():
    def yield_read():
        for im in sys.stdin:
            filename = im.rstrip()
            t = mimetypes.guess_type(filename)[0]
            if os.access(filename, os.R_OK) and t and t.startswith("image/"):
                yield filename + "\n"

    return server.response_class(yield_read(), mimetype="text/plain")


@server.get("/img")
def img():
    return send_file(request.args["file"])


webview.create_window("Icon FM", server)
webview.start(debug=True)
