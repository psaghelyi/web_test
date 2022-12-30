require 'net/http'


class ApplicationController < ActionController::API
    
    def index
        render :plain => 'Hello, World!'
    end

    def wait
        ms = params[:ms].presence || '200'
        sleep(ms.to_i/1000)
        render :plain => ms
    end

    def relay
        ms = params[:ms].presence || '0'
        begin
            res = Net::HTTP.get_response(URI.parse('http://echo:8080/wait?ms=' + ms))
            if res.is_a?(Net::HTTPSuccess)
                render :plain => res.body, :status => 200
            else
                render :nothing => true, :status => 400
            end
        rescue => exception
            puts exception
            render :nothing => true, :status => 500
        end
    end

end
