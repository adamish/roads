require 'proj4'
require 'json'

class CoordinatesCalc
  def initialize
    @osgb36 = Proj4::Projection.new('+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs')
    @wgs84 = Proj4::Projection.new('+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs')
  end

  # convert [x,y] to [lat,lon]
  def osgb36_to_wgs84(point)
    point = Proj4::Point.new(point[0], point[1])
    result = @osgb36.transform(@wgs84, point)
    [result.lat * 180.0 / Math::PI, result.lon * 180.0 / Math::PI]
  end

  # convert [lat,lon] to [x,y]
  def wgs84_to_osgb36(point)
    point = Proj4::Point.new(point[1] / 180.0 * Math::PI, point[0] / 180.0 * Math::PI)
    result = @wgs84.transform(@osgb36, point)
    [result.lon, result.lat]
  end

  def CoordinatesCalc.offset_coordinate(lat_deg, lon_deg, distance_m, bearing_deg)
    r = 6371000.0;
    lat = lat_deg * Math::PI / 180.0
    lon = lon_deg * Math::PI / 180.0
    bearing = bearing_deg * Math::PI / 180
    distance_by_r = distance_m / r
    lat2 = Math.asin( Math.sin(lat) * Math.cos(distance_by_r) +
    Math.cos(lat) * Math.sin(distance_by_r) *
    Math.cos(bearing) )

    lon2 = lon + Math.atan2(Math.sin(bearing) * Math.sin(distance_by_r) * Math.cos(lat),
    Math.cos(distance_by_r) - Math.sin(lat) * Math.sin(lat2))
    [180.0 * lat2 / Math::PI, 180.0 * lon2 / Math::PI]
  end

  def CoordinatesCalc.dms(d, m, s)
    d + m / 60.0 + s / 3600.0
  end

  def CoordinatesCalc.dms_to_s(dms)
    d = dms.floor
    m = (60 * (dms - d)).floor
    dm = d + (m / 60.0)
    s = (3600.0 * (dms - dm)).floor
    d.to_s + " " + m.to_s + " " + s.to_s
  end

end
