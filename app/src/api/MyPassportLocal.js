const bCrypt = require('bcrypt');
// const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/users');
const log =require('../logger')

passport.use('signup', new LocalStrategy({
    passReqToCallback: true
},
    (req, username, password, done) => {

            
        User.findOne({ 'username': username }, function (err, user) {

            if (err) {
                log.warn('Error in SignUp: ' + err);
                return done(err);
            }

            if (user) {
                log.warn('User already exists');
                return done(null, false)
            }

            const newUser = {
                username: username,
                password: createHash(password),
                email: req.body.email,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
            }

            User.create(newUser, (err, userWithId) => {
                if (err) {
                    log.warn('Error in Saving user: ' + err);
                    return done(err);
                }
                log.info(user)
                log.info('User Registration succesful');
                return done(null, userWithId);
            });
        });
    })
)

passport.use('login', new LocalStrategy(
    (username, password, done) => {
        User.findOne({ username }, (err, user) => {
            if (err)
                return done(err);

            if (!user) {
                log.warn(`User Not Found with username ${user}`);
                return done(null, false);
            }

            if (!isValidPassword(user, password)) {
                log.warn(`Username ${user} Invalid Password`);
                return done(null, false);
            }

            return done(null, user);
        });
    })
);

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, done);
});

function isValidPassword(user, password) {
    return bCrypt.compareSync(password, user.password);
}

function createHash(password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

exports.passport = passport;