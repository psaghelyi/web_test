require 'aws-sdk-cloudwatchlogs'
class CwLogger < Logger
  def initialize(log_group_name)
    super(STDOUT)

    @log_group_name = log_group_name
    @log_stream_name = "kiskutya_#{Time.now.strftime('%Y-%m-%d')}/$[LATEST]/#{Time.now.to_i}"
    @cloudwatch_logs = Aws::CloudWatchLogs::Client.new
    create_log_stream_if_not_exist
  end

  def add(severity, message = nil, progname = nil, &block)
    severity ||= UNKNOWN
    message ||= block&.call || progname
    return true if severity < level

    message = format_message(severity, Time.now, progname, message)
    super(severity, message)

    @cloudwatch_logs.put_log_events(
      log_group_name: @log_group_name,
      log_stream_name: @log_stream_name,
      log_events: [
        {
          timestamp: Time.now.to_i * 1000,
          message: message
        }
      ]
    )
    true
  end

  def format_message(severity, timestamp, progname, message)
    "#{timestamp} #{severity} -- #{progname}: #{message}\n"
  end

  def create_log_stream_if_not_exist
    begin
      @cloudwatch_logs.create_log_stream(
        log_group_name: @log_group_name,
        log_stream_name: @log_stream_name
      )
    rescue Aws::CloudWatchLogs::Errors::ResourceNotFoundException => e
      puts "Error creating log stream: #{e.message}"
    end
  end

end