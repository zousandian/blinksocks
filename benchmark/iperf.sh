#!/usr/bin/env bash

# ./iperf.sh <client_conf> <server_conf> <seconds>

# [iperf -c] <----> [bs-client] <----> [bs-server] <----> [iperf -s]
#                      1081               1082               1083

client_conf=$1
server_conf=$2
seconds=$3

BLINKSOCKS="node bin/start.js"

export NODE_ENV=production

${BLINKSOCKS} -c ${client_conf} > /dev/null 2>&1 &
bs_client_pid=$!

${BLINKSOCKS} -c ${server_conf} > /dev/null 2>&1 &
bs_server_pid=$!

sleep 2

iperf3 -s -p 1083 > /dev/null 2>&1 &
iperf_pid=$!

sleep 1

iperf3 -c 127.0.0.1 -p 1081 -t ${seconds} -P 20 -J

# Wait for iperf server to receive all data.
sleep 3

kill -SIGINT ${bs_client_pid}
kill -SIGINT ${bs_server_pid}
kill -SIGINT ${iperf_pid}

# Wait for system gc
sleep 3
