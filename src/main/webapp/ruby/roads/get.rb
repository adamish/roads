require 'haversine'

load 'core.rb'

class Roads
  def initialize
    @data = JSON.parse(File.read(data_dir("roads-raw")))
    @map = Hash.new
    self.get
  end

  def get_data
    @data
  end

  def get
    @data.each do |it|
      @map[it['id']] = it
    end
    @map
  end

  def get_angle(link, distanceAlong)
    road = @map[link]
    if road == nil
      puts "cannot find #{link}"
    end
    path = road['coordinates']
    d = 0
    found = -1
    for i in 0..(path.length - 2)
      a = path[i]
      b = path[i+1]

      x0 = a[1]
      y0 = a[0]

      x1 = b[1]
      y1 = b[0]

      d = d + Haversine.distance(y0, x0, y1, x1).to_meters
      if d > distanceAlong
        found = i
        break
      end

    end
    if found == -1
      puts "Could not find VMS on link #{distanceAlong} distance so far #{d}. Assuming end"
      found = path.length - 2
    end

    a = path[found]
    b = path[found+1]

    x0 = b[1]
    y0 = b[0]

    x1 = a[1]
    y1 = a[0]

    dx = Haversine.distance(y0, x0, y0, x1).to_meters
    if x0 < x1
      dx = -dx
    end
    dy = Haversine.distance(y0, x0, y1, x0).to_meters
    if y0 < y1
      dy = -dy
    end

    a = Math.atan2(dy, dx) * 180 / Math::PI
    # +/-180 - angle anti-clockwise from x axis
    # 0 => 90
    # 90 => 0
    # 60 => 30
    # -60 => 150
    # -30 => 120
    # -120 => 210
    d = (0 - a) + 90 # clockwise from Y axis*
    if d < 0
      d = d + 360
    end
    if road['name'] == 'M60 clockwise between J27 and J1' || road['name'] == 'M60 anti-clockwise between J1 and J27'
      puts "#{road['name']} original #{a.round} heading #{d.round} (#{dx.round} #{dy.round})"
    end
    d.round(0)
  end

end