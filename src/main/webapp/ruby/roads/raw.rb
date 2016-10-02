require 'nokogiri'
require 'json'
require 'polylines'
require 'haversine'
load 'core.rb'

class MyDoc < Nokogiri::XML::SAX::Document
  attr_accessor :links
  def initialize
    @links = Array.new
    @link_lookup = Hash.new
    @link = nil
    @buffer = ""
    @interested = Hash.new
    @interested['latitude'] = true
    @interested['longitude'] = true
    @interested['value'] = true
    @interested['carriageway'] = true
  end

  def start_element_namespace name, attributes, prefix, uri, ns

    if name == "predefinedLocationContainer" then
      matches = /NTIS_Link_Shape_(\d+)/.match(attributes[2].value)
      if matches != nil
        @link = Hash.new
        @link['coordinates'] = Array.new
        @link['id'] = matches[1].to_i
        @link_lookup[@link['id']] = @link
      end
      @link_coordinates = matches != nil
      @link_names = attributes[2].value == 'NTIS_Network_Links'
    elsif name == 'predefinedLocation' && @link_names
      @current_link = attributes[1].value.to_i
      
    end

    @buffer = ""
    @capture = @interested[name] == true

  end

  def end_element_namespace name, prefix, uri
    if @link_coordinates
      if name == 'predefinedLocationContainer'
        @links.push @link
      elsif name == 'latitude'
        @link['coordinates'].push @buffer.to_f.round(8)
      elsif name == 'longitude'
        @link['coordinates'].push @buffer.to_f.round(8)
      end
    elsif @link_names
      if name == 'predefinedLocationName'
        link = @link_lookup[@current_link]
        if link
          link['name'] = @buffer.strip
        else
          puts "cannot find #{@current_link}"
        end
      elsif name == 'carriageway'
        link = @link_lookup[@current_link]
        link['type'] = @buffer
      end
    end
  end

  def characters(string)
    if @capture
      @buffer = @buffer + string
    end
  end
end

def calculate_midpoint(packed)
  x0 = packed.min_by {|it| it[0]}[0]
  x1 = packed.max_by {|it| it[0]}[0]
  y0 = packed.min_by {|it| it[1]}[1]
  y1 = packed.max_by {|it| it[1]}[1]
  x_m = ((x1 + x0) / 2).round(5)
  y_m = ((y1 + y0) / 2).round(5)
  [x_m,y_m]
end

def calculate_length(packed)
  x0 = packed.min_by {|it| it[0]}[0]
  x1 = packed.max_by {|it| it[0]}[0]
  y0 = packed.min_by {|it| it[1]}[1]
  y1 = packed.max_by {|it| it[1]}[1]
  Haversine.distance(y0, x0, y1, x1).to_meters.round(0)
end

def calculate_angle(packed)
  x0 = packed[0][0]
  x1 = packed[0][1]
  y0 = packed[1][0]
  y1 = packed[1][1]
  dx = Haversine.distance(y0, x0, y0, x1).to_meters.round(0)
  dy = Haversine.distance(y0, x0, y1, x0).to_meters.round(0)
  a = Math.atan2(dy, dx) * 180 / Math::PI
  # +/-180 - angle anti-clockwise from y axis
  a = -a + 90 # clockwise from Y axis*
  a.round(0)
end

def encode_polyline(packed)
  Polylines::Encoder.encode_points(packed)
end

def pack_coordinates(link)
  packed = Array.new
  c = link['coordinates']
  i = 0
  until i > (c.length - 1)
    packed.push([c[i],c[i + 1]])
    i = i + 2
  end
  packed
end

puts "Build roads"
doc = MyDoc.new
parser = Nokogiri::HTML::SAX::Parser.new(doc)
parser.parse(File.open(data_dir('NTISModel-PredefinedLocations-2016-03-29-v4.1.xml'), 'rb'))

doc.links.each_with_index do |it, index|
  it['coordinates'] = pack_coordinates(it)
  it['polyline'] = encode_polyline(it['coordinates'])
  it['angle'] = calculate_angle(it['coordinates'])
  it['midpoint'] = calculate_midpoint(it['coordinates'])
  it['length'] = calculate_length(it['coordinates'])
  it['uid'] = index
end

File.write(data_dir("roads-raw"), doc.links.to_json)

def build_ids(arr)
  h = Hash.new
  arr.each {|it| h[it['id']] = it['uid'] }
  h
end

File.write(data_dir('road-ids'), build_ids(doc.links).to_json)
