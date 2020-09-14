import * as Express from 'express'
import * as mongoose from "mongoose";
import * as session from 'express-session'
import {CourseRouter} from "./routers/course";
import config from "./config"; // new

const app = Express()
app.use(session({
  secret: config.session.secret,
  resave: true,
  saveUninitialized: true,
  cookie: {maxAge: 90 * 24 * 60 * 60 * 1000, sameSite: "strict"}
}))
app.use(Express.json())
app.use('/api', CourseRouter)
app.use(Express.static('dist'));
// Connect to MongoDB database
mongoose.connect(config.mongo.url,
  {
    useNewUrlParser: true, useUnifiedTopology: true,
    user: config.mongo.url, pass: config.mongo.pass
  })
  .then(() => {
    app.listen(config.port, () => {
      console.log("Server has started!")
    })
  });
