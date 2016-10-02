#!/bin/bash

ruby roads/raw.rb
ruby roads/create.rb

ruby signs/raw.rb
ruby signs/create.rb

ruby signs/build-static-guid-lookup.rb 
