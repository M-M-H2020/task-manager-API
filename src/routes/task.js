const Task = require('../models/task')
const auth = require('../middleware/auth')
const express = require('express')
const router = new express.Router()

router.post('/tasks', auth,async (req, res) => {
    
    try {
        const task = new Task({
            ...req.body,
            owner:req.user._id
        });
        await task.save();
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send()
    }
})

router.get('/tasks', auth,async (req, res) => {
    const match  = {}
    const sort = {}
    if(req.query.isDone){
        match.isDone = req.query.isDone === 'true' 
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1].toLowerCase() === 'desc' ? -1:1
    }
    try {
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.tasks)
    } catch (error) {
        res.status(500).send({error})
    }
})

router.get('/tasks/:id', auth,async (req, res) => {
    try {
        const task = await Task.findOne({_id:req.params.id,owner:req.user._id})
        if (!task) {
            return res.status(404).send('Task not found!')
        }
        res.send(task)
    } catch (error) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth,async (req,res) => {
    const updates = ['description', 'isDone']
    const requestedUpdates = Object.keys(req.body)
    const isValidUpdate = requestedUpdates.every((update) => updates.includes(update))
    if (!isValidUpdate) {
        return res.status(400).send({ error: 'Invalid update' })
    }
    try {
        const task = await Task.findOne({_id:req.params.id,owner:req.user._id})
        if (!task) {
            return res.status(404).send('task not found!')
        }
        requestedUpdates.forEach((update) => (task[update] = req.body[update]));
        await task.save();
        res.send(task)
    } catch (error) {
        res.status(400).send()
    }
})

router.delete('/tasks/:id', auth,async (req,res) => {
    try {
        const task = await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id})
        if(!task){
            return res.status(404).send('task not found!')
        }
        res.send(task)
    } catch (error) {
        res.status(500).send()
    }
})
module.exports = router