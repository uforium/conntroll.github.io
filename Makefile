all:
	webpack

master:
	cp dist/bundle.js dist/bundle.js.src
	git checkout master
  mv dist/bundle.js.src dist/bundle.js 
	git checkout src -- index.html script.js style.css
	git add index.html script.js style.css dist/bundle.js
	git commit && git push && git checkout src || git checkout src

.PHONY: assets
assets:
	rm -rf assets/
	mkdir -p assets/dist
	cp dist/bundle.js assets/dist/bundle.js
	cp style.css script.js index.html assets/
	assets -d ./assets -package assets -o assets.go -map Assets
	git checkout assets
	cp assets.go webui_assets.go
	git add webui_assets.go
	git commit && git push && git checkout src || git checkout src

chrome:
	tar c dist/bundle.js manifest.json index.html chrome-assets background.js style.css script.js > chrome-bundle.tar
