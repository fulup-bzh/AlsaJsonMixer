#!/bin/sh

if ! test -d node_modules
then
 echo "install nodejs dependencies"
 npm install
fi

echo 'Build JS/CSS in dist'


for DIR in *ui
do
  (
     cd $DIR;
     echo "Grunt in `pwd`"
     # NODE_PATH looks not working with grunt !!!
     if ! test -f node_modules; then ln -sf ../node_modules .; fi;
     grunt build;
  )
done
