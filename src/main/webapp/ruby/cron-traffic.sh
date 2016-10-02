#!/bin/bash
exit 0

source $HOME/.bashrc
cd $(dirname $0)
ruby traffic/create.rb >> log.txt
