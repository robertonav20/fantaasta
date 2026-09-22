#!/bin/bash

# Setup script for configuring Graphify with LM Studio
# This script sets up the environment variables and configurations needed

echo "Setting up Graphify with LM Studio integration..."

# Set environment variables for LM Studio
export OPENAI_BASE_URL=http://localhost:1234/v1
export OPENAI_API_KEY=test
export OPENAI_MODEL=spark-x2.5-1.7b

# Configure Graphify to use local LLM
echo "Configuring Graphify for LM Studio..."
cd "$(dirname "$0")/.."
graphify extract src --out . --backend openai --max-concurrency 8 --batch-size=1000 --force
graphify cluster-only . --graph graphify-out/graph.json

graphify export html --graph graphify-out/graph.json
graphify export callflow-html --graph graphify-out/graph.json
graphify export svg --graph graphify-out/graph.json
graphify export wiki --graph graphify-out/graph.json

# GRAPHIFY_MAX_OUTPUT_TOKENS=16384 graphify extract . --mode deep --graph graphify-out/graph.json

echo "Setup complete. Graphify is now configured with LM Studio."