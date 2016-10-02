#!/bin/bash

source $HOME/.bashrc
cd $(dirname $0)
ruby sign-settings/create.rb >> log.txt
