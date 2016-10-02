require 'nokogiri'
require 'json'
require 'time'

load 'fetch.rb'
load 'core.rb'

class MyDoc < Nokogiri::XML::SAX::Document
  attr_accessor :outs
  def initialize
    @outs = Array.new
    @out = nil
    @buffer = ""
    @interested = Hash.new
    @interested['situation'] = true
    @interested['situationRecordVersionTime'] = true
    @interested['comment'] = true
    @interested['latitude'] = true
    @interested['longitude'] = true
    @interested['value'] = true

  end

  def start_element_namespace name, attributes, prefix, uri, ns

    if name == "situation" then
      @out = Hash.new
    end
    @buffer = ""
    @capture = @interested[name] == true
  end

  def end_element_namespace name, prefix, uri
    if name == 'situation'
      @outs.push @out
    elsif name == 'situationRecordVersionTime'
      @out['timestamp'] = Time.iso8601(@buffer).to_i
    elsif name == 'comment'
      @out['description'] = /(.*?)Link to.*/m.match(@buffer)[1].strip
    elsif name == 'latitude'
      @out['latitude'] = @buffer
    elsif name == 'longitude'
      @out['longitude'] = @buffer
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
  parser.parse(File.open(data_dir('unplanned-events.xml'), 'rb'))

  send_to_app("unplanned-events", {content: doc.outs}.to_json)

end

Fetch.fetch('http://hatrafficinfo.dft.gov.uk/feeds/datex/England/UnplannedEvent/content.xml',
data_dir('unplanned-events.xml')) {|it|process()}

