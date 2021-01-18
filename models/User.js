var mongoose = require('mongoose');
//Loads in mongoose library as an exports object

//The actual schema

var UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    bio: String,
    image: String,
    hash: String, // Final result which we get when we pass password and salt into the hash function
    salt: String // Random data which is added to input of hash function to guarentee a unique output
}, {timestamps: true}); //timestamps keeps a track of times when our model changes or is created.

mongoose.model('User',UserSchema);  //This registers our schema with mongoose. It can now be accessed
                                    //anywhere in our app by calling mongoose.model('User').


//The validations(checks that are run before our model is saved to ensure that we dont commit
//any dirty data to our database.)                                    