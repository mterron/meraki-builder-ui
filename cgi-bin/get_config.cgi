#!/bin/sh
# CONFIG_DIR='/etc/switch/'
CONFIG_DIR='..'
printf 'Content-type: text/json\n\n'
cat "$CONFIG_DIR/config.json"
