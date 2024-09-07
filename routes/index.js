var express = require('express');
var router = express.Router();
const userModel = require('./users.js')
const postModel = require('./posts.js');
const passport = require('passport');
const upload = require('./multer.js');

const localStrategy = require('passport-local')
passport.use(new localStrategy(userModel.authenticate()))

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});

router.get('/login', function (req, res, next) {
  res.render('login', { error: req.flash('error') });
});

router.get('/feed', async (req, res, next) => {
  let post = await postModel.find()
  res.render('feed', { post })
})


router.get('/profile', isLoggedin, async function (req, res, next) {
  let user = await userModel.findOne({
    username: req.user.username
  }).populate('posts')
  console.log(user)
  res.render("profile", { user })
});

router.post('/register', (req, res) => {
  const userData = new userModel({
    username: req.body.username,
    email: req.body.email,
    fullname: req.body.fullname
  })

  userModel.register(userData, req.body.password)
    .then(function () {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/profile')
      });
    });

});

router.post('/login', passport.authenticate('local', {
  successRedirect: "/profile",
  failureRedirect: "/login",
  failureFlash: true
}), function (req, res) { })


router.get('/logout', (req, res) => {
  req.logOut(function (err) {
    if (err) return err;
    res.redirect('/')
  })
})

function isLoggedin(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login')
}


router.post('/upload', isLoggedin, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No files were uploded.')
  }
  const user = await userModel.findOne({ username: req.session.passport.user });
  const post = await postModel.create({
    image: req.file.filename,
    imagetext: req.body.filecaption,
    user: user._id
  })

  user.posts.push(post._id)
  await user.save();
  res.redirect('/profile')
})


router.get('/postdisplay/:id',async (req, res) => {
  let id = req.params.id ;
  let post = await postModel.findOne({ _id: id })
  let user = await userModel.findOne({ _id: post.user })
  console.log(post);
  console.log(user);
  
  res.render('postdisplay', { user, post })
})

module.exports = router;
