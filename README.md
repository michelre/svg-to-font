# svg-to-font

![https://i.imgur.com/ptWBrTd.png](https://i.imgur.com/ptWBrTd.png)

A simple node script that generates fonts from SVG icons.

## Principle
This script will list all the SVG icons that are placed within the 'icons' directory and creates the corresponding font and the CSS classes
so the icons can be easily reused

## Setup

Use the following commands to run the script:

```
git clone https://github.com/michelre/svg-to-font.git
cd svg-to-font
npm i
node index.js
```

## Use the font and import the icons
The script will create a 'neytiri' font. So you can import the icons by using the related classes according to the following naming convention: `neytiri-${icon-name}`. 
For example, suppose you want to import the `book` icon, you can write something like:

```
<i class="neytiri-book"></i>
```
