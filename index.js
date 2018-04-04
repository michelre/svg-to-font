const fs = require('fs');
const {promisify} = require('util');
const glob = require('glob');
const svg2ttf = require('svg2ttf');
const SVGIcons2SVGFontStream = require('svgicons2svgfont');

const fontStream = new SVGIcons2SVGFontStream({
  fontName: 'neytiri'
});
const svgFontFile = 'fonts/neytiri.svg';
const ttfFontFile = 'fonts/neytiri.ttf';
const iconsPath = 'icons';

// Setting the font destination
fontStream.pipe(fs.createWriteStream(svgFontFile))
  .on('finish', function () {
    generateFontFile(svgFontFile, ttfFontFile).then(d => console.log('OK'));
  })
  .on('error', function (err) {

  });

const createGlyph = () => {
  const pGlob = promisify(glob);
  return pGlob(`${iconsPath}/*.svg`, {}).then(files => {
    return files.map(file => {
      const glyph = fs.createReadStream(file);
      glyph.metadata = {
        unicode: ['\uE001'],
        name: getGlyphName(file)
      };
      return glyph;
    });
  });
};


const getGlyphName = (fileName) => {
  return /\/(.*)\.svg$/.exec(fileName)[1]
};

const generateFontFile = (fileIn, fileOut) => {
  const writeFile = promisify(fs.writeFile);
  const readFile = promisify(fs.readFile);
  return readFile(fileIn, 'utf8')
    .then(fontSVG => writeFile(fileOut, new Buffer(svg2ttf(fontSVG, {}).buffer)))
};


(function () {
  createGlyph()
    .then(streams => streams.forEach(stream => fontStream.write(stream)))
    .then(() => fontStream.end())
    .catch(err => console.log(err))
})();