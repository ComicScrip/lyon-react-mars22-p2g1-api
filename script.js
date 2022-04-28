const coords = require('./coords.json');

for (let i = 0; i < coords.length; i++) {
  console.log(
    `("${coords[i].adresse}", "${coords[i].CP}", "${coords[i].lat}", "${coords[
      i
    ].long.replace(' ', '')}", "${coords[i].ville}")`
  );
}
