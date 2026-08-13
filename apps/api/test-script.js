const { PrismaClient } = require('../../packages/db/node_modules/@prisma/client');
// Or require from apps/api/node_modules/@prisma/client
const path = require('path');
const fs = require('fs');

async function test() {
  console.log('App API cwd:', process.cwd());
}
test();
