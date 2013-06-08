var express = require('express')
  , stylus = require('stylus')
  , nib = require('nib');

// Adding NIB local routine
var app = express();

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
}

// Set the views folder
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'));

app.use(
  stylus.middleware({ 
    src: __dirname + '/public', 
    compile: compile
    }
  )
);

app.get('/', function (req, res) {
  res.render('index',
    { title : 'Home' }
    )
});

app.use(express.static(__dirname + '/public'));
app.use('/static', express.static(__dirname + '/static'));

app.listen(3000);
console.log('Listening on port 3000');

