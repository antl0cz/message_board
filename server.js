/**
 * Created by Ant on 10/10/16.
 */
// dependencies
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var mongoose = require('mongoose');

// store express app into "app" variable
var app = express();

// use "bodyParser" variable to parse the form data sent via HTTP POST
app.use(bodyParser.urlencoded({extended: true}));

// set static folder directory
app.use(express.static(path.join(__dirname, './static')));

// server to locate views and know what template engine is being used
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.listen(8000, function () {
    console.log("what's up");
})

// route to index
app.get('/', function (req, res) {
    Message.find({}, false, true).populate('_comments').exec(function (err, messages) {
        res.render('index.ejs', {messages: messages});
    })
})

// route to POST a new "message"
app.post('/message', function (req, res) {
    var newMessage = new Message({ name: req.body.name, message: req.body.message});
    newMessage.save(function (err) {
        if(err){
            console.log(err);
            res.render('index.ejs', {errors: newMessage.errors});
        }
        else{
            console.log('made it!');
            res.redirect('/');
        }
    })
})

// route to POST a new "comment" to a message
app.post('/comment/:id', function (req, res) {
    var message_id = req.params.id;
    Message.findOne({_id: message_id}, function (err, message) {
        var newComment = new Comment({name: req.body.name, comment: req.body.comment});
        newComment._message = message._id;
        Message.update({_id: message._id}, {$push: {"_comments": newComment}}, function (err) {

        });

        newComment.save(function (err) {
            if(err){
                console.log(err);
                res.render('index.ejs', {errors: newComment.errors});
            }
            else{
                console.log('comment went through');
                res.redirect('/');
            }
        })
    })
})

// create connection to database
mongoose.connect('mongodb://localhost/msg_db');

// establish a "Schema" variable. this will be called inside all of the models that require associations to enable
// the model to read and understand the ObjectId attributes MongoDB automatically generates
var Schema = mongoose.Schema;

// create "MessageSchema" and attach it as a model to database
var MessageSchema = mongoose.Schema({
    name: String,
    message: String,
    // use the "_" (underscore) in in front of comment to reference a model that another model belongs to
    _comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
});

// validation to require name and message
MessageSchema.path('name').required(true, 'Enter a name!');
MessageSchema.path('message').required(true, 'Enter a message!');

// setting schema in model as Message
mongoose.model("Message", MessageSchema);

// retrieving schema from model, named Message
var Message = mongoose.model('Message');

// create "CommentSchema" and attach it as a model to database
var CommentSchema = new mongoose.Schema({
    name: String,
    comment: String,
    // use the "_" (underscore) in in front of message to reference a model that another model belongs to
    _message: {type: Schema.Types.ObjectId, ref: 'Message'}
});

// validation to require name and message for comment of the "message"
CommentSchema.path('name').required(true, 'Need a name for the comment ');
CommentSchema.path('comment').required(true, 'Need a comment on the message');

// setting schema in model as Comment
mongoose.model('Comment', CommentSchema);

// retrieving schema from model, named Comment
var Comment = mongoose.model('Comment');