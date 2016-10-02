require 'nokogiri'
require 'json'

load 'core.rb'
load 'roads/get.rb'

class MyDoc < Nokogiri::XML::SAX::Document
  attr_accessor :vms, :signals
  def initialize
    @vms = Array.new
    @signals = Array.new
    @destination = nil
    @guid = nil
    @unit = nil
    @buffer = ""
    @uid = 0
    @interested = Hash.new
    @interested['latitude'] = true
    @interested['longitude'] = true
    @interested['vmsUnitIdentifier'] = true
    @interested['vmsUnitElectronicAddress'] = true
    @interested['distanceAlong'] = true
    @interested['linearElementIdentifier'] = true
    @interested['maxNumberOfCharacters'] = true
    @interested['maxNumberOfRows'] = true
    @interested['value'] = true
    @interested['values'] = true
    @interested['vmsDescription'] = true

    @existing = JSON.parse(File.read(data_dir("signs-ids")))
    
  end

  def start_element_namespace name, attributes, prefix, uri, ns

    if name == "vmsUnitRecord" then
      @unit = Hash.new
      @guid = attributes[0].value
    elsif name == "vmsUnitTable" && attributes[0].value == 'NTIS_Matrix_Units'
      @destination = @signals
    elsif name == "vmsUnitTable" && attributes[0].value == 'NTIS_VMS_Units'
      @destination = @vms
    end
    @buffer = ""
    @capture = @interested[name] == true
  end

  def end_element_namespace name, prefix, uri
    if name == 'vmsUnitRecord'
      @unit['uid'] = @uid
      @uid = @uid + 1
      @destination.push @unit
      @unit['guid'] = @guid
    elsif name == 'latitude'
      @unit['latitude'] = @buffer.to_f.round(5)
    elsif name == 'longitude'
      @unit['longitude'] = @buffer.to_f.round(5)
    elsif name == 'vmsUnitIdentifier'
      @unit['id'] = @buffer
    elsif name == 'vmsUnitElectronicAddress'
      @unit['electronicAddress'] = @buffer
    elsif name == "distanceAlong"
      @unit['distanceAlong'] = @buffer.to_i
    elsif name == 'linearElementIdentifier'
      @unit['link'] = @buffer.to_i
    elsif name == 'maxNumberOfCharacters'
      @unit['width'] = @buffer.to_i
    elsif name == 'maxNumberOfRows'
      @unit['height'] = @buffer.to_i
    elsif name == 'vmsDescription'
      @unit['type'] = @buffer.strip
    end
  end

  def characters(string)
    if @capture
      @buffer = @buffer + string
    end
  end
end

doc = MyDoc.new
parser = Nokogiri::HTML::SAX::Parser.new(doc)
parser.parse(File.open(data_dir('NTISModel-VMSTables-2016-03-29-v4.1.xml'), 'rb'))

doc.vms = doc.vms.select do |it|
  !(it['id'].include?("$"))
end

def assign_angles (arr)
  roads = Roads.new
  arr.each do |it|
    it['angle'] = roads.get_angle(it['link'],  it['distanceAlong'])
  end
end

assign_angles(doc.vms);
assign_angles(doc.signals);

File.write(data_dir('vms'), doc.vms.to_json)
File.write(data_dir('signals'), doc.signals.to_json)

def build_ids(arr)
  h = Hash.new
  arr.each {|it| h[it['guid']] = it['uid'] }
  h
end

#File.write(data_dir('signs-ids'), build_ids([*doc.vms, *doc.signals]).to_json)

