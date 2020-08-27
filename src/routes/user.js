const User = require('../models/user')
const auth = require('../middleware/auth')
const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail,sendCancellationEmail } = require('../emails/account');
const error = require('../utils/error')
const router = new express.Router()
// Create users
router.post('/users', async (req, res) => {
    try {
        const user = new User(req.body);
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        await user.save();
        res.status(201).send({user,token})
    } catch (error) {
        res.status(400).send()
    }

},error)

// Login user
router.post('/users/login', async (req,res) => {
    try {
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.send({user,token})
    } catch (error) {
        res.status(400).send()
    }
})
// Logout from one session
router.post('/users/logout',auth, async(req,res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((obj) => obj.token !== req.token)
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})
// Logout all sessions
router.post('/users/logoutAll', auth, async(req,res)=>{
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})
// Upload avatar
const upload = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpeg|jpg|png)/)){
            return cb(new Error(`You can only upload images that end with 'jpg','jpeg' or 'png'`))
        }
        cb(null,true)
    }
})
router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,res) => {
    const buffer = await sharp(req.file.buffer).png().resize({width:250,height:250}).toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
},error)

// Delete avatar
router.delete('/users/me/avatar',auth,async (req,res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
},error)

// Fetch avatar
router.get('/users/me/avatar',auth,async (req,res) => {
    res.set('Content-Type', 'image/png')
    res.send(req.user.avatar)
})
// Read profile
router.get('/users/me', auth,async (req, res) => {
    res.send(req.user)
})

// Update user by id
router.patch('/users/me', auth,async (req,res) => {
    const allowedUpdates  = ['name','password','email','age']
    const updates = Object.keys(req.body)
    const isValidUpdate = updates.every((update) =>
			allowedUpdates.includes(update)
		);
    if(!isValidUpdate){
        return res.status(400).send({error:'Invalid update'})
    }
    try {
        const user = req.user
        updates.forEach((update) => req.user[update] = req.body[update]);
        await req.user.save();
        res.send(req.user)
    } catch (error) {
        res.status(400).send({error})
    }
})
// Delete user by id
router.delete('/users/me', auth,async (req,res) => {
    try {
        sendCancellationEmail(req.user.email,req.user.name)
        await req.user.remove()
        res.send(req.user)
    } catch (error) {
        res.status(500).send()
    }
},error)


module.exports = router