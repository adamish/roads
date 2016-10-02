#!/home/adamish/ruby/bin/ruby
require 'time'
require 'json'
require 'zlib'
require 'stringio'

load '../ruby/core.rb'

input = STDIN.read
File.write("tmp/last.gz", input)

str = StringIO.new(input)

if (str.length() === 0) 
   puts "Content-type: text/plain\n\n"                                                                                                                                          
   puts "OK"
   abort
end
gz = Zlib::GzipReader.new(str)
xml = gz.read
time_match = /timeDefault>(.*?)<\//.match(xml)
data_time = Time.iso8601(time_match[1]).to_i

results = xml.scan /(?:id=(\"\d+)|spee(d>\d+)|percentag(e>\d+)|FlowRa(te>\d+))/
id_map = JSON.parse(File.read(data_dir("road-ids")))
output = Array.new

current_id = -1
data = {}
results.each do |it|
  id = it[0]
  speed = it[1]
  occupancy = it[2]
  flow = it[3]
  
  if id != nil && id[0] == '"'
    new_id = id.slice(1, id.length)
    if new_id == current_id
      next
    else
      current_id = new_id
      data = {id: new_id}
      output.push data
    end
  elsif speed && speed[0] == 'd'
    data[:speed] = speed.slice(2, speed.length).to_i
  elsif occupancy && occupancy[0] == 'e'
    data[:occupancy] = occupancy.slice(2, occupancy.length).to_i
  elsif flow && flow[0] == 't' && flow[1] == 'e'
    data[:flow] = flow.slice(3, flow.length).to_i
  end
end

output.each do |it|
  id = id_map[it[:id]]
  if id != nil
    it[:id] = id
  else
    puts "Unknown ID #{it[:id]}"
    it[:id] = nil
  end
end
send_to_app("traffic", {content: output, header: {time: data_time}}.to_json)
puts "Content-type: text/plain\n\n"
puts "OK"
