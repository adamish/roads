require 'nokogiri'
require 'json'
require 'time'

load 'core.rb'

class ReadVms
  class MyDoc < Nokogiri::XML::SAX::Document
    attr_accessor :units
    def initialize
      @units = Array.new
      @unit = nil
      @buffer = ""
      @interested = Hash.new
      @interested['timeLastSet'] = true
      @interested['vmsTextLine'] = true
      @interested['pictogramCode'] = true
      @interested['pictogramDescription'] = true
      @interested['speedAttribute'] = true
      @interested['pictogramDescriptionUK'] = true
      @level = 0

    @matrices = Hash.new
    @matrices[1]='off'
    @matrices[2]='nr'
    @matrices[3]='re'
    @matrices[4]='stop'
    @matrices[5]='20'
    @matrices[6]='30'
    @matrices[7]='40'
    @matrices[8]='50'
    @matrices[9]='60'
    @matrices[10]='70'
    @matrices[10]='80'
    @matrices[11]='90'
    @matrices[12]='100'
    @matrices[13]='120'

    @matrices[14]='ldr'
    @matrices[15]='redx'
    @matrices[16]='ldl'
    @matrices[17]='mdl'

    @matrices[21]='1t'
    @matrices[22]='t1'
    @matrices[23]='tt1'
    @matrices[24]='t11'
    @matrices[25]='1tt'
    @matrices[26]='11t'
    @matrices[27]='open'

    @matrices[37]='20r'
    @matrices[38]='30r'
    @matrices[39]='40r'
    @matrices[40]='50r'
    @matrices[41]='60r'
    @matrices[42]='70r'
    @matrices[43]='80r'
    @matrices[44]='90r'
    @matrices[45]='100r'
    @matrices[46]='120r'

    @matrices[52]='ldl'
    @matrices[54]='ldl'

   @matrices[56]='tt'

   @matrices[59]='redx'

   @matrices[255]='udf'

    end



    def start_element_namespace name, attributes, prefix, uri, ns

      if name == "vmsUnitReference" then
        @unit = Hash.new
        @units.push @unit
        @unit['value'] = Array.new
        if attributes[2].localname == 'id'
          @unit['id']=attributes[2].value
        end
      elsif name == 'vmsTextLine' then
        @level = @level + 1
      end
      @buffer = ""
      @capture = @interested[name] == true
    end

    def end_element_namespace name, prefix, uri
      if name == 'vmsTextLine'
        if @level == 2 then
          strip = @buffer.strip
          matches = /(SY\d+) (.*)/i.match(strip)
          if matches == nil
            if strip.length > 0
              @unit['value'].push strip
            end
          else
            @unit['value'].push matches[1]
            @unit['value'].push matches[2].strip
          end
        end
        @level = @level - 1
      elsif name == 'timeLastSet'
        @unit['time'] = Time.iso8601(@buffer).to_i
      elsif name == 'pictogramCode'
        @unit['value'] = @buffer
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
    parser.parse(File.open(ARGV[0], 'rb'))

    id_map = JSON.parse(File.read(data_dir("signs-ids")))

    doc.units.each do |it|
      guid = it['id']
      id = id_map[guid]
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

r=ReadVms
r.read.select {|it| it['value2'] and ! it['value2'].include?('blank')}.each do |it|
  puts "#{it['value']} #{it['value2']} #{it['value3']} #{it['value4']}"
end
