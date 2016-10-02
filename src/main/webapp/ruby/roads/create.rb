require 'json'

load 'grid.rb'
load 'core.rb'

links = JSON.parse(File.read(data_dir("roads-raw")))

type_map = Hash.new
type_map['mainCarriageway'] = 0
type_map['entrySlipRoad'] = 1
type_map['exitSlipRoad'] = 2
type_map['roundabout'] = 3

qt = Grid.new(100)

def calc_size(road)
  packed = road['coordinates']
  x0 = packed.min_by {|it| it[0]}[1]
  x1 = packed.max_by {|it| it[0]}[1]
  y0 = packed.min_by {|it| it[1]}[0]
  y1 = packed.max_by {|it| it[1]}[0]
  [x0, y0, (x0 - x1).abs, (y0 - y1).abs]
end

def get_length(length)
  if length < 50
    return_value = 0
  elsif length < 100
    return_value = 1
  elsif length < 500
    return_value = 2
  elsif length < 1000
    return_value = 3
  end
  return_value
  length
end

lengths = Hash.new
mod = Array.new
i = 0
links.each do |it|
  r = Array.new
  r.push it['name'] # 0
  r.push type_map[it['type']] # 1
  r.push it['polyline'] #2
  r.push get_length(it['length']) #3
  #  r.push it['midpoint'] #4

  lengths[it['length']] = true

  #  dim = calc_size(it)
  it['coordinates'].each do |it|
    qt.insert(it[1], it[0], i)
  end
  mod.push(r)
  i = i + 1
end

mains = links.select do |it|
  it['type'] == 'mainCarriageway'
end

puts mains.min_by { |it| it['length'] }.length

wrapper = Hash.new
wrapper['content'] = mod
wrapper['index'] = qt.harvest
File.write(app_dir("roads"), wrapper.to_json)
