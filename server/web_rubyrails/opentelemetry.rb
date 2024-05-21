require 'opentelemetry/sdk'
require 'opentelemetry/exporter/otlp'
require 'opentelemetry/instrumentation/all'
require 'opentelemetry/propagator/xray'

OpenTelemetry::SDK.configure do |c|
  c.service_name = 'web-rubyrails-otel'

  c.id_generator = OpenTelemetry::Propagator::XRay::IDGenerator
  c.propagators = [OpenTelemetry::Propagator::XRay::TextMapPropagator.new]

  c.use 'OpenTelemetry::Instrumentation::AwsSdk', { suppress_internal_instrumentation: true }
  c.use 'OpenTelemetry::Instrumentation::Rails'
  c.use 'OpenTelemetry::Instrumentation::Rack'
  c.use 'OpenTelemetry::Instrumentation::ActionPack'
  c.use 'OpenTelemetry::Instrumentation::ActiveSupport'
  c.use 'OpenTelemetry::Instrumentation::ActionView'
  c.use 'OpenTelemetry::Instrumentation::Net::HTTP'
  # c.use 'OpenTelemetry::Instrumentation::ActiveRecord'

  c.use 'OpenTelemetry::Instrumentation::Faraday'

  # Alternatively, we could just enable all instrumentation:
  # c.use_all({ 'OpenTelemetry::Instrumentation::ActiveRecord' => { enabled: false } })

end

# https://opentelemetry.io/docs/languages/ruby/instrumentation/
AppTracer = OpenTelemetry.tracer_provider.tracer('ror_app')