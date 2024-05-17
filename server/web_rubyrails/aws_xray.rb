Rails.application.config.xray = {
  name: 'web-rubyrails-xray-app',
  patch: %I[net_http aws_sdk],
  active_record: true
}