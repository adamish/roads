#!/bin/bash

find production/img -name "*.png" | xargs -I{} optipng -o 2 {}

