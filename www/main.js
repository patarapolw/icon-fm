/// <reference lib="dom" />

import Viewer from "https://cdn.skypack.dev/viewerjs@^v1.10.1?dts";

const elApp = document.querySelector("#app");
const gallery = new Viewer(elApp);

fetch("/api/init").then((r) => r.json()).then((r) => {
  const images = /** @type {string[]} */ (r.images);

  images.map((im) => {
    const elIm = document.createElement("img");
    const u = new URL("/img", location.origin);
    u.searchParams.set("file", im);

    elIm.src = u.href;
    elIm.alt = im;
    elIm.loading = "lazy";
    elIm.onerror = () => {
      elIm.remove();
      gallery.update();
    };

    elApp.append(elIm);
  });

  gallery.update();
  gallery.view();
});
