#!/bin/bash

# get brew
# xcode from apple site
# xcode command line tools from xcode site
# JDK 8

brew install gradle
brew install imagemagick
brew install ruby
brew install node
brew install imagemagick
brew install yuicompressor
brew install optipng
brew install jpegoptim
brew install proj
brew install poppler

sudo gem install 'polylines'
sudo gem install 'nokogiri'
sudo gem install 'json'
sudo gem install 'haversine'
sudo gem install 'rmagick'
sudo gem install 'proj4rb' 

sudo ln -s $(which yuicompressor) /usr/local/bin/yui-compressor
