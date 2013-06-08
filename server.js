var express = require('express')
  , stylus = require('stylus')
  , im = require('imagemagick')
  , mkpath = require('mkpath')
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
app.use(express.bodyParser({ keepExtensions: true, uploadDir: "uploads" })); 

app.get('/', function (req, res) {
  res.render('index',
    { title : 'Home' }
    )
});

app.post('/grab', function (req, res) {
  // connect-form adds the req.form object
  // we can (optionally) define onComplete, passing
  // the exception (if any) fields parsed, and files parsed
  im.identify(['-format', '%n', req.files.file.path], function(err, pages){
    if (err) throw err;
    
    var iter = 0;
    var currTime = new Date().getTime() + '';
    var outFolder = __dirname + '/static/images/slides/' + currTime;
    
    mkpath( outFolder, function (err) {
      if (err) throw err;
      console.log('Directory structure red/green/violet created');
    });
    
    var seriesConvert = function(iteration) {
      
      im.convert(['-density', 288, req.files.file.path +'[' + iteration + ']', 
                  '-resize', '25%', outFolder + '/slide-' + iteration + '.jpg'], 
       function(err, stdout){
         if (err) throw err;
         if (iter == 0) res.end("upload complete");
         iter++;
         if (iter < pages) seriesConvert(iter);
       });
    }
    
    seriesConvert(iter);
  });
});


app.use(express.static(__dirname + '/public'));
app.use('/static', express.static(__dirname + '/static'));

app.listen(3000);
console.log('Listening on port 3000');

