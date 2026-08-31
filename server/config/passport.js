const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientID || !clientSecret) {
  console.warn("WARNING: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not defined in environment variables. Google Authentication will be disabled.");
} else {
  passport.use(
    new GoogleStrategy(
      {
        clientID: clientID,
        clientSecret: clientSecret,
        callbackURL: '/api/v1/auth/google/callback',
        proxy: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          if (!email) {
            return done(new Error("Email not provided by Google"), null);
          }

          // 1. Check if user already exists with this Google profile ID (uid)
          let user = await User.findOne({ uid: profile.id });
          if (user) {
            // Update profile image and name if changed
            if (profile.photos && profile.photos[0] && profile.photos[0].value) {
              user.image = { url: profile.photos[0].value, public_id: null };
            }
            const nameParts = profile.displayName ? profile.displayName.split(" ") : ["Google", "User"];
            user.firstName = nameParts[0] || "Google";
            user.lastName = nameParts.slice(1).join(" ") || "User";
            await user.save();
            return done(null, user);
          }

          // 2. Check if user exists with this email (linked account scenario)
          user = await User.findOne({ email });
          if (user) {
            user.uid = profile.id; // Link accounts
            if (profile.photos && profile.photos[0] && profile.photos[0].value) {
              user.image = { url: profile.photos[0].value, public_id: null };
            }
            await user.save();
            return done(null, user);
          }

          // 3. Brand new user creation
          const nameParts = profile.displayName ? profile.displayName.split(" ") : ["Google", "User"];
          const firstName = nameParts[0] || "Google";
          const lastName = nameParts.slice(1).join(" ") || "User";

          user = await User.create({
            uid: profile.id,
            firstName,
            lastName,
            email,
            image: {
              url: (profile.photos && profile.photos[0]) ? profile.photos[0].value : `https://api.dicebear.com/8.x/initials/svg?seed=${firstName} ${lastName}`,
              public_id: null
            }
          });

          // Send welcome email
          const sendEmail = require('../utils/sendEmail');
          try {
            const subject = "Welcome to BoliBazaar!";
            const emailHtml = `<h1>Welcome to BoliBazaar, ${firstName}!</h1><p>Your account has been created successfully using Google Sign-In.</p>`;
            await sendEmail(email, subject, emailHtml);
          } catch (mailError) {
            console.error("Welcome email failed to send:", mailError);
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

module.exports = passport;
