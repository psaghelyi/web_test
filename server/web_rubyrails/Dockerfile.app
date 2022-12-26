FROM rails_base

ADD config/unicorn.rb config/unicorn.rb

CMD ["unicorn", "-c", "config/unicorn.rb"]
