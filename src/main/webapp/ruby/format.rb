require 'nokogiri'
source = File.read(ARGV[0])
doc = Nokogiri::XML source
File.write(ARGV[0] + "-format.xml", doc.to_xml)
