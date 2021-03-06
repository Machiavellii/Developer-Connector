const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//Load Validation
const validateProfilInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

//Load Profile Moduls
const Profile = require('../../modules/Profile');

//Load User Profile
const User = require('../../modules/User');



//@route GET api/profile/test
//@desc TEST PROFILE ROUTE
//@access Public 
router.get('/test', (req, res) => res.json({ msg: 'Profile Works'}));


//@route GET api/profile
//@desc GET CURRENT USERS PROFILE
//@access PRIVATE
router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
    .populate('user', ['name','avatar'])
        .then(profile => {
            if(!profile){
                errors.noprofile = 'There is not profile for this user';
                return res.status(404).json(errors)
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
        
});

//@route GET api/profile/users/:user_id
//@desc GET PROFILE BY USER ID
//@access PUBLIC

router.get('/user/:user_id', (req, res) =>{

    const errors = {};

    Profile.findOne({user: req.params.user_id})
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if(!profile){
                errors.noprofile = 'There is no profile for this user';
                res.status(404).json(errors)
            }

            res.json(profile)
        })
        .catch(err => res.status(404).json({profile: 'There is no profile for this user'}))
});

//@route GET api/profile/all
//@desc GET ALL PROFILES 
//@access PUBLIC
router.get('/all', (req, res) => {
    Profile.find()
    .populate('user', ['name', 'avatar'])
    .then(profiles => {
        if(!profiles) {
            errors.noprofile = 'There a no profiles';
            return res.status(404).json(errors);
        }
        res.json(profiles)
    })
    .catch(err => res.status(404).json({profile: 'There a no profiles'}))
})


//@route GET api/profile/handle/:handle
//@desc GET PROFILE BY HANDLE
//@access PUBLIC
router.get('/handle/:handle', (req, res) =>{
    const errors = {};

    Profile.findOne({handle: req.params.handle})
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if(!profile) {
                errors.noprofile = 'There is no profile for this user';
                res.status(404).json(errors)
            }

            res.json(profile)
        })
        .catch(err => res.status(404).json(err))
});


//@route POST api/profile
//@desc CREATE OR EDIT USERS PROFILE
//@access PRIVATE
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
   const {errors, isValid} = validateProfilInput(req.body);

   //Chek Validation
   if(!isValid){
       //Return any errors
       return res.status(400).json(errors)
   }
   
    //Get fields
   const profileFields = {};
   profileFields.user = req.user.id;
   if(req.body.handle) profileFields.handle = req.body.handle;
   if(req.body.company) profileFields.company = req.body.company;
   if(req.body.website) profileFields.website = req.body.website;
   if(req.body.location) profileFields.location = req.body.location;
   if(req.body.bio) profileFields.bio = req.body.bio;
   if(req.body.status) profileFields.status = req.body.status;
   if(req.body.githubusername) profileFields.githubusername = req.body.githubusername;

   //Skills - Split intro in array
   if(typeof req.body.skills !== 'undefined'){
       profileFields.skills = req.body.skills.split(',');
   }

   //Social
   profileFields.social = {};

   if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
   if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
   if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
   if(req.body.instagram) profileFields.social.instagram = req.body.instagram;
   if(req.body.facebook) profileFields.social.facebook = req.body.facebook;

   Profile.findOne({user: req.user.id})
        .then(profile => {
            if(profile){
                //Update
                Profile.findOneAndUpdate({user: req.user.id}, {$set: profileFields}, {new: true})
                    .then(profile => res.json(profile))
            }else{
                //Create

                //Check if handle(profile) exists
                Profile.findOne({ handle: profileFields.handle})
                    .then(profile => {
                        if(profile){
                            errors.handle = "That Handle already exsist";
                            res.status(400).json(errors);
                        }
                    
                        // Save profile
                        new Profile(profileFields).save().then(profile => res.json(profile))
                    });
            }
        })
   
        
});

//@route POST api/profile/experience
//@desc ADD EXPERIENCE TO PROFILE
//@access PRIVATE

router.post('/experience', passport.authenticate('jwt', {session: false}), (req, res) => {
    const {errors, isValid} = validateExperienceInput(req.body);

   //Chek Validation
   if(!isValid){
       //Return any errors
       return res.status(400).json(errors)
   }

    Profile.findOne({user: req.user.id})
    .then(profile => {
        const newExp = {
            title: req.body.title,
            company: req.body.company,
            location: req.body.location,
            from: req.body.from,
            to: req.body.to,
            current: req.body.current,
            description: req.body.description
        }

        //Add to experience to array
        profile.experience.unshift(newExp)
        

        profile.save().then(profile => res.json(profile))
    })
});

//@route POST api/profile/education
//@desc ADD EDUCATION TO PROFILE
//@access PRIVATE

router.post('/education', passport.authenticate('jwt', {session: false}), (req, res) => {
    const {errors, isValid} = validateEducationInput(req.body);

   //Chek Validation
   if(!isValid){
       //Return any errors
       return res.status(400).json(errors)
   }

    Profile.findOne({user: req.user.id})
    .then(profile => {
        const newEdu = {
            school: req.body.school,
            degree: req.body.degree,
            fieldofstudy: req.body.fieldofstudy,
            from: req.body.from,
            to: req.body.to,
            current: req.body.current,
            description: req.body.description
        }

        //Add to education to array
        profile.education.unshift(newEdu)
        

        profile.save().then(profile => res.json(profile))
    })
});


//@route DELETE api/profile/experience/:exp_id
//@desc DELETE EXPERIENCE FROM  PROFILE
//@access PRIVATE

router.delete('/experience/:exp_id', passport.authenticate('jwt', {session: false}), (req, res) => {
    
    Profile.findOne({user: req.user.id})
    .then(profile => {
        //Get remove index
        const removeIndex = profile.experience
            .map(item => item.id)
            .indexOf(req.params.exp_id)

        //Split out of array
        profile.experience.splice(removeIndex, 1);

        //Save
        profile.save().then(profile => res.json(profile))
    })
    .catch(err => res.status(404).json(err))
});

//@route DELETE api/profile/education/:edu_id
//@desc DELETE EDUCATION FROM  PROFILE
//@access PRIVATE

router.delete('/education/:edu_id', passport.authenticate('jwt', {session: false}), (req, res) => {
    
    Profile.findOne({user: req.user.id})
    .then(profile => {
        //Get remove index
        const removeIndex = profile.education
            .map(item => item.id)
            .indexOf(req.params.edu_id)

        //Split out of array
        profile.education.splice(removeIndex, 1);

        //Save
        profile.save().then(profile => res.json(profile))
    })
    .catch(err => res.status(404).json(err))
});


//@route DELETE api/profile
//@desc DELETE USER FROM  PROFILE
//@access PRIVATE
router.delete('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    
    Profile.findOneAndRemove({user: req.user.id})
        .then(() => {
            User.findOneAndRemove({_id: req.user.id}).then(()=>{
                res.json({success: true})
            })
        })
});

module.exports = router;