require 'haversine'
require 'json'

load 'coordinates.rb'
load 'roads/get.rb'

class Layout
  def initialize
    @grid_dx = 70.0
    @grid_dy = 80.0
  end

  def doit(signs)

    @coordinates = CoordinatesCalc.new

    @signs = signs

    @grid_w = (440000 / @grid_dx).ceil
    puts "grid width #{@grid_w}"
    @cells = self.get_road_map

    signs.each do |sign|
      sign['cells_w'] = self.get_cell_width(sign['width_m'])
      sign['cells_h'] = self.get_cell_height(sign['height_m'])
      self.snap(sign)
      g = self.grid(sign['pos2'])
      self.add_to_cell(g, sign['id'], sign['cells_w'], sign['cells_h'])
    end
    @id_map = Hash[@signs.map {|it| [it['id'], it]}]

  end

  def get_cell_width(width_m)
    x = width_m.to_f / @grid_dx.to_f
    cells = 1 + 2 * (x/2).round
    cells
  end

  def get_cell_height(height_m)
    y = height_m.to_f / @grid_dy.to_f
    cells = 1 + 2 * (y/2).round
    cells
  end

  def distance(sign)
    distance_p(sign['pos1'], sign['pos2'])
  end

  def distance_p(p1, p2)
    Haversine.distance(p1[0], p1[1], p2[0], p2[1]).to_meters
  end

  def find_empty_cell(sign)
    found = nil

    [50, 100, 400, 800, 1200, 1500, 2000].each do |max_distance|
      [0, -5, 5, -15, 15, -25, 25, -35, 35].each do |angle_adjust|
        start_distance = sign['distance']

        for distance in (start_distance..(start_distance.to_i + max_distance)).step(30)

          candidate = CoordinatesCalc.offset_coordinate(sign['pos1'][0], sign['pos1'][1],
          distance, sign['angle'] + angle_adjust)

          candidate_g = self.grid(candidate)

          snapped_distance = distance_p(sign['pos1'], self.grid_to_pos(candidate_g))
          #puts "Trying #{sign['group'][0]['id']} at #{distance}m at bearing #{sign['angle']} (#{candidate_g[0]},#{candidate_g[1]}) #{snapped_distance.to_i}"
          if self.cell_empty?(candidate_g, sign['cells_w'], sign['cells_h']) && snapped_distance >= sign['distance']
            found = candidate_g
            break
          end
        end
      end
      if found != nil
        break;
      end
    end
    if found == nil
      puts "could not find new location for #{sign['group'][0]['id']}"
    end
    found
  end

  def cell_empty?(center, width, height)
    empty_count = 0
    start_x = 0 - (width / 2).to_i
    start_y = 0 - (height / 2).to_i

    for x in start_x..(start_x + width-1) do
      for y in start_y..(start_y + height-1) do

        g = [center[0] + x, center[1] + y]
        index = self.index(g)
        array = @cells[index]
        if @cells[index.to_s] == false
          #puts "Cell used by road #{index}"
        else
          if (array == nil || array.length == 0)
            empty_count = empty_count + 1
          end
        end
      end
    end
    empty_count == (width * height)
  end

  def remove_from_cell(center, id, cells)
    start = 0 - (cells / 2).to_i

    for x in start..(start + cells-1) do
      g = [center[0] + x, center[1]]
      index = self.index(g)
      array = @cells[index]
      array.delete(id)
    end
  end

  def index(g)
    (g[1] * @grid_w) + g[0]
  end

  def add_to_cell(center, id, width, height)
    start_x = 0 - (width / 2).to_i
    start_y = 0 - (height / 2).to_i

    for x in start_x..(start_x + width-1) do
      for y in start_y..(start_y + height-1) do

        g = [center[0] + x, center[1] + y]
        index = self.index(g)
        array = @cells[index]
        if array == nil
          array = Array.new
          @cells[index] = array
        end

        array.push(id)
      end
    end
  end

  def grid(pos)
    os = @coordinates.wgs84_to_osgb36(pos)
    [(os[0] / @grid_dx).floor, (os[1] / @grid_dy).floor]
  end

  def grid_to_pos(g)
    @coordinates.osgb36_to_wgs84([(g[0] + 0.5) * @grid_dx, (g[1] + 0.5) * (@grid_dy)])
  end

  def snap(sign)
    cell = self.find_empty_cell(sign)
    if cell != nil
      sign['pos2'] = self.grid_to_pos(cell)
      back_again = self.grid(sign['pos2'])
      if !( back_again[0] == cell[0] && back_again[1] == cell[1] )
        puts "Remap fail original #{cell.to_json} new #{back_again.to_json} #{sign['cells_w']}"
      end
    end
  end

  def get_road_map
    if File.exist? data_dir("road-map.json")
      puts "Loading existing road map"
      return_value = JSON.parse(File.read(data_dir("road-map.json")))
    else
      puts "Building road map"
      return_value = Hash.new
      roads = Roads.new.get_data.each do |road|
        road['coordinates'].each do |c|
          index = self.index(self.grid(c))
          return_value[index] = false
        end
      end
      File.write(data_dir("road-map.json"), return_value.to_json)
    end
    return_value
  end
end

def build_sign(id, pos1, pos2, angle, distance)
  {'id' => id,'pos1' => pos1, 'pos2' => pos2,
    'angle' => angle, 'distance' => distance,
    'width_m' => 200,
    'height_m' => 600,
    'group' => [{'id' => 'M60/5555'}]}
end

Layout.new.doit([
  build_sign('a1', [50, -2], [50, -2], 90, 500),
  build_sign('a2', [51, -1], [51, -1], 90, 200),
  build_sign('a3', [52, 0], [52, 0], 90, 200),
  build_sign('a3b', [52, 0], [52, 0], 90, 200),
  build_sign('a4', [53, 1], [53, 1], 45, 200)])
