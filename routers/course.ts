import * as Express from 'express'
import {Learn2018Helper} from '../lib/learn-lib'
import {CourseModel, ICourse} from "../db/course";
import {Schema} from "mongoose";
import {promisify} from 'util'

export const CourseRouter = Express.Router()

CourseRouter
  .post<null, any, { username: string, password: string }, null>
  ('/login', async (req, res, next) => {
    try {
      //login
      const {username, password} = req.body
        , helper = new Learn2018Helper({provider: () => ({username, password})})
        , semesters = await helper.getSemesterIdList()
        , courses = await Promise.all(
        semesters
          .map(async s => await helper.getCourseList(s)
            .then(v => (v as ICourse[]).map(c => (c.semester = s, c)).filter(c => c.timeAndLocation.length))))
        .then(r => r.flat())
      await CourseModel.createIndexes()
      try {
        await CourseModel.insertMany(courses, {ordered: false, rawResult: true})
      } catch (e) {
        if (e.name !== 'BulkWriteError') throw (e)
      }

      req.session.username = username
      req.session.semester = (await helper.getCurrentSemester()).id
      res.json({username, semester: req.session.semester})
    } catch (e) {
      if (e.reason === 'bad credential')
        return res.sendStatus(403)
      console.log(e)
      return res.sendStatus(500)
    }
  })
  .all('*', (req, res, next) => {
    if (!req.session.username)
      return res.sendStatus(401)
    next()
  })
  .get<any>
  ('/courses', async (req, res, next) => {
    let stats = await CourseModel.aggregate([
      {
        $facet: {
          semesters: [{$group: {_id: '$semester', count: {$sum: 1}}}],
          count: [{$count: 'count'}]
        }
      },
    ]) as any
    let [{count: [{count}], semesters}] = stats
    res.json({count, semesters, current: req.session.semester})
  })
  .get<null, ICourse[], null, {
    name?: string
    teacherName?: string
    courseNumber?: string
    courseIndex?: string
    semester?: string
  }>
  ('/search', async (req, res, next) => {
    let {name, courseIndex, courseNumber, semester, teacherName} = req.query
    try {
      const op = {
        name: name ? {$regex: name} : undefined,
        courseIndex: courseIndex ? ~~courseIndex : undefined,
        courseNumber: courseNumber ? courseNumber : undefined,
        semester: semester ? {$regex: semester} : undefined,
        teacherName: teacherName ? {$regex: teacherName} : undefined
      }
      for (const opKey in op)
        if (op[opKey] === undefined)
          delete op[opKey]
      const docs = await CourseModel.find(op).select('-_id -__v')
        .limit(50)
      res.json(docs)
    } catch (e) {
      res.sendStatus(500)
    }
  })
  .get('/logout', async (req, res, next) => {
    req.session.destroy(
      err => err ? res.sendStatus(500) : res.sendStatus(204)
    )

  })
