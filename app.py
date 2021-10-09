#!/usr/bin/env python

import os
import sys
from pathlib import Path
import mimetypes
import base64

import eel

ROOT = Path(__file__).parent

images: list[str] = []

eel.init(ROOT.joinpath("www"), allowed_extensions=[".html", ".js", ".css"])


@eel.expose
def py_images():
    im = images
    globals()["images"] = []
    return im


@eel.expose
def py_image(file: str):
    return (
        "data:"
        + (mimetypes.guess_type(file)[0])
        + ";base64,"
        + base64.b64encode(Path(file).read_bytes()).decode("utf8")
    )


def stdin_read():
    for im in sys.stdin:
        filename = im.rstrip()
        t = mimetypes.guess_type(filename)[0]
        if os.access(filename, os.R_OK) and t and t.startswith("image/"):
            images.append(filename)


eel.spawn(stdin_read)
eel.start("index.html")
