require 'polylines'
require 'json'
require 'haversine'

load 'signs/layout.rb'
load 'core.rb'

load 'coordinates.rb'
load 'roads/get.rb'

load 'grid.rb'

class Signs
  def initialize
    @qt = Grid.new(100)
    @calc = CoordinatesCalc.new
    @font_size = 16
    @signal_width = 29

  end

  def to_radians(deg)
    deg / 180.0 * Math::PI
  end

  # Join together likely signs including A/J and B/L exit slip roads
  def get_hash_id(sign)
    order = Hash.new

    #  --/J       K\--
    # -------A->-------
    # -----<-B--------
    # --\M        L/--

    order['A'] = 1
    order['J'] = 1

    order['K'] = 4

    order['B'] = 3
    order['L'] = 3

    order['M'] = 4

    match = /(.*)\/(\d+)([A-Z])(.*)/.match(sign['id'])
    if match == nil
      puts "cannot parse #{sign['id']}"
    end
    hash = "#{match[1]},#{match[2]},#{order[match[3]]}"
    hash
  end

  # build likely groups used standard hash
  def build_groups
    puts "Group by ID"
    signals = JSON.parse(File.read(data_dir("signals")))
    vms = JSON.parse(File.read(data_dir("vms")))

    types = Hash.new
    vms.each do |it|
      if it['type'].include?("4x13")
        it['type'] = it['type'] + " MS4"
      end
      types[it['type']] = true
    end

    groups = Hash.new
    vms.each do |it|
      id = get_hash_id(it)
      group = groups[id]
      if group == nil
        group = Array.new
        groups[id] = group
      end
      group.push it
    end

    signals.each do |it|
      id = get_hash_id(it)
      group = groups[id]
      if group == nil
        group = Array.new
        groups[id] = group
      end
      group.push it
    end

    groups = group_by_location(groups)
    groups.values.collect do |it|
      f = Hash.new
      f['group'] = it
      f
    end

  end

  def group_by_location(groups)
    puts "Group by location"
    cohosted = Array.new

    groups.values.each_with_index do |a, i|
      if i % 100 == 0
        puts "#{(i.to_f / groups.values.length.to_f * 100.0).round} %"
      end
      groups.values.each_with_index do |b, j|

        if i > j
          if (a[0]['latitude'] - b[0]['latitude']).abs > 0.05 ||
          (a[0]['latitude'] - b[0]['latitude']).abs > 0.05
            next
          end
          a_ids = get_group_ids(a)
          b_ids = get_group_ids(b)
          if a_ids['A'] && b_ids['B']
            next
          end
          if b_ids['A'] && a_ids['B']
            next
          end

          distance = Haversine.distance(a[0]['latitude'], a[0]['longitude'], b[0]['latitude'],b[0]['longitude']).to_meters.abs.round

          if distance < 15
            puts "#{a[0]['id']} #{b[0]['id']} #{distance}"
            cohosted.push([a,b])
          end
        end
      end
    end

    cohosted.each do |pair|
      source = get_hash_id(pair[0][0])
      destination = get_hash_id(pair[1][0])
      groups[destination] = groups[destination].concat groups[source]
      groups.delete(source)
    end

    groups
  end

  def get_group_ids(group)
    letters = group.map {|it| /.*\/\d+(.).*/.match(it['id'])[1]}
    hash = Hash.new
    letters.each {|it| hash[it] = true }
    hash
  end

  def get_gantry_width(group)
    char_width = @font_size * 0.7
    width = 0
    group.each do |it|
      if it['width'] != nil
        width += it['width'] * char_width + 4
      else
        width += @signal_width
      end
    end
    width
  end

  def get_gantry_height(group)
    height = 0
    line_height = @font_size + 2
    signal_height = @signal_width * 114.0 / 122.0
    group.each do |it|
      if it['height'] != nil
        height = [height, 4 + line_height * it['height']].max
      else
        height = [height, signal_height].max
      end
    end
    height
  end

  def assign_positions(groups)
    #put smaller groups earlier in list so they get better positions
    groups.sort! do |a,b|
      a['group'].length <=> b['group'].length
    end

    groups.each_with_index do |it,index|

      it['id'] = index
      group = it['group']
      pos1 = [group[0]['latitude'],group[0]['longitude']]

      sign_width = get_gantry_width(group)
      sign_height = get_gantry_height(group)

      it['width_m'] = 3 * sign_width.round
      it['height_m'] = 3 * sign_height.round
      it['angle'] = (group[0]['angle'] - 90)
      sign_offset = 1.5 * sign_width.to_f * Math.sin(to_radians(it['angle'])).abs

      # signs on vertical roads need to be further away as they might cover the road
      distance = 50 + sign_offset

      it['distance'] = distance

      it['pos1'] = pos1
      it['pos2'] = [0,0] # dummy

    end

  end

  def get_rcc(sign)
    elec_addr = /(\d+)\/.*/.match(sign['electronicAddress'])
    elec_addr[1].to_i(8)
  end
  
  # final content for JSON
  def build_content(groups)
    out = Array.new
    id_map = JSON.parse(File.read(data_dir("road-ids")))

    i = 0
    groups.each do |it|
      obj = Hash.new
      group = Array.new

      it['group'].each do |it|
        group.push({id: it['uid'], gid: it['id'],type: it['type'],
          w: it['width'], h: it['height'], rcc: self.get_rcc(it)})
      end

      order = Hash.new
      order['J'] = 1
      order['K'] = 2
      order['L'] = 3
      order['M'] = 4
      order['A'] = 5
      order['B'] = 6

      group.sort! do |a,b|
        a_id = a[:gid]
        # M60/5555J1, M60/5555A, M60/5555A2
        match_a = /.*\/\d+([A-Z])(.*)/.match(a[:gid])
        match_b = /.*\/\d+([A-Z])(.*)/.match(b[:gid])
        a_id ="#{order[match_a[1]]}#{match_a[2]}"
        b_id ="#{order[match_b[1]]}#{match_b[2]}"
        a_id <=> b_id
      end
      pos1 = it['pos1']
      pos2 = it['pos2']
      packed = [[pos1[0], pos1[1]], [pos2[0], pos2[1] ]]

      @qt.insert(pos1[1], pos1[0], i)
      @qt.insert(pos2[1], pos2[0], i)

      obj['g'] = Polylines::Encoder.encode_points(packed)
      obj['group'] = group;
      obj['road'] = id_map[it['group'][0]['link'].to_s]
      obj['d'] = it['group'][0]['angle'].round

      out.push obj
      i = i + 1
    end
    out
  end

  def doit
    groups = build_groups

    assign_positions(groups)
    Layout.new.doit(groups)

    wrapper = Hash.new
    wrapper['content'] = build_content(groups)
    wrapper['index'] = @qt.harvest
    File.write(app_dir("signs"), wrapper.to_json)
  end

end

Signs.new.doit