#!/bin/bash

source $HOME/.bashrc
cd $(dirname $0)
ruby unplanned-events/create.rb >> log.txt
