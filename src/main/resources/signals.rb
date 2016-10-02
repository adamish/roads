require 'RMagick'

include Magick

def has_lanterns(finput)
  without = ['off', 'open', 'nr', 'end', 'redx', 'stop', 'udf']
  no_lanterns = without.select do |it|
    finput.include? it
  end
  no_lanterns.length == 0
end

def render(finput, lanterns)
  gc = Magick::Draw.new

  input = Image.read(finput)[0]
  width = input.columns
  height = input.rows
  iview = input.view(0, 0, 13, 11)
  scale = 4
  bx = 35
  by = 35
  cw = width * scale + 2 * bx
  ch = height * scale + 2 * by
  out = Image.new(cw, ch) {
    self.background_color = '#222'
  }
  gc.fill_opacity(1)

  sx = scale / 2 + bx
  sy = scale / 2 + by
  pitch  = scale * 0.3
  stroke_width = 8
  if finput.include? "0r.png"
    gc.stroke("#ff0000")
    gc.stroke_width(stroke_width)
    gc.circle(cw / 2, ch / 2, cw/2, stroke_width / 2)
  else
    gc.stroke("#F7F700")
    gc.fill("#F7F700")

    gc.stroke_width(stroke_width)
    lin = 12
    lr = 5
    if has_lanterns finput
      if lanterns == "top" || lanterns == "both"
        gc.circle(lin, lin, lin + lr, lin)
        gc.circle(cw - lin, lin, cw - lin + lr, lin)
      elsif lanterns == "bottom" || lanterns == "both"
        gc.circle(lin, ch - lin, lin + lr, ch - lin)
        gc.circle(cw - lin, ch - lin, cw - lin + lr, ch - lin)
      end
    end
  end
  gc.stroke_width(1)
  for x in 0..12
    for y in 0..10
      pix = iview[y][x]
      if pix.red != 0 || pix.green !=0
        gc.stroke("rgb(#{pix.red},#{pix.green},#{pix.blue})")
        gc.fill("rgb(#{pix.red},#{pix.green},#{pix.blue})")
        gc.circle(sx + x * scale, sy + y * scale, sx + x * scale, sy + y * scale + pitch)
      else
        gc.stroke("#333")
        gc.fill("#333")
        gc.circle(sx + x * scale, sy + y * scale, sx + x * scale, sy + y * scale + pitch)
      end
    end
  end

  gc.stroke_width(3)
  gc.stroke("#AAA")
  gc.fill_opacity(0)
  # gc.rectangle(0, 0, cw-1, ch-1)

  gc.draw(out)
  out
end

Dir.foreach("signals") do |fname|
  if fname.include? ".png"
    a = render("signals/" + fname, "top")
    list = ImageList.new
    list.push a
    name = /(.*)\.png/.match(fname)[1]

    if has_lanterns fname
      b = render("signals/" + fname, "bottom")
      list.push b
      list.delay = 100
    end
    list.write("../webapp/img/s/" + name + ".gif")

    a = render("signals/" + fname, "both")
    list = ImageList.new
    list.push a
    list.write("png32:../webapp/img/s/" + name + ".png")

  end
end
