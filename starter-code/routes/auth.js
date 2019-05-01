const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");

router.get("/signup", (req, res, next) => {
  res.render("signup");
});

router.get("/login", (req, res, next) => {
  res.render("login");
});

const bcryptSalt = 10;

//Signup Logic
router.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const salt = bcrypt.genSaltSync(bcryptSalt);
  const hashPass = bcrypt.hashSync(password, salt);

  if (username === "" || password === "") {
    res.render("signup", {
      errorMessage: "Indicate a username and a password to sign up"
    });
    return;
  }

  User.findOne({ username: username })
    .then(user => {
      if (user !== null) {
        res.render("signup", {
          errorMessage: "The username already exists!"
        });
        return;
      }

      User.create({
        username,
        password: hashPass
      })
        .then(() => {
          res.redirect("/");
        })
        .catch(error => {
          console.log(error);
        });
    })
    .catch(error => {
      next(error);
    });
});

// Login Logic
router.post("/login", (req, res, next) => {
  const theUsername = req.body.username;
  const thePassword = req.body.password;

  if (theUsername === "" || thePassword === "") {
    res.render("login", {
      errorMessage: "Please enter both the username and password to sign up"
    });
    return;
  }

  User.findOne({ username : theUsername })
    .then(user => {
      if (!user) {
        res.render("login", {
          errorMessage: "The username doesn't exist."
        });
        return;
      }
      if (bcrypt.compareSync(thePassword, user.password)) {
        // Save the login in the session!
        
        req.session.currentUser = user;
        console.log(req.session.currentUser)
        res.redirect("/");
      } else {
        res.render("login", {
          errorMessage: "Incorrect password"
        });
      }
    })
    .catch(error => {
      next(error);
    })
});

// //Hidden Page Logic
// router.use((req, res, next) => {
//   if (req.session.currentUser) {
//     next();
//   } else {
//     res.redirect("login");
//   }
// });



router.get("/main", (req, res, next) => {
  res.render("main");
});

router.get("/private", isLoggedIn, (req, res, next) => {
  console.log(req.session, "hdjksbvckhjbewkhvbwekjrhbjvwev")
  res.render("private");
});


function isLoggedIn(req, res, next){
  if(req.session.currentUser){
    next()
  } else {
    res.redirect("login")
  }
}
module.exports = router;
