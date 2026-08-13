cd /home/acecoter/public_html/ctsda.acecoterieconsulting.com
export PATH="/home/acecoter/.nvm/versions/node/v20.12.2/bin:$PATH"
npx pnpm install
npx pnpm --filter @ctsda/web run build
touch apps/web/tmp/restart.txt
