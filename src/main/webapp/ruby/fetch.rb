require 'net/http'
require 'json'
require 'time'
require 'open-uri'

load 'core.rb'

class Fetch
  def self.fetch(url, local_file, &callback)
    match = /(http:\/\/)(.*?)(\/.*)/.match(url)
    host = match[2]
    resource = match[3]
    local_file_time = 0
    if File.exists?(local_file)
      local_file_time = File.mtime(local_file)
    end
    Net::HTTP.start(host) do |http|
      http.open_timeout = 20
      http.read_timeout = 20
      req = Net::HTTP::Head.new(resource)
      result = http.request(req)
      time = Time.parse(result['last-modified'])
      if local_file_time.to_i < time.to_i
        puts "#{url}: New file available: server #{time} vs local #{local_file_time}"
        puts "#{url}: Downloading"
        o = open(url).read

        File.open(local_file, 'w') {|f| f.write(o.force_encoding('UTF-8')) }
        yield callback
      else
        puts "#{url}: New file NOT available: server #{time} vs local #{local_file_time}"
        #yield callback

      end
    end
  end
end

