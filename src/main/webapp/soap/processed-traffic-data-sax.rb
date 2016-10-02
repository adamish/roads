#!/usr/bin/ruby
require 'time'
require 'nokogiri'
require 'json'

load '../ruby/core.rb'

time = Time.new.to_i
of = File.open("tmp/test.#{time}.txt", 'w')

class MyDoc < Nokogiri::XML::SAX::Document
  attr_accessor :output
  def initialize
    @output = Array.new
    @current_link_id = -1
  end

  def get_link(link_id)
    if @current_link_id == link_id
      return
    end
    @current_link_id = link_id
    @current_link = {id: link_id}
    @output.push @current_link
  end

  def start_element_namespace name, attributes, prefix, uri, ns
    @buffer = ""
    if name == 'basicData'
      type = attributes[0].value
      if type == 'd2lm:TrafficSpeed'
        @interested = true
      elsif type == 'd2lm:TrafficFlow'
        @interested = true
      elsif type == 'd2lm:TrafficConcentration'
        @interested = true
      else
        @interested = false
        return
      end
    end

    if @interested == false
      return
    end

    if name == 'predefinedLocationReference'
      self.get_link(attributes[2].value)
    elsif name == 'speed'
      @capture = true
    elsif name == 'vehicleFlowRate'
      @capture = true
    elsif name == 'percentage'
      @capture = true
    else
      @capture = false
    end
  end

  def end_element_namespace name, prefix, uri
    if name == 'speed'
      @current_link[:speed] = @buffer.to_i
    elsif name == 'vehicleFlowRate'
      @current_link[:flow] = @buffer.to_i
    elsif name == 'percentage'
      @current_link[:occupancy] = @buffer.to_i
    end
  end

  def characters(string)
    if @capture
      @buffer = string
    end
  end
end

def process
  doc = MyDoc.new
  parser = Nokogiri::HTML::SAX::Parser.new(doc)
  parser.parse(STDIN)

  puts "finished"
  id_map = JSON.parse(File.read(data_dir("road-ids")))

  doc.output.each do |it|
    id = id_map[it[:id]]
    if id != nil
      it[:id] = id
    else
      puts "Unknown ID #{it[:id]}"
      it[:id] = nil
    end
  end
  
  speeds = doc.output.collect do |it|
    it['speed'] != nil
  end
  puts speeds.length
end

process

puts "Content-type: text/plain\n\n"
puts "OK"
