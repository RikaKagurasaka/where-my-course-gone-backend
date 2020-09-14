"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractJSONPResult = exports.JSONP_EXTRACTOR_NAME = exports.mapGradeToLevel = exports.trimAndDefine = exports.decodeHTML = exports.parseSemesterType = void 0;
const entities_1 = require("entities");
const types_1 = require("./types");
function parseSemesterType(n) {
    if (n === 1) {
        return types_1.SemesterType.FALL;
    }
    else if (n === 2) {
        return types_1.SemesterType.SPRING;
    }
    else if (n === 3) {
        return types_1.SemesterType.SUMMER;
    }
    else {
        return types_1.SemesterType.UNKNOWN;
    }
}
exports.parseSemesterType = parseSemesterType;
function decodeHTML(html) {
    const text = entities_1.decodeHTML(html);
    // remove strange prefixes returned by web learning
    return text.startsWith('\xC2\x9E\xC3\xA9\x65')
        ? text.substr(5)
        : text.startsWith('\x9E\xE9\x65')
            ? text.substr(3)
            : text.startsWith('\xE9\x65')
                ? text.substr(2)
                : text;
}
exports.decodeHTML = decodeHTML;
function trimAndDefine(text) {
    if (text === undefined || text === null) {
        return undefined;
    }
    const trimmed = text.trim();
    return trimmed === '' ? undefined : decodeHTML(trimmed);
}
exports.trimAndDefine = trimAndDefine;
const GRADE_LEVEL_MAP = new Map([
    [-100, '已阅'],
    [-99, 'A+'],
    [-98, 'A'],
    [-92, 'A-'],
    [-87, 'B+'],
    [-85, '优秀'],
    [-82, 'B'],
    [-78, 'B-'],
    [-74, 'C+'],
    [-71, 'C'],
    [-68, 'C-'],
    [-67, 'G'],
    [-66, 'D+'],
    [-64, 'D'],
    [-65, '免课'],
    [-63, 'P'],
    [-62, 'EX'],
    [-61, '免修'],
    [-60, '通过'],
    [-59, '不通过'],
    [-55, 'W'],
    [-51, 'I'],
    [-50, '缓考'],
    [-31, 'NA'],
    [-30, 'F'],
]);
function mapGradeToLevel(grade) {
    if (grade !== null && GRADE_LEVEL_MAP.has(grade)) {
        return GRADE_LEVEL_MAP.get(grade);
    }
    else {
        return undefined;
    }
}
exports.mapGradeToLevel = mapGradeToLevel;
exports.JSONP_EXTRACTOR_NAME = 'thu_learn_lib_jsonp_extractor';
function extractJSONPResult(jsonp) {
    // check jsonp format
    if (!jsonp.startsWith(exports.JSONP_EXTRACTOR_NAME)) {
        throw types_1.FailReason.INVALID_RESPONSE;
    }
    // evaluate the result
    return Function(`"use strict";const ${exports.JSONP_EXTRACTOR_NAME}=(s)=>s;return ${jsonp};`)();
}
exports.extractJSONPResult = extractJSONPResult;
//# sourceMappingURL=utils.js.map