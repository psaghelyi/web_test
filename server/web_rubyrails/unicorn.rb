# set path to the application
app_dir = File.expand_path("../..", __FILE__)
shared_dir = "#{app_dir}/shared"
working_directory app_dir

# Set unicorn options
worker_processes (ENV['WORKERS'] || '1').to_i
preload_app true
timeout 180

# Path for the Unicorn socket
#listen "/sockets/unicorn.sock"
listen "0.0.0.0:8080"

# Set path for logging
#stderr_path "#{shared_dir}/log/unicorn.stderr.log"
#stdout_path "#{shared_dir}/log/unicorn.stdout.log"

# Set proccess id path
#pid "#{shared_dir}/pids/unicorn.pid"

before_fork do |server, worker|
  Signal.trap 'TERM' do
    puts 'Unicorn master intercepting TERM and sending myself QUIT instead'
    Process.kill 'QUIT', Process.pid
  end

  defined?(ActiveRecord::Base) and
    ActiveRecord::Base.connection.disconnect!
end

after_fork do |server, worker|
  Signal.trap 'TERM' do
    puts 'Unicorn worker intercepting TERM and doing nothing. Wait for master to send QUIT'
  end

  defined?(ActiveRecord::Base) and
    ActiveRecord::Base.establish_connection
end
