"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseRouter = void 0;
const Express = require("express");
const learn_lib_1 = require("../lib/learn-lib");
const course_1 = require("../db/course");
exports.CourseRouter = Express.Router();
exports.CourseRouter
    .post('/login', async (req, res, next) => {
    try {
        //login
        const { username, password } = req.body, helper = new learn_lib_1.Learn2018Helper({ provider: () => ({ username, password }) }), semesters = await helper.getSemesterIdList(), courses = await Promise.all(semesters
            .map(async (s) => await helper.getCourseList(s)
            .then(v => v.map(c => (c.semester = s, c)).filter(c => c.timeAndLocation.length))))
            .then(r => r.flat());
        await course_1.CourseModel.createIndexes();
        try {
            await course_1.CourseModel.insertMany(courses, { ordered: false, rawResult: true });
        }
        catch (e) {
            if (e.name !== 'BulkWriteError')
                throw (e);
        }
        req.session.username = username;
        req.session.semester = (await helper.getCurrentSemester()).id;
        res.json({ username, semester: req.session.semester });
    }
    catch (e) {
        if (e.reason === 'bad credential')
            return res.sendStatus(403);
        console.log(e);
        return res.sendStatus(500);
    }
})
    .all('*', (req, res, next) => {
    if (!req.session.username)
        return res.sendStatus(401);
    next();
})
    .get('/courses', async (req, res, next) => {
    let stats = await course_1.CourseModel.aggregate([
        {
            $facet: {
                semesters: [{ $group: { _id: '$semester', count: { $sum: 1 } } }],
                count: [{ $count: 'count' }]
            }
        },
    ]);
    let [{ count: [{ count }], semesters }] = stats;
    res.json({ count, semesters, current: req.session.semester });
})
    .get('/search', async (req, res, next) => {
    let { name, courseIndex, courseNumber, semester, teacherName } = req.query;
    try {
        const op = {
            name: name ? { $regex: name } : undefined,
            courseIndex: courseIndex ? ~~courseIndex : undefined,
            courseNumber: courseNumber ? courseNumber : undefined,
            semester: semester ? { $regex: semester } : undefined,
            teacherName: teacherName ? { $regex: teacherName } : undefined
        };
        for (const opKey in op)
            if (op[opKey] === undefined)
                delete op[opKey];
        const docs = await course_1.CourseModel.find(op).select('-_id -__v')
            .limit(50);
        res.json(docs);
    }
    catch (e) {
        res.sendStatus(500);
    }
})
    .get('/logout', async (req, res, next) => {
    req.session.destroy(err => err ? res.sendStatus(500) : res.sendStatus(204));
});
//# sourceMappingURL=course.js.map