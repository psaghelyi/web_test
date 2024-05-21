Rails.application.config.xray = {
  name: 'web-rubyrails-xray-app',
  # 1
  sampling: true,
  patch: %I[net_http aws_sdk],
  active_record: true
}