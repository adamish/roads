#!/bin/bash

gradle :production :js

rsync -rv production/ foo@example.com:foo/bar/baz --exclude tmp --exclude exe
