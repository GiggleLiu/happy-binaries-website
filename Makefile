JL = julia --project

default: init serve

init:
	$(JL) -e 'using Pkg; Pkg.activate("."); Pkg.instantiate(); Pkg.precompile()'

serve:
	$(JL) -e 'using Franklin; serve()'

clean:
	rm -rf _build
	rm -rf _gen

.PHONY: init build serve
