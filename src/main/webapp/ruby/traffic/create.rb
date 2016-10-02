require 'nokogiri'
require 'json'
require 'time'

load 'fetch.rb'
load 'core.rb'

class MyDoc < Nokogiri::XML::SAX::Document
  attr_accessor :links
  def initialize
    @links = Array.new
    @link_lookup = Hash.new
    @link = nil
    @buffer = ""
    @interested = Hash.new
    @interested['averageVehicleSpeed'] = true
    @interested['occupancy'] = true
    @interested['vehicleFlow'] = true
    @interested['predefinedLocationReference'] = true
    @interested['comparisonOperator'] = true
    @interested['vehicleLength'] = true
    @interested['time'] = true

    @flow_lookup = Hash.new
    @flow_lookup[''] = 'flow'
    @flow_lookup['lessThan5.2'] = 'flow1'
    @flow_lookup['greaterThan5.2lessThan6.6'] = 'flow2'
    @flow_lookup['greaterThan6.6lessThan11.6'] = 'flow3'
    @flow_lookup['greaterThan11.6'] = 'flow4'

  end

  def get_link(link_id)
    link = @link_lookup[link_id]
    if link == nil
      link = Hash.new
      link['id'] = link_id
      @link_lookup[link_id] = link
      @links.push link
    end
    link
  end

  def start_element_namespace name, attributes, prefix, uri, ns
    @buffer = ""
    if name == 'basicDataValue'
      @characteristics = Array.new
    end
    @capture = @interested[name] == true
  end

  def end_element_namespace name, prefix, uri
    if name == 'averageVehicleSpeed'
      @link['speed'] = (@buffer.to_f / 1.609344).round(0)
    elsif name == 'predefinedLocationReference'
      matches = /Link(\d+)/.match(@buffer)
      if matches != nil
        @link = get_link(matches[1].to_i)
        @link['time'] = @last_time;
      end
    elsif name == 'time'
      @last_time = Time.iso8601(@buffer.strip).to_i
    elsif name == 'occupancy'
      @link['occupancy'] = @buffer.to_i
    elsif name == 'vehicleFlow'
      @link[@flow_lookup[@characteristics.join('')]] = @buffer.to_i
    elsif name == 'comparisonOperator'
      @characteristics.push @buffer
    elsif name == 'vehicleLength'
      @characteristics.push @buffer
    end
  end

  def characters(string)
    if @capture
      @buffer = @buffer + string
    end
  end
end

def process
  doc = MyDoc.new
  parser = Nokogiri::HTML::SAX::Parser.new(doc)
  id_map = JSON.parse(File.read(data_dir("road-ids")))

  parser.parse(File.open(data_dir('traffic-data.xml'), 'rb'))

  doc.links.each do |it|
    id = id_map[it['id'].to_s]
    if id == nil
      puts "Unknown ID #{it['id']}"
      it['id'] = nil
    else
      it['id'] = id
    end
  end
  doc.links = doc.links.select do |it|
    it['id'] != nil
  end

  send_to_app("traffic", {content: doc.links}.to_json)

end

Fetch.fetch('http://hatrafficinfo.dft.gov.uk/feeds/datex/England/TrafficData/content.xml',
data_dir('traffic-data.xml')) {|it|process()}

