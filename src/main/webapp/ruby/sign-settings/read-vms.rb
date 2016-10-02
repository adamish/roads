require 'nokogiri'
require 'json'

load 'core.rb'

class ReadVms
  class MyDoc < Nokogiri::XML::SAX::Document
    attr_accessor :units
    def initialize
      @units = Array.new
      @unit = nil
      @buffer = ""
      @interested = Hash.new
      @interested['vmsLegend'] = true
      @interested['vmsIdentifier'] = true
      @interested['situationRecordVersionTime'] = true

    end

    def start_element_namespace name, attributes, prefix, uri, ns

      if name == "situationRecord" then
        @unit = Hash.new
        @unit['value'] = Array.new
      end
      @buffer = ""
      @capture = @interested[name] == true
    end

    def end_element_namespace name, prefix, uri
      if name == 'situationRecord'
        @units.push @unit
      elsif name == 'vmsIdentifier'
        @unit['id'] = @buffer
      elsif name == 'vmsLegend'
        strip = @buffer.strip
        matches = /(SY\d+) (.*)/i.match(strip)
        if matches == nil
          @unit['value'].push strip
        else
          @unit['value'].push matches[1]
          @unit['value'].push matches[2].strip
        end
      elsif name == 'situationRecordVersionTime'
        @unit['time'] = Time.iso8601(@buffer).to_i
      end
    end

    def characters(string)
      if @capture
        @buffer = @buffer + string
      end
    end
  end

  def self.get_type(setting)
    type = "default"
    line = setting['value'].join(",")
    if (/.*(\d+) MINS.*/i).match(line)
      type = "tt"
    elsif (/.*LITTER.*/i).match(line)
      type = "plan"
    end
    type
  end

  def self.read
    doc = MyDoc.new
    parser = Nokogiri::HTML::SAX::Parser.new(doc)
    parser.parse(File.open(data_dir('dynamic-vms.xml'), 'rb'))

    id_map = JSON.parse(File.read(data_dir("vms-ids")))

    doc.units.each do |it|
      id = id_map[it['id']]
      if id == nil
        puts "Unknown VMS ID #{it['id']}"
        it['id'] = nil
      else
        it['id'] = id
      end

    end

    output = doc.units.select do |it|
      it['id'] != nil
    end

    #output = output.select do |it|
    #  /.*displaced.*/i.match(it['value'].join(",")) == nil
    #end

    output.each do |it|
      #it['type'] = self.get_type(it)
    end
    return output
  end

end
