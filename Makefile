PROJECT_NAME=camerasdiscoverys
CI_BUILDX_ARCHS=linux/amd64,linux/arm64

try:
	echo "building ${PROJECT_NAME}"

servelocal:
	DEPLOY_ENV=dev bash app/serve.sh

pushmultiarch: 
	echo "building multiarch things"
	git push -o ci.variable="CI_BUILDX_ARCHS=${CI_BUILDX_ARCHS}" gl master
	git push -o ci.variable="CI_BUILDX_ARCHS=${CI_BUILDX_ARCHS}" origin master

dockerlocalbuild:
	echo "doing a docker build"
	docker build -t macherlabs/rest-apiserver:latest .