require 'json'
require 'zlib'
require 'stringio'
load 'core.rb'

id_map = JSON.parse(File.read(data_dir("signs-ids")))

arr = []
id_map.each {|k,v|
	arr.push({:id => v, :guid => k})
}

arr.sort! {|a, b|
  a[:guid] <=> b[:guid]
}

arr.each { |it|
  puts it[:guid]
}

out=""
arr.each { |it|
  guid = []
  for i in (0..31).step 2
    guid.push it[:guid].slice(30 - i, 2).to_i(16)
  end
  out = out + guid.pack("CCCCCCCCCCCCCCCC")
  out = out + [it[:id]].pack("Q")
}
IO.binwrite(app_dir("signs-guids"), out)

