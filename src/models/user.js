const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {isEmail} = require('validator')
const Task = require('../models/task')

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	age: {
		type: Number,
		validate(value) {
			if (value <= 10) {
				throw new Error(
					'You are too young to use our product, please consult you parents'
				);
			}
		},
	},
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		validate(email) {
			if (!isEmail(email)) {
				throw new Error('Please provide a valid Email');
			}
		},
	},
	password: {
		type: String,
		required: true,
		trim: true,
		minlength: 7,
		validate(value) {
			if (value.toLowerCase().includes('password')) {
				throw new Error(
					'Please use special symbols, capital/small letters in your password'
				);
			}
		},
	},
	tokens:[{
		token:{
			type:String,
			required:true
		}
	}],
	avatar:{
		type:Buffer
	}
},{
	timestamps:true
});

userSchema.virtual('tasks',{
	ref:'Task',
	localField:'_id',
	foreignField:'owner'
})

userSchema.methods.toJSON = function(){
	const user = this;
	const userObject = user.toObject()

	delete userObject.password
	delete userObject.tokens
	delete userObject.avatar
	return userObject
}
// Generating auth tokens
userSchema.methods.generateAuthToken = async  function(){
	const user = this;
	const token = jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)
	user.tokens = user.tokens.concat({token})
	await user.save()
	return token
}
// Verifying email and password
userSchema.statics.findByCredentials = async (email,password) => {
	const user = await User.findOne({email})
	if(!user){
		throw new Error ('Unable to login')
	}
	const isMatch = await bcrypt.compare(password,user.password)
	if(!isMatch){
		throw new Error('Unable to login');
	}
	return user
}

// Hash the plain text before saving
userSchema.pre('save', async function(next){
	const user = this;
	if (user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 8);
	}
	next()
})
// Delete user tasks when user is remover
userSchema.pre('remove', async function(next){
	const user = this;
	await Task.deleteMany({owner:user._id})
	next()
})

const User = mongoose.model('User', userSchema);

module.exports = User