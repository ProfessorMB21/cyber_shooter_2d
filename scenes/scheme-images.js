// The pictures of the input schemes.
//
// They are SVG files in assets/input-schemes, loaded once and kept. A
// picture that has not arrived yet is drawn as the name of the scheme,
// so the screen is never blank and never throws.

const pictures = new Map();

// The picture for a scheme, or a stand-in for it.
function schemePicture(name) {
  if (pictures.has(name)) return pictures.get(name);
  const picture = { image: null, ready: false };
  pictures.set(name, picture);
  if (typeof document === 'undefined') return picture;
  try {
    const element = document.createElement('img');
    element.onload = () => { picture.ready = true; };
    element.onerror = () => { picture.ready = false; };
    element.src = `assets/input-schemes/${name}.svg`;
    picture.image = element;
  } catch (e) {
    // No DOM to load it into - the name is drawn instead of the picture.
  }
  return picture;
}

export { schemePicture };
