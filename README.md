# snmp2mqtt

Expose SNMP sensors to MQTT.

## config.yml

```
log: debug

mqtt:
  host: localhost # Optional: MQTT server URL (default: "localhost")
  port: 1883 # Optional: defaults to 1883
  username: my_user # Optional: MQTT server authentication user (default: nothing)
  password: my_password # Optional: MQTT server authentication password (default: nothing)
  client_id: snmp2mqtt # Optional: MQTT client ID (default: random)
  keepalive: 30 # Optional: MQTT keepalive in seconds (default: 10)
  retain: true # Optional: MQTT retain (default: true)
  qos: 2 # Optional: MQTT QoS (default: 0)
  ca: /cert/ca.pem # Optional: CA for secure TLS connection
  cert: /cert/cert.pem # Optional: certificate for secure TLS connection
  key: /cert/key.pem # Optional: private ky for secure TLS connection

homeassistant:
  discovery: true # Optional: enable Home Assistant discovery (default: false)
  prefix: "home-assistant" # Optional: Home Assistant MQTT topic prefix (default: homeassistant)

targets:
  - host: 192.168.0.2
    name: Raspberry Pi
    scan_interval: 30 # fetch interval in seconds (defaults to 10)
    device_manufacturer: Raspberry Pi
    device_model: 3 Model B
    version: 2c
    sensors:
      - oid: 1.3.6.1.2.1.25.1.1.0
        name: Raspberry Pi Uptime
        unit_of_measurement: days
        transform: "Math.floor(value / 6000 / 60 / 24)"
        icon: mdi:calendar-clock

      - oid: 1.3.6.1.4.1.2021.11.11.0
        name: Raspberry Pi CPU
        unit_of_measurement: '%'
        transform: "100 - value"
        icon: mdi:cpu-64-bit

  - host: 192.168.0.3
    name: Raspberry Pi 2
    version: 3
    username: admin
    auth_key: password
    auth_protocol: sha|md5
    priv_key: password
    priv_protocol: des|aes|aes256b|aes256r
    version: "3"
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

```
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
