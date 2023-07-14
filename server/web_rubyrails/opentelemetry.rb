require 'opentelemetry/sdk'
require 'opentelemetry/exporter/otlp'
require 'opentelemetry/instrumentation/all'
require 'opentelemetry/propagator/xray'


ENV['OTEL_PROPAGATORS'] ||= 'xray'
ENV['OTEL_TRACES_SAMPLER'] ||= 'xray'
ENV['OTEL_LOG_LEVEL'] ||= 'info'



OpenTelemetry::SDK.configure do |c|
  c.service_name = 'web-ruby'

  c.id_generator = OpenTelemetry::Propagator::XRay::IDGenerator
  c.propagators = [OpenTelemetry::Propagator::XRay::TextMapPropagator.new]

  c.use 'OpenTelemetry::Instrumentation::AwsSdk', {
    suppress_internal_instrumentation: true
  }

  c.use 'OpenTelemetry::Instrumentation::Rails'
  c.use 'OpenTelemetry::Instrumentation::Rack'
  c.use 'OpenTelemetry::Instrumentation::ActionPack'
  c.use 'OpenTelemetry::Instrumentation::ActiveSupport'
  c.use 'OpenTelemetry::Instrumentation::ActionView'
  # c.use 'OpenTelemetry::Instrumentation::ActiveRecord'

  c.use 'OpenTelemetry::Instrumentation::Faraday'

  # Alternatively, we could just enable all instrumentation:
  # c.use_all({ 'OpenTelemetry::Instrumentation::ActiveRecord' => { enabled: false } })
  
end
