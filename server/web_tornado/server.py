import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
import time

from tornado.options import define, options

define("port", default=8080, help="run on the given port", type=int)


class IndexHandler(tornado.web.RequestHandler):
    def get(self):
        self.write("Hello from tornado")

class WaitHandler(tornado.web.RequestHandler):
    def get(self, x):
        time.sleep(int(x)/1000.)
        self.set_status(200)
        self.write(x)

def main():
    tornado.options.parse_command_line()
    application = tornado.web.Application([(r"/", IndexHandler),(r"/wait/([0-9]+)", WaitHandler)])
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    main()