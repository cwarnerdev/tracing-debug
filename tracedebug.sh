#!/bin/bash

# Run the other shell script and capture the output
output=$(./all.sh 2>&1)

# Extract the last line from the output
last_line=$(echo "$output" | tail -n 1)

# Use regex to extract the transaction hash
if [[ $last_line =~ Transaction\ Hash:\ ([0-9a-fA-Fx]+) ]]; then
    tx_hash=${BASH_REMATCH[1]}

    echo "Extracted Transaction Hash: $tx_hash"

    # Run the curl command using the extracted transaction hash
    curl -sL   -H "Content-Type:application/json;charset=utf-8"   -d "{
          \"jsonrpc\": \"2.0\",
          \"id\": 1,
          \"method\": \"debug_traceTransaction\",
          \"params\": [
              \"$tx_hash\",
              { \"tracer\": \"callTracer\"}
          ]
      }" http://localhost:8545 | jq
else
    echo "Transaction Hash not found in the output!"
    echo $last_line
    exit 1
fi