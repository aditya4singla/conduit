var mongoose = require('mongoose'); //Loads in mongoose library as an exports object
var uniqueValidator = require('mongoose-unique-validator'); //Loads plugin which allows us to make sure username and email are unique
var crypto = require('crypto'); //Loading in crypto library 
var jwt = require('jsonwebtoken');
var secret = require('../config').secret; 
/*  This secret is needed to sign and validate JWT's. It should be a random string that is remembered
by your application, it's essentially the password to the JWT.  */

// 1. The Schema

var UserSchema = new mongoose.Schema({
    //username: String,
    username: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], 
                match: [/^[a-zA-Z0-9]+$/, 'is invalid'], index: true},
    //email: String,
    email: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], 
                match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
    bio: String,
    image: String,
    hash: String, // Final result which we get when we pass password and salt into the hash function
    salt: String // Random data which is added to input of hash function to guarentee a unique output
}, {timestamps: true}); //timestamps keeps a track of times when our model changes or is created.


// Apply the uniqueValidator plugin to userSchema.
UserSchema.plugin(uniqueValidator, {message: 'is already taken.'}); 

// 2. Methods on Schema

// Setting user passwords
UserSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 512, 'sha512').toString('hex');
};

// Check if password correct
UserSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password,this.salt, 512, 'sha512').toString('hex');
    return this.hash == hash;
};

// Generate JWT
UserSchema.methods.generateJWT = function(){
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign({
        id: this._id,
        username: this.username,
        exp: parseInt(exp.getTime() / 1000),
    }, secret);
};

// Get JSON representation of a user for authentication
UserSchema.methods.toAuthJSON = function(){
    return {
        username: this.username,
        email: this.email,
        token: this.generateJWT(),
        bio: this.bio,
        image: this.image
    };
};




mongoose.model('User',UserSchema);  //This registers our schema with mongoose. It can now be accessed
                                    //anywhere in our app by calling mongoose.model('User').
                                  