const home = require('./home');
const dogsCatalog = require('./dogs-catalog');
const todo = require('./todo');
const about = require('./about');
const aboutshort = require('./aboutshort');
const gallery = require('./gallery');
const greetings = require('./greetings');
const ChartComponent = require('./ChartComponent');


module.exports = home.concat(
    dogsCatalog, 
    todo, 
    about, 
    aboutshort,
    gallery,
    ChartComponent,
    greetings
);