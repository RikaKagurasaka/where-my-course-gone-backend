"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _provider, _rawFetch, _myFetch, _withReAuth;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Learn2018Helper = void 0;
const cheerio = require("cheerio");
const js_base64_1 = require("js-base64");
const cross_fetch_1 = require("cross-fetch");
const URL = require("./urls");
const types_1 = require("./types");
const utils_1 = require("./utils");
const IsomorphicFetch = require('real-isomorphic-fetch');
const tough = require('tough-cookie-no-native');
const CHEERIO_CONFIG = {
    decodeEntities: false,
};
const $ = (html) => {
    return cheerio.load(html, CHEERIO_CONFIG);
};
const noLogin = (url) => url.includes('login_timeout');
/** the main helper class */
class Learn2018Helper {
    /** you can provide a CookieJar and / or CredentialProvider in the configuration */
    constructor(config) {
        var _a;
        _provider.set(this, void 0);
        _rawFetch.set(this, void 0);
        _myFetch.set(this, void 0);
        _withReAuth.set(this, (rawFetch) => {
            const login = this.login.bind(this);
            return async function wrappedFetch(...args) {
                const retryAfterLogin = async () => {
                    await login();
                    return await rawFetch(...args).then((res) => (noLogin(res.url) ? Promise.reject(types_1.FailReason.NOT_LOGGED_IN) : res));
                };
                return await rawFetch(...args).then((res) => (noLogin(res.url) ? retryAfterLogin() : res));
            };
        });
        this.cookieJar = (_a = config === null || config === void 0 ? void 0 : config.cookieJar) !== null && _a !== void 0 ? _a : new tough.CookieJar();
        __classPrivateFieldSet(this, _provider, config === null || config === void 0 ? void 0 : config.provider);
        __classPrivateFieldSet(this, _rawFetch, new IsomorphicFetch(cross_fetch_1.default, this.cookieJar));
        __classPrivateFieldSet(this, _myFetch, __classPrivateFieldGet(this, _provider) ? __classPrivateFieldGet(this, _withReAuth).call(this, __classPrivateFieldGet(this, _rawFetch))
            : async (...args) => {
                const result = await __classPrivateFieldGet(this, _rawFetch).call(this, ...args);
                if (noLogin(result.url))
                    return Promise.reject({
                        reason: types_1.FailReason.NOT_LOGGED_IN
                    });
                return result;
            });
    }
    /** login is necessary if you do not provide a `CredentialProvider` */
    async login(username, password) {
        if (!username || !password) {
            if (!__classPrivateFieldGet(this, _provider))
                return Promise.reject({
                    reason: types_1.FailReason.NO_CREDENTIAL
                });
            const credential = await __classPrivateFieldGet(this, _provider).call(this);
            username = credential.username;
            password = credential.password;
        }
        const ticketResponse = await __classPrivateFieldGet(this, _rawFetch).call(this, URL.ID_LOGIN(), {
            body: URL.ID_LOGIN_FORM_DATA(username, password),
            method: 'POST',
        });
        if (!ticketResponse.ok) {
            return Promise.reject({
                reason: types_1.FailReason.ERROR_FETCH_FROM_ID
            });
        }
        // check response from id.tsinghua.edu.cn
        const ticketResult = await ticketResponse.text();
        const body = $(ticketResult);
        const targetURL = body('a').attr('href');
        const ticket = targetURL.split('=').slice(-1)[0];
        if (ticket === 'BAD_CREDENTIALS') {
            return Promise.reject({
                reason: types_1.FailReason.BAD_CREDENTIAL
            });
        }
        const loginResponse = await __classPrivateFieldGet(this, _rawFetch).call(this, URL.LEARN_AUTH_ROAM(ticket));
        if (loginResponse.ok !== true) {
            return Promise.reject({
                reason: types_1.FailReason.ERROR_ROAMING
            });
        }
    }
    /**  logout (to make everyone happy) */
    async logout() {
        await __classPrivateFieldGet(this, _rawFetch).call(this, URL.LEARN_LOGOUT(), { method: 'POST' });
    }
    /**
     * Get calendar items during the specified period (in yyyymmdd format).
     * @param startDate start date (inclusive)
     * @param endDate end date (inclusive)
     * If the API returns any error, this function will throw `FailReason.INVALID_RESPONSE`,
     * and we currently observe a limit of no more that 29 days.
     * Otherwise it will return the parsed data (might be empty if the period is too far away from now)
     */
    async getCalendar(startDate, endDate, graduate = false) {
        const ticketResponse = await __classPrivateFieldGet(this, _myFetch).call(this, URL.REGISTRAR_TICKET(), {
            method: 'POST',
            body: URL.REGISTRAR_TICKET_FORM_DATA(),
        });
        let ticket = (await ticketResponse.text());
        ticket = ticket.substring(1, ticket.length - 1);
        await __classPrivateFieldGet(this, _myFetch).call(this, URL.REGISTRAR_AUTH(ticket));
        const response = await __classPrivateFieldGet(this, _myFetch).call(this, URL.REGISTRAR_CALENDAR(startDate, endDate, graduate, utils_1.JSONP_EXTRACTOR_NAME));
        if (!response.ok) {
            return Promise.reject({
                reason: types_1.FailReason.INVALID_RESPONSE
            });
        }
        const result = utils_1.extractJSONPResult(await response.text());
        return result.map((i) => ({
            location: i.dd,
            status: i.fl,
            startTime: i.kssj,
            endTime: i.jssj,
            date: i.nq,
            courseName: i.nr,
        }));
    }
    async getSemesterIdList() {
        const json = await (await __classPrivateFieldGet(this, _myFetch).call(this, URL.LEARN_SEMESTER_LIST())).json();
        if (!Array.isArray(json)) {
            return Promise.reject({
                reason: types_1.FailReason.INVALID_RESPONSE,
                extra: json
            });
        }
        const semesters = json;
        // sometimes web learning returns null, so confusing...
        return semesters.filter((s) => s != null);
    }
    async getCurrentSemester() {
        const json = await (await __classPrivateFieldGet(this, _myFetch).call(this, URL.LEARN_CURRENT_SEMESTER())).json();
        if (json.message != 'success') {
            return Promise.reject({
                reason: types_1.FailReason.INVALID_RESPONSE,
                extra: json
            });
        }
        const result = json.result;
        return {
            id: result.id,
            startDate: new Date(result.kssj),
            endDate: new Date(result.jssj),
            startYear: Number(result.xnxq.slice(0, 4)),
            endYear: Number(result.xnxq.slice(5, 9)),
            type: utils_1.parseSemesterType(Number(result.xnxq.slice(10, 11))),
        };
    }
    /** get all courses in the specified semester */
    async getCourseList(semesterID, courseType = types_1.CourseType.STUDENT) {
        const json = await (await __classPrivateFieldGet(this, _myFetch).call(this, URL.LEARN_COURSE_LIST(semesterID, courseType))).json();
        if (json.message !== 'success' || !Array.isArray(json.resultList)) {
            return Promise.reject({
                reason: types_1.FailReason.INVALID_RESPONSE,
                extra: json
            });
        }
        const result = json.resultList;
        const courses = [];
        await Promise.all(result.map(async (c) => {
            var _a;
            courses.push({
                id: c.wlkcid,
                name: c.kcm,
                englishName: c.ywkcm,
                timeAndLocation: await (await __classPrivateFieldGet(this, _myFetch).call(this, URL.LEARN_COURSE_TIME_LOCATION(c.wlkcid))).json(),
                url: URL.LEARN_COURSE_URL(c.wlkcid, courseType),
                teacherName: (_a = c.jsm) !== null && _a !== void 0 ? _a : '',
                teacherNumber: c.jsh,
                courseNumber: c.kch,
                courseIndex: Number(c.kxh),
                courseType,
            });
        }));
        return courses;
    }
    /**
     * Get certain type of content of all specified courses.
     * It actually wraps around other `getXXX` functions
     */
    async getAllContents(courseIDs, type, courseType = types_1.CourseType.STUDENT) {
        let fetchFunc;
        switch (type) {
            case types_1.ContentType.NOTIFICATION:
                fetchFunc = this.getNotificationList;
                break;
            case types_1.ContentType.FILE:
                fetchFunc = this.getFileList;
                break;
            case types_1.ContentType.HOMEWORK:
                fetchFunc = this.getHomeworkList;
                break;
            case types_1.ContentType.DISCUSSION:
                fetchFunc = this.getDiscussionList;
                break;
            case types_1.ContentType.QUESTION:
                fetchFunc = this.getAnsweredQuestionList;
                break;
        }
        const contents = {};
        await Promise.all(courseIDs.map(async (id) => {
            contents[id] = await fetchFunc.bind(this)(id, courseType);
        }));
        return contents;
    }
    /** Get all notifications （课程公告） of the specified course. */
    async getNotificationList(courseID, courseType = types_1.CourseType.STUDENT) {
        var _a;
        let json = await (await __classPrivateFieldGet(this, _myFetch).call(this, URL.LEARN_NOTIFICATION_LIST(courseID, courseType))).json();
        if (json.result !== 'success') {
            return Promise.reject({
                reason: types_1.FailReason.INVALID_RESPONSE,
                extra: json
            });
        }
        const result = ((_a = json.object.aaData) !== null && _a !== void 0 ? _a : json.object.resultsList);
        const notifications = [];
        await Promise.all(result.map(async (n) => {
            var _a;
            const notification = {
                id: n.ggid,
                content: utils_1.decodeHTML(js_base64_1.Base64.decode((_a = n.ggnr) !== null && _a !== void 0 ? _a : '')),
                title: utils_1.decodeHTML(n.bt),
                url: URL.LEARN_NOTIFICATION_DETAIL(courseID, n.ggid, courseType),
                publisher: n.fbrxm,
                hasRead: n.sfyd === '是',
                markedImportant: Number(n.sfqd) === 1,
                publishTime: new Date(n.fbsjStr),
            };
            let detail = {};
            const attachmentName = courseType === types_1.CourseType.STUDENT ? n.fjmc : n.fjbt;
            if (attachmentName !== null) {
                notification.attachmentName = attachmentName;
                detail = await this.parseNotificationDetail(courseID, notification.id, courseType);
            }
            notifications.push({ ...notification, ...detail });
        }));
        return notifications;
    }
    /** Get all files （课程文件） of the specified course. */
    async getFileList(courseID, courseType = types_1.CourseType.STUDENT) {
        var _a;
        const json = await (await __classPrivateFieldGet(this, _myFetch).call(this, URL.LEARN_FILE_LIST(courseID, courseType))).json();
        if (json.result !== 'success') {
            return Promise.reject({
                reason: types_1.FailReason.INVALID_RESPONSE,
                extra: json
            });
        }
        let result;
        if ((_a = json.object) === null || _a === void 0 ? void 0 : _a.resultsList) {
            // teacher
            result = json.object.resultsList;
        }
        else {
            // student
            result = json.object;
        }
        const files = [];
        await Promise.all(result.map(async (f) => {
            var _a, _b;
            files.push({
                id: f.wjid,
                title: utils_1.decodeHTML(f.bt),
                description: utils_1.decodeHTML(f.ms),
                rawSize: f.wjdx,
                size: f.fileSize,
                uploadTime: new Date(f.scsj),
                downloadUrl: URL.LEARN_FILE_DOWNLOAD(courseType === types_1.CourseType.STUDENT ? f.wjid : f.id, courseType, courseID),
                previewUrl: URL.LEARN_FILE_PREVIEW(f.wjid, courseType, true),
                isNew: f.isNew,
                markedImportant: f.sfqd === 1,
                visitCount: (_a = f.llcs) !== null && _a !== void 0 ? _a : 0,
                downloadCount: (_b = f.xzcs) !== null && _b !== void 0 ? _b : 0,
                fileType: f.wjlx,
            });
        }));
        return files;
    }
    /** Get all homeworks （课程作业） of the specified course (support student version only). */
    async getHomeworkList(courseID, courseType = types_1.CourseType.STUDENT) {
        if (courseType === types_1.CourseType.TEACHER) {
            return Promise.reject({
                reason: types_1.FailReason.NOT_IMPLEMENTED,
                extra: 'currently getting homework list of TA courses is not supported'
            });
        }
        const allHomework = [];
        await Promise.all(URL.LEARN_HOMEWORK_LIST_SOURCE(courseID).map(async (s) => {
            const homeworks = await this.getHomeworkListAtUrl(s.url, s.status);
            allHomework.push(...homeworks);
        }));
        return allHomework;
    }
    /** Get all discussions （课程讨论） of the specified course. */
    async getDiscussionList(courseID, courseType = types_1.CourseType.STUDENT) {
        const json = await (await __classPrivateFieldGet(this, _myFetch).call(this, URL.LEARN_DISCUSSION_LIST(courseID, courseType))).json();
        if (json.result !== 'success') {
            return Promise.reject({
                reason: types_1.FailReason.INVALID_RESPONSE,
                extra: json
            });
        }
        const result = json.object.resultsList;
        const discussions = [];
        await Promise.all(result.map(async (d) => {
            discussions.push({
                ...this.parseDiscussionBase(d),
                boardId: d.bqid,
                url: URL.LEARN_DISCUSSION_DETAIL(d.wlkcid, d.bqid, d.id, courseType),
            });
        }));
        return discussions;
    }
    /**
     * Get all notifications （课程答疑） of the specified course.
     * The student version supports only answered questions, while the teacher version supports all questions.
     */
    async getAnsweredQuestionList(courseID, courseType = types_1.CourseType.STUDENT) {
        const json = await (await __classPrivateFieldGet(this, _myFetch).call(this, URL.LEARN_QUESTION_LIST_ANSWERED(courseID, courseType))).json();
        if (json.result !== 'success') {
            return Promise.reject({
                reason: types_1.FailReason.INVALID_RESPONSE,
                extra: json
            });
        }
        const result = json.object.resultsList;
        const questions = [];
        await Promise.all(result.map(async (q) => {
            questions.push({
                ...this.parseDiscussionBase(q),
                question: js_base64_1.Base64.decode(q.wtnr),
                url: URL.LEARN_QUESTION_DETAIL(q.wlkcid, q.id, courseType),
            });
        }));
        return questions;
    }
    async getHomeworkListAtUrl(url, status) {
        const json = await (await __classPrivateFieldGet(this, _myFetch).call(this, url)).json();
        if (json.result !== 'success') {
            return Promise.reject({
                reason: types_1.FailReason.INVALID_RESPONSE,
                extra: json
            });
        }
        const result = json.object.aaData;
        const homeworks = [];
        await Promise.all(result.map(async (h) => {
            homeworks.push({
                id: h.zyid,
                studentHomeworkId: h.xszyid,
                title: utils_1.decodeHTML(h.bt),
                url: URL.LEARN_HOMEWORK_DETAIL(h.wlkcid, h.zyid, h.xszyid),
                deadline: new Date(h.jzsj),
                submitUrl: URL.LEARN_HOMEWORK_SUBMIT(h.wlkcid, h.xszyid),
                submitTime: h.scsj === null ? undefined : new Date(h.scsj),
                grade: h.cj === null ? undefined : h.cj,
                gradeLevel: utils_1.mapGradeToLevel(h.cj),
                graderName: utils_1.trimAndDefine(h.jsm),
                gradeContent: utils_1.trimAndDefine(h.pynr),
                gradeTime: h.pysj === null ? undefined : new Date(h.pysj),
                submittedAttachmentUrl: h.zyfjid === '' ? undefined : URL.LEARN_HOMEWORK_DOWNLOAD(h.wlkcid, h.zyfjid),
                ...status,
                ...(await this.parseHomeworkDetail(h.wlkcid, h.zyid, h.xszyid)),
            });
        }));
        return homeworks;
    }
    async parseNotificationDetail(courseID, id, courseType) {
        const response = await __classPrivateFieldGet(this, _myFetch).call(this, URL.LEARN_NOTIFICATION_DETAIL(courseID, id, courseType));
        const result = $(await response.text());
        let path = '';
        if (courseType === types_1.CourseType.STUDENT) {
            path = result('.ml-10').attr('href');
        }
        else {
            path = result('#wjid').attr('href');
        }
        return { attachmentUrl: `${URL.LEARN_PREFIX}${path}` };
    }
    async parseHomeworkDetail(courseID, id, studentHomeworkID) {
        const response = await __classPrivateFieldGet(this, _myFetch).call(this, URL.LEARN_HOMEWORK_DETAIL(courseID, id, studentHomeworkID));
        const result = $(await response.text());
        const fileDivs = result('div.list.fujian.clearfix');
        return {
            description: utils_1.trimAndDefine(result('div.list.calendar.clearfix>div.fl.right>div.c55').slice(0, 1).html()),
            answerContent: utils_1.trimAndDefine(result('div.list.calendar.clearfix>div.fl.right>div.c55').slice(1, 2).html()),
            submittedContent: utils_1.trimAndDefine(cheerio('div.right', result('div.boxbox').slice(1, 2)).slice(2, 3).html()),
            ...this.parseHomeworkFile(fileDivs[0], 'attachmentName', 'attachmentUrl'),
            ...this.parseHomeworkFile(fileDivs[1], 'answerAttachmentName', 'answerAttachmentUrl'),
            ...this.parseHomeworkFile(fileDivs[2], 'submittedAttachmentName', 'submittedAttachmentUrl'),
            ...this.parseHomeworkFile(fileDivs[3], 'gradeAttachmentName', 'gradeAttachmentUrl'),
        };
    }
    parseHomeworkFile(fileDiv, nameKey, urlKey) {
        const fileNode = cheerio('.ftitle', fileDiv).children('a')[0];
        if (fileNode !== undefined) {
            return {
                [nameKey]: fileNode.children[0].data,
                [urlKey]: `${URL.LEARN_PREFIX}${fileNode.attribs.href.split('=').slice(-1)[0]}`,
            };
        }
        else {
            return {};
        }
    }
    parseDiscussionBase(d) {
        var _a;
        return {
            id: d.id,
            title: utils_1.decodeHTML(d.bt),
            publisherName: d.fbrxm,
            publishTime: new Date(d.fbsj),
            lastReplyTime: new Date(d.zhhfsj),
            lastReplierName: d.zhhfrxm,
            visitCount: (_a = d.djs) !== null && _a !== void 0 ? _a : 0,
            replyCount: d.hfcs,
        };
    }
}
exports.Learn2018Helper = Learn2018Helper;
_provider = new WeakMap(), _rawFetch = new WeakMap(), _myFetch = new WeakMap(), _withReAuth = new WeakMap();
//# sourceMappingURL=index.js.map