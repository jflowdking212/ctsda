require('ts-node/register/transpile-only');

module.exports = {
  ...require('./enums.ts'),
  ...require('./user.ts'),
  ...require('./institution.ts'),
  ...require('./application.ts'),
  ...require('./accreditation.ts'),
  ...require('./payment.ts'),
  ...require('./notification.ts'),
  ...require('./common.ts'),
};
