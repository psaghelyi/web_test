require 'net/http'
require 'benchmark'


class ApplicationController < ActionController::API
    
    before_action :no_cache

    def index
        render :plain => 'Hello from RoR!'
    end

    def wait
        ms = params[:ms].presence || '200'
        sleep (ms.to_f/1000.0)
        render :plain => ms
    end

    def relay
        ms = params[:ms].presence || '0'
        begin
            res = nil
            elapsed = Benchmark.ms {
                res = Net::HTTP.get_response(URI.parse('http://echo:8080/wait?ms=' + ms))
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


    private

    def no_cache
        response.headers["Last-Modified"] = Time.now.httpdate
        response.headers["Expires"] = 0

        # HTTP 1.0
        response.headers["Pragma"] = "no-cache"

        # HTTP 1.1 'pre-check=0, post-check=0' (IE specific)
        response.headers["Cache-Control"] = 'no-store, no-cache, must-revalidate,
        max-age=0, pre-check=0, post-check=0'
    end
end
