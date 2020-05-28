all:
	./node_modules/.bin/webpack

version:
	./update-version

master:
	cp dist/bundle.js dist/bundle.js.src
	git checkout master
	mv dist/bundle.js.src dist/bundle.js 
	git checkout src -- index.html reset.css script.js style.css cover.png sequence-diagram.svg
	git add index.html script.js style.css reset.css dist/bundle.js
	git commit -m "https://github.com/conntroll/conntroll.github.io/commit/$(shell git rev-parse src)" && git push && git checkout src || git checkout src

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
	git commit -m "https://github.com/conntroll/conntroll.github.io/commit/$(shell git rev-parse src)" && git push && git checkout src || git checkout src

chrome:
	zip - dist/bundle.js reset.css cover.png sequence-diagram.svg manifest.json index.html chrome-assets background.js style.css script.js > chrome-bundle.zip
	tar c dist/bundle.js reset.css cover.png sequence-diagram.svg manifest.json index.html chrome-assets background.js style.css script.js > chrome-bundle.tar

