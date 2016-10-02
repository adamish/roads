class Grid
  def initialize(gw)
    @gw = gw
    @children = Array.new
  end

  def insert(x, y, id)
    @children.push(GridData.new(x, y, id))
  end

  def harvest
    x0 = @children.min_by{|it| it.x }.x
    x0  = (x0 - 0.01).round(3)

    y0 = @children.min_by{|it| it.y }.y
    y0 = (y0 - 0.01).round(3)

    x1 = @children.max_by{|it| it.x }.x
    x1 = (x1 + 0.01).round(3)

    y1 = @children.max_by{|it| it.y }.y
    y1 = (y1 + 0.01).round(3)

    w = x1 - x0
    h = y1 - y0

    @gh = (h / (w / @gw)).floor

    puts "Grid width #{@gw}/ height #{@gh}"

    puts "#{x0},#{y0}),(#{x1},#{y1})"

    cw = (x1 - x0) / @gw
    ch = (y1 - y0) / @gh
    nodes = Array.new
    puts "#{cw} #{ch}"

    for j in 0..@gh-1
      for i in 0..@gw-1
        bx0 = x0 + cw * i
        by0 = y0 + ch * j
        bx1 = x0 + cw * (1 + i)
        by1 = y0 + ch * (1 + j)
        #puts "#{bx0},#{by0}),(#{bx1},#{by1})"

        nodes.push(GridNode.new(bx0, by0, bx1, by1))
      end
    end

    @children.each do |child|
      i = (@gw * (child.x - x0) / w).floor
      j = (@gh * (child.y - y0) / h).floor

      node_index = i + @gw * j

      nodes[node_index].insert(child)
    end

    result = Array.new
    nodes.each do |node|
      result.push(node.ids) #.collect { |it| it.to_s(36) })
    end

    # sparse test
    hash = Hash.new
    result.each_with_index do |it, i|
      if it.length > 0
        hash[i] = it
      end
    end

    puts "max bucket " + result.max_by{|it| it.length}.length.to_s

    unused = 0
    result = result.collect do |it|
      return_value = it
      if it.length == 0
        return_value = 0
        unused = unused + 1
      end
      return_value
    end

    wrapper = Hash.new
    wrapper['index'] = result
    wrapper['parameters'] = {x0: x0, y0: y0, x1: x1, y1: y1, gw: @gw, gh: @gh}

    puts "index size #{result.to_json.length.to_s} bytes"

    fill = 100 * (unused.to_f / result.length.to_f)
    puts "wasted space #{fill.round(1)} %"

    wrapper
  end
end

class GridData
  attr_accessor :x
  attr_accessor :y
  attr_accessor :id
  def initialize(x, y, id)
    @x = x
    @y = y
    @id = id
  end

  def to_s
    "#{x} #{y}"
  end
end

class GridNode
  def initialize(x0, y0, x1, y1)
    @children = Array.new
    @x0 = x0
    @y0 = y0
    @x1 = x1
    @y1 = y1
  end

  def contains(data)
    data.x > @x0 && data.x < @x1 && data.y > @y0 && data.y < @y1
  end

  def insert(data)
    if ! self.contains(data)
      puts data.to_s + " not in tree " + self.to_s
    end

    @children.push(data)
  end

  def ids
    ids = @children.collect {|it| it.id}
    ids_unique = Hash.new
    ids.each do |id|
      ids_unique[id] = true
    end
    ids_unique.keys
  end

  def to_s
    "[(#{@x0},#{@y0}),(#{@x1},#{@y1}) #{@children.length}]"
  end
end
