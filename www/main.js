/// <reference lib="dom" />

import Viewer from "https://cdn.skypack.dev/viewerjs@^v1.10.1?dts";

const elApp = document.querySelector("#app");
/** @type {import('viewerjs'.default)} */
const gallery = new Viewer(elApp, {
  className: "viewerjs",
  title: (image, imageData) => {
    return `${image.alt} (${
      image.src.endsWith(".svg")
        ? "scalable"
        : `${image.alt} (${imageData.naturalWidth} × ${imageData.naturalHeight})`
    })`;
  },
  viewed({ detail: { image } }) {
    /** @type {HTMLImageElement} */
    const img = image;
    const onload = () => {
      gallery.update();

      if (!img.src.endsWith(".svg")) {
        const p = window.innerWidth * 0.8 / img.naturalWidth;
        gallery.zoomTo(p);
      }
    };

    if (img.src === transparentIm) {
      img.src = "/img?file=" + encodeURIComponent(img.alt);
      img.onload = onload;
    } else {
      onload();
    }
  },
});
window.gallery = gallery;

const transparentIm = new URL("/px100.png", location.origin).href;

async function doLookup() {
  const r = await fetch("/api/init");
  const reader = r.body.getReader();
  const dec = new TextDecoder();

  let remainder = "";
  const makeIm = (im) => {
    const elIm = document.createElement("img");

    elIm.src = transparentIm;
    elIm.loading = "lazy";
    elIm.style.opacity = 0;
    elIm.alt = im;
    elIm.title = im;

    elApp.append(elIm);

    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && elIm.src === transparentIm) {
        elIm.src = "/img?file=" + encodeURIComponent(im);
        elIm.style.opacity = 1;
        elIm.onload = () => {
          gallery.update();
        };
      }
    }, {
      threshold: 0.8,
    }).observe(elIm);
  };

  while (true) {
    const { value: im, done } = await reader.read();
    if (done) break;

    if (im) {
      const lines = (remainder + dec.decode(im)).split("\n");
      remainder = lines.pop() || "";

      for (const im of lines) {
        makeIm(im);
      }
    }
  }

  if (remainder) {
    for (const im of remainder.trimEnd().split("\n")) {
      alert(im);
      makeIm(im);
    }
  }
}

doLookup().then(() => {
  setTimeout(() => {
    gallery.show();
  }, 1000);
});
