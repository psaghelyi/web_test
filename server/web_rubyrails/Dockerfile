FROM rails_base

RUN gem install unicorn

ADD application_controller.rb app/controllers/
ADD routes.rb config/
ADD unicorn.rb config/

CMD ["unicorn", "-c", "config/unicorn.rb"]
