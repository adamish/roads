#!/home/adamish/ruby/bin/ruby
require 'time'
require 'json'
require 'zlib'
require 'stringio'

load '../ruby/core.rb'

input = STDIN.read
#File.write("tmp/last-vms#{Time.now.to_i}.gz", input)

str = StringIO.new(input)

puts "Content-type: text/plain\n\n"
puts "OK"
