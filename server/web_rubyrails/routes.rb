Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
  root "application#index"

  get '/wait' => 'application#wait'

  get '/relay' => 'application#relay'

  get '/batch_relay' => 'application#batch_relay'
end
