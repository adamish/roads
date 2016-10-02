load 'sign-settings/read-signals.rb'
load 'sign-settings/read-vms.rb'
load 'core.rb'
load 'fetch.rb'

Fetch.fetch('http://hatrafficinfo.dft.gov.uk/feeds/datex/England/VariableMessageSign/content.xml',
data_dir('dynamic-vms.xml')) {|it|puts 'done'}

Fetch.fetch('http://hatrafficinfo.dft.gov.uk/feeds/datex/England/MatrixSignals/content.xml',
data_dir('dynamic-signals.xml')) {|it|puts 'done'}

output1 = ReadSignals.new.read
output2 = ReadVms.read
output = output1.concat output2


send_to_app("sign-settings", {content: output}.to_json)
