var express = require("express");
var router = express.Router();

const User = require("../model/userSchema");
const LocalStrategy = require("passport-local");
const passport = require("passport");
passport.use(new LocalStrategy(User.authenticate()));

router.get("/", function (req, res, next) {
    res.render("register");
});

router.post("/register", function (req, res, next) {
    const { name, email, username, password, phone } = req.body;
    const newUser = new User({
        name,
        email,
        username,
        phone,
    });

    User.register(newUser, password)
        .then(() => res.redirect("/login"))
        .catch((err) => res.send(err));
});


router.get("/login", function (req, res, next) {
    res.render("login");
});

router.post("/login",passport.authenticate("local", {
        successRedirect: "/profile",
        failureRedirect: "/login",
    }),
    function (req, res, next) {}
);


router.get("/forget", function (req, res, next) {
    res.render("forget");
});

router.post("/forget", function (req, res, next) {
    User.findOne({ username: req.body.username })
        .then((userFound) => {
            if (userFound === null)
                return res.send("not found <a href='/'>home</a>");

            userFound.setPassword(req.body.password, function (err, user) {
                userFound.save();   
                res.redirect("/login");
            });
        })
        .catch((err) => res.send(err));
});


router.get("/profile", isLoggedIn, function (req, res, next) {
    res.render("profile", { user: req.session.passport.user });
});

router.post("/reset", isLoggedIn, function (req, res, next) {
    const { oldpassword, password } = req.body;
    req.user.changePassword(oldpassword, password, function (err, user) {
        if (err) {
            res.send(err);
        }
        res.redirect("/logout");
    });
});

router.get("/logout", isLoggedIn, function (req, res, next) {
    req.logout(function () {
        res.redirect("/login");
    });
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
       
    }
    res.redirect("/");
}

module.exports = router;
