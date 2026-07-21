"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOG_REDACTION_PATHS = exports.LOG_REDACTION_CENSOR = void 0;
exports.createPinoRedactOptions = createPinoRedactOptions;
exports.LOG_REDACTION_CENSOR = '[REDACTED]';
exports.LOG_REDACTION_PATHS = [
    'password',
    'newPassword',
    'currentPassword',
    'token',
    'secret',
    'authorization',
    'data.password',
    'data.token',
    'data.secret',
    'data.authorization',
    'job.data.password',
    'job.data.token',
    'job.data.secret',
    'job.data.authorization',
];
function createPinoRedactOptions() {
    return {
        paths: exports.LOG_REDACTION_PATHS,
        censor: exports.LOG_REDACTION_CENSOR,
    };
}
//# sourceMappingURL=logging.js.map