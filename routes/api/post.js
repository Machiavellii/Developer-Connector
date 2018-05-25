const express = require('express');
const router = express.Router();


//@route GET api/post/test
//@desc TEST POST ROUTE
//@access Public

router.get('/test', (req, res) => res.json({msg: 'Posts Works'}));

module.exports = router;