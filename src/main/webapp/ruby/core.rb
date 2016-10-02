def app_dir(file)
  '../app/' + file
end
def app_dir_tmp(file)
  '../app-tmp/' + file
end
def data_dir(file)
  '../tmp/' + file
end


def send_to_app(filename, content)
  begin
    Dir.mkdir(app_dir_tmp(""))
  rescue
    #puts "error making tmp dir"
  end
  File.write(app_dir_tmp(filename), content)
  system("gzip -c #{app_dir_tmp(filename)} > #{app_dir_tmp(filename)}.gz")
  File.rename(app_dir_tmp(filename), app_dir(filename))
  File.rename(app_dir_tmp("#{filename}.gz"), app_dir("#{filename}.gz"))
end