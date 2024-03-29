require 'net/http'
require 'thread'
require 'benchmark'

Rails.application.configure do
    config.after_initialize do
        stdout_logger = ActiveSupport::TaggedLogging.new(Logger.new(STDOUT))
        stdout_logger.level = Logger::INFO
        stdout_logger.formatter = Rails.logger.formatter
        #Rails.logger.extend(ActiveSupport::Logger.broadcast(stdout_logger))
    end
end

class ApplicationController < ActionController::API
    
    before_action :no_cache
    
    # /
    def index
        render :plain => 'Hello from RoR!'
    end

    # /wait?ms=1000
    def wait
        ms = params[:ms].presence || '200'
        sleep (ms.to_f/1000.0)
        render :plain => ms
    end

    # /relay?ms=1000
    def relay
        target = params[:target].presence || 'http://echo:8080'
        begin
            res = nil
            elapsed = Benchmark.ms {
                res = Net::HTTP.get_response(URI.parse(target))
            }
            if res.is_a?(Net::HTTPSuccess)
                render :plain => elapsed.round.to_s, :status => 200
            else
                render :nothing => true, :status => 400
            end
        rescue => exception
            puts exception
            render :nothing => true, :status => 500
        end
    end

    # /batch_relay?ms=1000&batch=10
    def batch_relay
        target = params[:target].presence || 'http://echo:8080'
        threads = []
        begin
            succeed = true
            elapsed = Benchmark.ms {
                for b in 1..params[:batch].to_i do
                    threads << Thread.new { 
                        res = Net::HTTP.get_response(URI.parse(target))
                        if not res.is_a?(Net::HTTPSuccess)
                            succeed = false
                        end
                    }                    
                end
                threads.each(&:join)
            }
            if succeed
                render :plain => elapsed.round.to_s, :status => 200
            else
                render :nothing => true, :status => 400
            end
        rescue => exception
            puts exception
            render :nothing => true, :status => 500
        end
    end

    
    
    private

    def no_cache
        response.headers["Last-Modified"] = Time.now.httpdate
        response.headers["Expires"] = "0"

        # HTTP 1.0
        response.headers["Pragma"] = "no-cache"

        # HTTP 1.1 'pre-check=0, post-check=0' (IE specific)
        response.headers["Cache-Control"] = 
            "no-store, no-cache, must-revalidate, max-age=0, pre-check=0, post-check=0"
    end

end
