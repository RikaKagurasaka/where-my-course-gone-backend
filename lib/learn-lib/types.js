"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseType = exports.ContentType = exports.SemesterType = exports.FailReason = void 0;
var FailReason;
(function (FailReason) {
    FailReason["NO_CREDENTIAL"] = "no credential provided";
    FailReason["ERROR_FETCH_FROM_ID"] = "could not fetch ticket from id.tsinghua.edu.cn";
    FailReason["BAD_CREDENTIAL"] = "bad credential";
    FailReason["ERROR_ROAMING"] = "could not roam to learn.tsinghua.edu.cn";
    FailReason["NOT_LOGGED_IN"] = "not logged in or login timeout";
    FailReason["NOT_IMPLEMENTED"] = "not implemented";
    FailReason["INVALID_RESPONSE"] = "invalid response";
})(FailReason = exports.FailReason || (exports.FailReason = {}));
var SemesterType;
(function (SemesterType) {
    SemesterType["FALL"] = "\u79CB\u5B63\u5B66\u671F";
    SemesterType["SPRING"] = "\u6625\u5B63\u5B66\u671F";
    SemesterType["SUMMER"] = "\u590F\u5B63\u5B66\u671F";
    SemesterType["UNKNOWN"] = "";
})(SemesterType = exports.SemesterType || (exports.SemesterType = {}));
var ContentType;
(function (ContentType) {
    ContentType["NOTIFICATION"] = "notification";
    ContentType["FILE"] = "file";
    ContentType["HOMEWORK"] = "homework";
    ContentType["DISCUSSION"] = "discussion";
    ContentType["QUESTION"] = "question";
})(ContentType = exports.ContentType || (exports.ContentType = {}));
var CourseType;
(function (CourseType) {
    CourseType["STUDENT"] = "student";
    CourseType["TEACHER"] = "teacher";
})(CourseType = exports.CourseType || (exports.CourseType = {}));
//# sourceMappingURL=types.js.map