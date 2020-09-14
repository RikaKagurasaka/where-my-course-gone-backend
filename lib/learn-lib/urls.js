"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REGISTRAR_CALENDAR = exports.REGISTRAR_AUTH = exports.REGISTRAR_TICKET = exports.REGISTRAR_TICKET_FORM_DATA = exports.LEARN_QUESTION_DETAIL = exports.LEARN_QUESTION_LIST_ANSWERED = exports.LEARN_DISCUSSION_DETAIL = exports.LEARN_DISCUSSION_LIST = exports.LEARN_HOMEWORK_SUBMIT = exports.LEARN_HOMEWORK_DOWNLOAD = exports.LEARN_HOMEWORK_DETAIL = exports.LEARN_HOMEWORK_LIST_GRADED = exports.LEARN_HOMEWORK_LIST_SUBMITTED = exports.LEARN_HOMEWORK_LIST_NEW = exports.LEARN_HOMEWORK_LIST_SOURCE = exports.LEARN_NOTIFICATION_DETAIL = exports.LEARN_NOTIFICATION_LIST = exports.LEARN_FILE_PREVIEW = exports.LEARN_FILE_DOWNLOAD = exports.LEARN_FILE_LIST = exports.LEARN_TEACHER_COURSE_URL = exports.LEARN_COURSE_TIME_LOCATION = exports.LEARN_COURSE_URL = exports.LEARN_COURSE_LIST = exports.LEARN_CURRENT_SEMESTER = exports.LEARN_SEMESTER_LIST = exports.LEARN_LOGOUT = exports.LEARN_AUTH_ROAM = exports.ID_LOGIN_FORM_DATA = exports.ID_LOGIN = exports.REGISTRAR_PREFIX = exports.LEARN_PREFIX = void 0;
const FormData = require("form-data");
const types_1 = require("./types");
exports.LEARN_PREFIX = 'https://learn.tsinghua.edu.cn';
exports.REGISTRAR_PREFIX = 'https://zhjw.cic.tsinghua.edu.cn';
const MAX_SIZE = 200;
exports.ID_LOGIN = () => {
    return 'https://id.tsinghua.edu.cn/do/off/ui/auth/login/post/bb5df85216504820be7bba2b0ae1535b/0?/login.do';
};
exports.ID_LOGIN_FORM_DATA = (username, password) => {
    const credential = new FormData();
    credential.append('i_user', username);
    credential.append('i_pass', password);
    credential.append('atOnce', String(true));
    return credential;
};
exports.LEARN_AUTH_ROAM = (ticket) => {
    return `${exports.LEARN_PREFIX}/b/j_spring_security_thauth_roaming_entry?ticket=${ticket}`;
};
exports.LEARN_LOGOUT = () => {
    return `${exports.LEARN_PREFIX}/f/j_spring_security_logout`;
};
exports.LEARN_SEMESTER_LIST = () => {
    return `${exports.LEARN_PREFIX}/b/wlxt/kc/v_wlkc_xs_xktjb_coassb/queryxnxq`;
};
exports.LEARN_CURRENT_SEMESTER = () => {
    return `${exports.LEARN_PREFIX}/b/kc/zhjw_v_code_xnxq/getCurrentAndNextSemester`;
};
exports.LEARN_COURSE_LIST = (semester, courseType) => {
    if (courseType === types_1.CourseType.STUDENT) {
        return `${exports.LEARN_PREFIX}/b/wlxt/kc/v_wlkc_xs_xkb_kcb_extend/student/loadCourseBySemesterId/${semester}`;
    }
    else {
        return `${exports.LEARN_PREFIX}/b/kc/v_wlkc_kcb/queryAsorCoCourseList/${semester}/0`;
    }
};
exports.LEARN_COURSE_URL = (courseID, courseType) => {
    return `${exports.LEARN_PREFIX}/f/wlxt/index/course/${courseType}/course?wlkcid=${courseID}`;
};
exports.LEARN_COURSE_TIME_LOCATION = (courseID) => {
    return `${exports.LEARN_PREFIX}/b/kc/v_wlkc_xk_sjddb/detail?id=${courseID}`;
};
exports.LEARN_TEACHER_COURSE_URL = (courseID) => {
    return `${exports.LEARN_PREFIX}/f/wlxt/index/course/teacher/course?wlkcid=${courseID}`;
};
exports.LEARN_FILE_LIST = (courseID, courseType) => {
    if (courseType === types_1.CourseType.STUDENT) {
        return `${exports.LEARN_PREFIX}/b/wlxt/kj/wlkc_kjxxb/student/kjxxbByWlkcidAndSizeForStudent?wlkcid=${courseID}&size=${MAX_SIZE}`;
    }
    else {
        return `${exports.LEARN_PREFIX}/b/wlxt/kj/v_kjxxb_wjwjb/teacher/queryByWlkcid?wlkcid=${courseID}&size=${MAX_SIZE}`;
    }
};
exports.LEARN_FILE_DOWNLOAD = (fileID, courseType, courseID) => {
    if (courseType === types_1.CourseType.STUDENT) {
        return `${exports.LEARN_PREFIX}/b/wlxt/kj/wlkc_kjxxb/student/downloadFile?sfgk=0&wjid=${fileID}`;
    }
    else {
        return `${exports.LEARN_PREFIX}/f/wlxt/kj/wlkc_kjxxb/teacher/beforeView?id=${fileID}&wlkcid=${courseID}`;
    }
};
exports.LEARN_FILE_PREVIEW = (fileID, courseType, firstPageOnly) => {
    return `${exports.LEARN_PREFIX}/f/wlxt/kc/wj_wjb/${courseType}/beforePlay?wjid=${fileID}&mk=mk_kcwj&browser=-1&sfgk=0&pageType=${firstPageOnly ? 'first' : 'all'}`;
};
exports.LEARN_NOTIFICATION_LIST = (courseID, courseType) => {
    if (courseType === types_1.CourseType.STUDENT) {
        return `${exports.LEARN_PREFIX}/b/wlxt/kcgg/wlkc_ggb/student/kcggListXs?wlkcid=${courseID}&size=${MAX_SIZE}`;
    }
    else {
        return `${exports.LEARN_PREFIX}/b/wlxt/kcgg/wlkc_ggb/teacher/kcggList?wlkcid=${courseID}&size=${MAX_SIZE}`;
    }
};
exports.LEARN_NOTIFICATION_DETAIL = (courseID, notificationID, courseType) => {
    if (courseType === types_1.CourseType.STUDENT) {
        return `${exports.LEARN_PREFIX}/f/wlxt/kcgg/wlkc_ggb/student/beforeViewXs?wlkcid=${courseID}&id=${notificationID}`;
    }
    else {
        return `${exports.LEARN_PREFIX}/f/wlxt/kcgg/wlkc_ggb/teacher/beforeViewJs?wlkcid=${courseID}&id=${notificationID}`;
    }
};
exports.LEARN_HOMEWORK_LIST_SOURCE = (courseID) => {
    return [
        {
            url: exports.LEARN_HOMEWORK_LIST_NEW(courseID),
            status: {
                submitted: false,
                graded: false,
            },
        },
        {
            url: exports.LEARN_HOMEWORK_LIST_SUBMITTED(courseID),
            status: {
                submitted: true,
                graded: false,
            },
        },
        {
            url: exports.LEARN_HOMEWORK_LIST_GRADED(courseID),
            status: {
                submitted: true,
                graded: true,
            },
        },
    ];
};
exports.LEARN_HOMEWORK_LIST_NEW = (courseID) => {
    return `${exports.LEARN_PREFIX}/b/wlxt/kczy/zy/student/index/zyListWj?wlkcid=${courseID}&size=${MAX_SIZE}`;
};
exports.LEARN_HOMEWORK_LIST_SUBMITTED = (courseID) => {
    return `${exports.LEARN_PREFIX}/b/wlxt/kczy/zy/student/index/zyListYjwg?wlkcid=${courseID}&size=${MAX_SIZE}`;
};
exports.LEARN_HOMEWORK_LIST_GRADED = (courseID) => {
    return `${exports.LEARN_PREFIX}/b/wlxt/kczy/zy/student/index/zyListYpg?wlkcid=${courseID}&size=${MAX_SIZE}`;
};
exports.LEARN_HOMEWORK_DETAIL = (courseID, homeworkID, studentHomeworkID) => {
    return `${exports.LEARN_PREFIX}/f/wlxt/kczy/zy/student/viewCj?wlkcid=${courseID}&zyid=${homeworkID}&xszyid=${studentHomeworkID}`;
};
exports.LEARN_HOMEWORK_DOWNLOAD = (courseID, attachmentID) => {
    return `${exports.LEARN_PREFIX}/b/wlxt/kczy/zy/student/downloadFile/${courseID}/${attachmentID}`;
};
exports.LEARN_HOMEWORK_SUBMIT = (courseID, studentHomeworkID) => {
    return `${exports.LEARN_PREFIX}/f/wlxt/kczy/zy/student/tijiao?wlkcid=${courseID}&xszyid=${studentHomeworkID}`;
};
exports.LEARN_DISCUSSION_LIST = (courseID, courseType) => {
    return `${exports.LEARN_PREFIX}/b/wlxt/bbs/bbs_tltb/${courseType}/kctlList?wlkcid=${courseID}&size=${MAX_SIZE}`;
};
exports.LEARN_DISCUSSION_DETAIL = (courseID, boardID, discussionID, courseType, tabId = 1) => {
    return `${exports.LEARN_PREFIX}/f/wlxt/bbs/bbs_tltb/${courseType}/viewTlById?wlkcid=${courseID}&id=${discussionID}&tabbh=${tabId}&bqid=${boardID}`;
};
exports.LEARN_QUESTION_LIST_ANSWERED = (courseID, courseType) => {
    return `${exports.LEARN_PREFIX}/b/wlxt/bbs/bbs_tltb/${courseType}/kcdyList?wlkcid=${courseID}&size=${MAX_SIZE}`;
};
exports.LEARN_QUESTION_DETAIL = (courseID, questionID, courseType) => {
    if (courseType === types_1.CourseType.STUDENT) {
        return `${exports.LEARN_PREFIX}/f/wlxt/bbs/bbs_kcdy/student/viewDyById?wlkcid=${courseID}&id=${questionID}`;
    }
    else {
        return `${exports.LEARN_PREFIX}/f/wlxt/bbs/bbs_kcdy/teacher/beforeEditDy?wlkcid=${courseID}&id=${questionID}`;
    }
};
exports.REGISTRAR_TICKET_FORM_DATA = () => {
    const form = new FormData();
    form.append('appId', 'ALL_ZHJW');
    return form;
};
exports.REGISTRAR_TICKET = () => {
    return `${exports.LEARN_PREFIX}/b/wlxt/common/auth/gnt`;
};
exports.REGISTRAR_AUTH = (ticket) => {
    return `${exports.REGISTRAR_PREFIX}/j_acegi_login.do?url=/&ticket=${ticket}`;
};
exports.REGISTRAR_CALENDAR = (startDate, endDate, graduate = false, callbackName = 'unknown') => {
    return `${exports.REGISTRAR_PREFIX}/jxmh_out.do?m=${graduate ? 'yjs' : 'bks'}_jxrl_all&p_start_date=${startDate}&p_end_date=${endDate}&jsoncallback=${callbackName}`;
};
//# sourceMappingURL=urls.js.map