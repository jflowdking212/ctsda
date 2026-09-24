cd /home/acecoter/public_html/ctsdamerica.com
/usr/bin/npx pnpm install
cd packages/db
/usr/bin/npx pnpm prisma db push --accept-data-loss
cd ../../
/usr/bin/npx pnpm run build
/usr/bin/pm2 restart all
