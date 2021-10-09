#!/usr/bin/env python

import sys
from pathlib import Path

from flask import Flask, request, send_file
import webview

ROOT = Path(__file__).parent


app = Flask(__name__, static_folder=ROOT.joinpath("www"), static_url_path="/")
images: list[str] = []

for im in sys.stdin:
    images.append(im.rstrip())


@app.route("/")
def index():
    return app.send_static_file("index.html")


@app.get("/api/init")
def api_init():
    return {"images": images}


@app.get("/img")
def img():
    return send_file(request.args["file"])


webview.create_window("Icon FM", app)
webview.start()
