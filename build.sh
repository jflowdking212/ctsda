cd /home/acecoter/public_html/ctsda.acecoterieconsulting.com
git pull origin main
export PATH="/home/acecoter/.nvm/versions/node/v20.12.2/bin:$PATH"
npm run build --workspace=@ctsda/web
pm2 reload ctsda-web
