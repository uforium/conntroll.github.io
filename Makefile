all:
	webpack
	cp dist/bundle.js dist/bundle.js.src


.PHONY: assets
assets:
	rm -rf assets/
	mkdir -p assets/dist
	cp dist/bundle.js assets/dist/bundle.js
	cp index.html assets/
	assets -d ./assets -package assets -o assets.go -map Assets
