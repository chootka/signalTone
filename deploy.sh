#! /bin/bash
#
npm run build
rm -rf /var/www/html
mkdir /var/www/html
cp -r dist/* /var/www/html/
