"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseModel = exports.CourseSchema = exports.meta = void 0;
const mongoose_1 = require("mongoose");
exports.meta = {
    id: { type: String, unique: true },
    name: String,
    englishName: String,
    timeAndLocation: [String],
    teacherName: String,
    teacherNumber: String,
    courseNumber: String,
    courseIndex: Number,
    semester: String
};
exports.CourseSchema = new mongoose_1.Schema(exports.meta);
exports.CourseModel = mongoose_1.model('course', exports.CourseSchema);
//# sourceMappingURL=course.js.map