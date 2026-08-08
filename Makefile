.PHONY: help run setup validator dev tracer clean

# Default rule when running `make`
help:
	@echo "Available commands:"
	@echo "  make run         - Start EVERYTHING (validator, backend, and frontend) with a single command"
	@echo "  make dev         - Run Express backend server and Vite frontend concurrently"
	@echo "  make validator   - Start local Solana test validator only"
	@echo "  make setup       - Configure Solana environment (install/verify CLI, set localhost, keypair & airdrop)"
	@echo "  make tracer TX=<sig> - Run SBF bytecode tracer for a given transaction signature"
	@echo "  make clean       - Remove build artifacts and temporary files"

# Start everything (Validator + Express Backend + Vite Frontend)
run:
	@chmod +x scripts/*.sh
	@./scripts/start_all.sh

# Configure Solana environment
setup:
	@chmod +x scripts/*.sh
	@./scripts/setup_solana.sh

# Run local Solana validator only
validator:
	@chmod +x scripts/*.sh
	@./scripts/start_validator.sh

# Run UI backend + frontend simultaneously (assumes validator is already running)
dev:
	@chmod +x scripts/*.sh
	@./scripts/start_dev.sh

# Run SBF bytecode tracer
# Usage: make tracer TX=<signature_hash>
tracer:
ifndef TX
	$(error TX parameter is missing. Usage: make tracer TX=<signature_hash>)
endif
	cargo run --bin sbf_tracer -- $(TX) bytecode.txt

clean:
	cargo clean
	rm -rf ui/dist ui/node_modules/.vite
