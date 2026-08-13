cd /home/acecoter/public_html/ctsda.acecoterieconsulting.com
export PATH="/home/acecoter/.nvm/versions/node/v20.12.2/bin:$PATH"
git pull origin main
npx pnpm --filter @ctsda/api run build
touch apps/api/tmp/restart.txt
touch tmp/restart.txt
