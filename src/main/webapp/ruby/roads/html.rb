require 'json'
require 'cgi'

load 'core.rb'

links = JSON.parse(File.read(data_dir("roads-raw")))

type_map = Hash.new
type_map['mainCarriageway'] = 0
type_map['entrySlipRoad'] = 1
type_map['exitSlipRoad'] = 2
type_map['roundabout'] = 3

links.each_with_index do |it, index|
  it['i'] = index
end
puts links.length

links.sort! {|a,b| a['name'] <=> b['name']}
page = 1
index = 0
pages = []
for i in 1.. (links.length / 500).floor
  pages.push("<a href=\"roads-#{i.to_s.rjust(3,'0')}.html\">#{i}</a>")
end

while index < links.length
  result = []

  for i in 1..500
    link = links[index]
    if link == nil
      break
    end
    result.push "<tr><td>#{CGI.escapeHTML(link['name'])}</td>"
    result.push "<td><a href=\"./#/road/#{link['i']}\">Show on map</a></td></tr>"
    index = index + 1
  end

  input = File.read('../templates/roads.html')
  input.sub!('${pages}', pages.join("\n"))

  input.sub!('${content}', result.join("\n"))
  File.write("../roads-#{page.to_s.rjust(3,'0')}.html", input)

  page = page + 1
end

