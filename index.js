const fs = require('fs');
const {promisify} = require('util');
const glob = require('glob');
const svg2ttf = require('svg2ttf');
const SVGIcons2SVGFontStream = require('svgicons2svgfont');
const css = require('node-css');
const randomUnicode = require('random-unicodes');

const fontName = 'neytiri';
const svgFontFile = 'fonts/neytiri.svg';
const ttfFontFile = 'fonts/neytiri.ttf';
const iconsPath = 'icons';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const fontStream = new SVGIcons2SVGFontStream({fontName});

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
    const hexCodes = generateHexCodes(files.length);
    return files.map((file, idx) => {
      const glyph = fs.createReadStream(file);
      const name = getGlyphName(file);
      glyph.metadata = {
        unicode: [JSON.parse('"' + hexCodes[idx] + '"')],
        name
      };
      return {glyph, name, code: hexCodes[idx]};
    });
  });
};

const generateHexCodes = (nbCodes, acc = []) => {
  if(nbCodes === 0){
    return acc;
  }
  const hexCode = randomUnicode({ max: '\\uFFFF' });
  if(acc.includes(hexCode)){
    return generateHexCodes(nbCodes, acc)
  }
  return generateHexCodes(nbCodes - 1, acc.concat(hexCode))
};


const getGlyphName = (fileName) => {
  return /\/(.*)\.svg$/.exec(fileName)[1]
};

const generateFontFile = (fileIn, fileOut) => {
  return readFile(fileIn, 'utf8').then(fontSVG => writeFile(fileOut, new Buffer(svg2ttf(fontSVG, {}).buffer)))
};

const generateCSSWithClasses = (glyphsNameAndCode) => {
  let cssClasses = css('@font-face', {
    'font-family': `'${fontName}'`,
    src: `url('${ttfFontFile}') format('truetype'), url('${svgFontFile}') format('svg')`,
    'font-weight': 'normal',
    'font-style': 'normal'
  });
  cssClasses += css(`[class^="${fontName}-"], [class*="${fontName}-"]`, { 'font-family': `${fontName} !important` });
  cssClasses += glyphsNameAndCode.map(({ name, code }) => {
    return css(`.${fontName}-${name}:before`, { content: `'\\${code.replace('\\u', '')}'` })
  }).join('\n');
  return cssClasses;
};


(function () {
  createGlyph()
    .then((glyphs) => {
      glyphs.forEach(glyph => fontStream.write(glyph.glyph))
      fontStream.end();
      return glyphs.map(glyph => ({ name: glyph.name, code: glyph.code }));
    })
    .then((glyphsNameAndCode) => generateCSSWithClasses(glyphsNameAndCode))
    .then((css) => writeFile('style.css', css))
    .catch(err => console.log(err))
})();