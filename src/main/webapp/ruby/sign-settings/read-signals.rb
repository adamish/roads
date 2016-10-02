require 'nokogiri'
require 'json'
require 'time'

load 'core.rb'

class ReadSignals
  class MyDoc < Nokogiri::XML::SAX::Document
    attr_accessor :units
    def initialize
      @units = Array.new
      @unit = nil
      @buffer = ""
      @interested = Hash.new
      @interested['aspectDisplayed'] = true
      @interested['matrixIdentifier'] = true
      @interested['situationRecordVersionTime'] = true

    end

    def start_element_namespace name, attributes, prefix, uri, ns

      if name == "situationRecord" then
        @unit = Hash.new
      end
      @buffer = ""
      @capture = @interested[name] == true
    end

    def end_element_namespace name, prefix, uri
      if name == 'situationRecord'
        @units.push @unit
      elsif name == 'matrixIdentifier'
        @unit['id'] = @buffer
      elsif name == 'aspectDisplayed'
        @unit['value'] = @buffer.downcase
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

  def initialize

    @matrices = Hash.new
    @matrices["20"] = true
    @matrices["20r"] = true
    @matrices["30"] = true
    @matrices["30r"] = true
    @matrices["40"] = true
    @matrices["40r"] = true
    @matrices["50"] = true
    @matrices["50r"] = true
    @matrices["60"] = true
    @matrices["60r"] = true
    @matrices["70"] = true
    @matrices["70r"] = true
    @matrices["fog"] = true
    @matrices["111t"] = true
    @matrices["11t"] = true
    @matrices["11tt"] = true
    @matrices["1t"] = true
    @matrices["1tt"] = true
    @matrices["1ttt"] = true
    @matrices["ldl"] = true
    @matrices["ldr"] = true
    @matrices["mdl"] = true
    @matrices["mdr"] = true
    @matrices["nr"] = true
    @matrices["off"] = true
    @matrices["open"] = true
    @matrices["q"] = true
    @matrices["redx"] = true
    @matrices["re"] = true
    @matrices["stop"] = true
    @matrices["t"] = true
    @matrices["t1"] = true
    @matrices["t11"] = true
    @matrices["t111"] = true
    @matrices["tt"] = true
    @matrices["tt1"] = true
    @matrices["tt11"] = true
    @matrices["ttt"] = true
    @matrices["ttt1"] = true
    @matrices["tttt"] = true
    @matrices["udf"] = true

      
    @priority = Hash.new
    @priority["20"] = "speed"
    @priority["20r"] = "speed"
    @priority["30"] = "speed"
    @priority["30r"] = "speed"
    @priority["40"] = "speed"
    @priority["40r"] = "speed"
    @priority["50"] = "speed"
    @priority["50r"] = "speed"
    @priority["60"] = "speed"
    @priority["60r"] = "speed"
    @priority["70"] = "speed"
    @priority["70r"] = "speed"
    @priority["fog"] = "weather"
    @priority["111t"] = "closure"
    @priority["11t"] = "closure"
    @priority["11tt"] = "closure"
    @priority["1t"] = "closure"
    @priority["1tt"] = "closure"
    @priority["1ttt"] = "closure"
    @priority["ldl"] = "default"
    @priority["ldr"] = "default"
    @priority["mdl"] = "default"
    @priority["mdr"] = "default"
    @priority["nr"] = "default"
    @priority["off"] = "default"
    @priority["open"] = "default"
    @priority["q"] = "default"
    @priority["redx"] = "closure"
    @priority["re"] = "default"
    @priority["stop"] = "closure"
    @priority["t"] = "closure"
    @priority["t1"] = "closure"
    @priority["t11"] = "closure"
    @priority["t111"] = "closure"
    @priority["tt"] = "closure"
    @priority["tt1"] = "closure"
    @priority["tt11"] = "closure"
    @priority["ttt"] = "closure"
    @priority["ttt1"] = "closure"
    @priority["tttt"] = "closure"
    @priority["udf"] = "default"

  end

  def read
    doc = MyDoc.new
    parser = Nokogiri::HTML::SAX::Parser.new(doc)
    parser.parse(File.open(data_dir('dynamic-signals.xml'), 'rb'))

    id_map = JSON.parse(File.read(data_dir("signals-ids")))

    doc.units.each do |it|
      id = id_map[it['id']]
      if id == nil
        puts "Unknown Signal ID #{it['id']}"
        it['id'] = nil
      else
        it['id'] = id
      end
    end

    doc.units.each do |it|
      id = @matrices[it['value']]
      if id == nil
        puts "Unknown setting value #{it['value']}"
        it['id'] = nil
      end
    end

    output = doc.units.select do |it|
      it['id'] != nil
    end

    output.each do |it|
#      puts it['value']
    end

    return output
  end
end

