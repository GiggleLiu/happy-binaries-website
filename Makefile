HOST ?= 127.0.0.1
PORT ?= 4321

.DEFAULT_GOAL := help

.PHONY: help install dev build redirects check deploy-local deploy preview serve clean

help:
	@printf '%s\n' 'Targets:'
	@printf '  %-14s %s\n' 'install' 'Install locked npm dependencies'
	@printf '  %-14s %s\n' 'dev' 'Start Astro dev server'
	@printf '  %-14s %s\n' 'build' 'Build production site into dist/'
	@printf '  %-14s %s\n' 'check' 'Build and verify internal links'
	@printf '  %-14s %s\n' 'deploy-local' 'Build, check, and serve production site locally'
	@printf '  %-14s %s\n' 'clean' 'Remove generated Astro output'
	@printf '%s\n' ''
	@printf '%s\n' 'Examples:'
	@printf '  %s\n' 'make deploy-local'
	@printf '  %s\n' 'make deploy-local PORT=8080'

node_modules/.package-lock.json: package.json package-lock.json
	npm ci

install: node_modules/.package-lock.json

dev: install
	npm run dev -- --host $(HOST) --port $(PORT)

build: install
	npm run build

redirects: build
	node scripts/ci-case-redirects.mjs

check: redirects
	npm run check

deploy-local: check
	npm run preview -- --host $(HOST) --port $(PORT)

deploy: deploy-local

preview: deploy-local

serve: deploy-local

clean:
	rm -rf dist .astro
