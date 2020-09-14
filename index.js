"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const course_1 = require("./routers/course");
const config_1 = require("./config"); // new
const app = Express();
app.use(session({
    secret: config_1.default.session.secret,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 90 * 24 * 60 * 60 * 1000, sameSite: "strict" }
}));
app.use(Express.json());
app.use('/api', course_1.CourseRouter);
app.use(Express.static('dist'));
// Connect to MongoDB database
mongoose.connect(config_1.default.mongo.url, {
    useNewUrlParser: true, useUnifiedTopology: true,
    user: config_1.default.mongo.url, pass: config_1.default.mongo.pass
})
    .then(() => {
    app.listen(config_1.default.port, () => {
        console.log("Server has started!");
    });
});
//# sourceMappingURL=index.js.map