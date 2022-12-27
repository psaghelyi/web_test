require 'net/http'


class ApplicationController < ActionController::API
    
    def index
        render plain: 'Hello, World!'
    end

    def wait
        ms = params[:ms].presence || '200'
        sleep(ms.to_i/1000)
        render plain: ms
    end

    def relay
        ms = params[:ms].presence || '0'
        begin
            res = Net::HTTP.get_response(URI.parse('http://echo:8080/wait?ms=' + ms))
            render plain: res.body if res.is_a?(Net::HTTPSuccess)
        rescue => exception
            puts exception
            render :status => 500
        end
    end

end
