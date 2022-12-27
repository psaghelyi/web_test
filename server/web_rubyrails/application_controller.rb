require 'net/http'


class ApplicationController < ActionController::API
    
    URI_ECHO = URI('http://echo:8080/wait')
        
    def index
        render plain: 'Hello, World!'
    end

    def wait
        sleep(0.2)  # 200ms
        render plain: 'wait'
    end

    def relay
        begin
            res = Net::HTTP.get_response(URI_ECHO)
            render plain: res.body if res.is_a?(Net::HTTPSuccess)
        rescue => e
            render :status => 500
        end
    end

end
