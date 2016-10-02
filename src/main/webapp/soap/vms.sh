#!/bin/bash

echo -e "Content-type: text/plain\n\n"
echo "OK"

if [ "$HOME" == "" ]; then
  HOME=/home/adamish
fi;

export LD_LIBRARY_PATH=$HOME/xerces-c-3.1.3/local/lib

cd ../ruby/signs-cpp/
cat | gunzip | ./exe /dev/stdin  &> ~/signs-cpp.log

if [ "../../app/sign-settings.tmp" -nt "../../app/sign-settings" ]; then
  echo "JSON updated - writing new file" > ~/signs-cpp.log
  cd ../../app
  cp sign-settings.tmp sign-settings.x
  mv sign-settings.x sign-settings
  gzip < sign-settings > sign-settings.gz.x
  mv sign-settings.gz.x sign-settings.gz
fi;
