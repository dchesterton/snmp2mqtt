# snmp2mqtt

Expose SNMP sensors to MQTT.

## config.yml

```yaml
log: debug                     # Optional: debug, info, warning or error (default: info)

mqtt:
  host: 192.168.1.5            # Optional: broker URL or IP address (default: localhost)
  port: 1884                   # Optional: broker port (default: 1883 or 8883 for TLS connections)
  username: my_user            # Optional: broker user (default: none)
  password: my_password        # Optional: broker password (default: none)
  client_id: snmp2mqtt         # Optional: client ID (default: random)
  keepalive: 30                # Optional: keepalive in seconds (default: 10)
  retain: true                 # Optional: retain (default: true)
  qos: 2                       # Optional: QoS (default: 0)
  ca: /cert/ca.pem             # Optional: CA for TLS connection
  cert: /cert/cert.pem         # Optional: certificate for TLS connection
  key: /cert/key.pem           # Optional: private key for TLS connection

homeassistant:
  discovery: true              # Optional: enable Home Assistant discovery (default: false)
  prefix: "home-assistant"     # Optional: Home Assistant MQTT topic prefix (default: homeassistant)

targets:
  - host: 192.168.0.2                 # Required: target IP address
    name: Raspberry Pi                # Optional: target name
    scan_interval: 30                 # Optional: fetch interval in seconds (default: 10)
    device_manufacturer: Raspberry Pi # Optional: set the device manufacturer in Home Assistant
    device_model: 3 Model B           # Optional: set the device model in Home Assistant
    auth_key: password                # Optional: set the auth password for SNMPv3
    auth_protocol: sha                # Optional: set the auth protocol for SNMPv3, one of sha or md5
    priv_key: password                # Optional: set the privilege password for SNMPv3
    priv_protocol: des                # Optional: set the privilege protocol for SNMPv3, one of des, aes, aes256b or aes256r
    version: "3"                      # Optional: 1, 2c or 3 (default: 1)
    sensors:
      - oid: 1.3.6.1.2.1.25.1.1.0     # Required: SNMP oid
        name: Raspberry Pi Uptime     # Required: sensor name
        unit_of_measurement: days     # Optional: set the unit of measurement in Home Assistant
        transform: "value / 6000"     # Optional: a transforma function written in JavaScript
        icon: mdi:calendar-clock      # Optional: set an icon in Home Assistant
        binary_sensor: false          # Optional: expose the sensor as a binary sensor in Home Assistant

  - host: 192.168.0.3
    name: Raspberry Pi 2
    version: 2c
    sensors:
      - oid: 1.3.6.1.2.1.25.1.1.0
        name: Raspberry Pi 2 Uptime
        unit_of_measurement: days
        transform: "Math.floor(value / 6000 / 60 / 24)"
        icon: mdi:calendar-clock

      - oid: 1.3.6.1.4.1.2021.11.11.0
        name: Raspberry Pi 2 CPU
        unit_of_measurement: '%'
        transform: "100 - value"
        icon: mdi:cpu-64-bit
```

## Running the app

The easiest way to run the app is via Docker Compose, e.g.

```yaml
version: "3"
services:
  snmp2mqtt:
    container_name: snmp2mqtt
    image: dchesterton/snmp2mqtt:latest
    restart: unless-stopped
    volumes:
      - ./config.yml:/app/config.yml
```

## Buy Me A ~~Coffee~~ Beer 🍻

A few people have kindly requested a way to donate a small amount of money. If you feel so inclined I've set up a "Buy Me A Coffee"
page where you can donate a small sum. Please do not feel obligated to donate in any way - I work on the app because it's
useful to myself and others, not for any financial gain - but any token of appreciation is much appreciated 🙂

<a href="https://www.buymeacoffee.com/dchesterton"><img src="https://img.buymeacoffee.com/api/?url=aHR0cHM6Ly9pbWcuYnV5bWVhY29mZmVlLmNvbS9hcGkvP25hbWU9ZGNoZXN0ZXJ0b24mc2l6ZT0zMDAmYmctaW1hZ2U9Ym1jJmJhY2tncm91bmQ9ZmY4MTNm&creator=dchesterton&is_creating=building%20software%20to%20help%20create%20awesome%20homes&design_code=1&design_color=%23ff813f&slug=dchesterton" height="240" /></a>
