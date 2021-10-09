/// <reference lib="dom" />

import Viewer from "https://cdn.skypack.dev/viewerjs@^v1.10.1?dts";

const elApp = document.querySelector("#app");
/** @type {import('viewerjs'.default)} */
const gallery = new Viewer(elApp, {
  className: "viewerjs",
  title: (image, imageData) => {
    return `${image.alt} (${
      image.src.startsWith("data:image/svg")
        ? "scalable"
        : `${image.alt} (${imageData.naturalWidth} × ${imageData.naturalHeight})`
    })`;
  },
  viewed({ detail: { image } }) {
    /** @type {HTMLImageElement} */
    const img = image;
    const p = window.innerWidth * 0.8 / img.clientWidth;

    gallery.zoomTo(
      img.src.startsWith("data:image/svg")
        ? p
        : img.clientWidth * 5 > window.innerWidth - 50
        ? p
        : 5,
    );
  },
});

const transparentIm = new URL("/1px.png", location.origin).href;

async function doLookup() {
  await eel.py_images()().then((r) => {
    const images = /** @type {string[]} */ (r);

    images.map((im) => {
      const elIm = document.createElement("img");

      elIm.loading = "lazy";
      elIm.style.opacity = 0;
      elIm.alt = im;
      elIm.title = im;

      elApp.append(elIm);

      new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !elIm.src) {
          elIm.src = transparentIm;
          eel.py_image(im)().then((data) => {
            elIm.src = data;
            elIm.style.opacity = 1;
            elIm.onload = () => {
              gallery.update();
            };
          });
        }
      }, {
        threshold: 0.8,
      }).observe(elIm);
    });
  });
}

doLookup().then(() => {
  setTimeout(() => {
    gallery.show();

    const loop = () => doLookup().then(() => setTimeout(() => loop(), 1000));
    loop();
  }, 1000);
});
