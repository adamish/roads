class QuadTree
  def initialize(x0, y0, x1, y1)
    @root = QuadNode.new(x0, y0, x1, y1, 250, 0)
  end

  def insert(x, y, id)
    @root.insert(QuadData.new(x, y, id))
  end

  def harvest
    @root.harvest
  end
end

class QuadData
  attr_accessor :x
  attr_accessor :y
  attr_accessor :id
  def initialize(x, y, id)
    @x = x
    @y = y
    @id = id
  end
end

class QuadNode
  def initialize(x0, y0, x1, y1, max, depth)
    @children = Array.new
    @x0 = x0
    @y0 = y0
    @x1 = x1
    @y1 = y1
    @max = max
    @nodes = Array.new
    @depth = depth
  end

  def contains(data)
    data.x > @x0 && data.x < @x1 && data.y > @y0 && data.y < @y1
  end

  def insert(data)
    if @nodes.length == 0
      if @children.length < @max
        @children.push(data)
      else
        self.split()
      end
    else
      @nodes.each do |node|
        if node.contains(data)
          node.insert(data)
        end
      end
    end
  end

  def split
    xm = (@x0 + @x1) / 2.0
    ym = (@y0 + @y1) / 2.0
    new_depth = @depth + 1
    @nodes.push(QuadNode.new(@x0, @y0, xm, ym, @max, new_depth)) # bottom left
    @nodes.push(QuadNode.new(xm, @y0, @x1, ym, @max, new_depth)) # bottom right
    @nodes.push(QuadNode.new(@x0, ym, xm, @y1, @max, new_depth)) # top left
    @nodes.push(QuadNode.new(xm, ym, @x1, @y1, @max, new_depth)) # top right

    @children.each do |data|
      matched = 0
      @nodes.each do |node|
        if node.contains(data)
          node.insert(data)
          matched = matched + 1
        end
      end
    end
    #puts "Split into #{@nodes}"

    @children.clear()
  end

  def ids
    ids = @children.collect {|it| it.id}
    ids_unique = Hash.new
    ids.each do |id|
      ids_unique[id] = true
    end
    ids_unique.keys
  end

  def harvest
    result = Array.new
    result.push(self.ids)
    @nodes.each do |node|
      result.push(node.harvest)
    end
    result
  end

  def to_s
    "[(#{@x0},#{@y0}),(#{@x1},#{@y1}) #{@children.length}]"
  end
end