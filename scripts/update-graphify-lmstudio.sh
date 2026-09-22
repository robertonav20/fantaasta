#!/bin/bash

# Setup script for configuring Graphify with LM Studio
# This script sets up the environment variables and configurations needed

echo "Setting up Graphify with LM Studio integration..."

# Set environment variables for LM Studio
export OPENAI_BASE_URL=http://localhost:1234/v1
export OPENAI_API_KEY=test
export OPENAI_MODEL=spark-x2.5-1.7b

# Configure Graphify to use local LLM
echo "Updating Graphify for LM Studio..."
graphify update .
